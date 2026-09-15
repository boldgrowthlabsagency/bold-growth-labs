'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { INTAKE_STEPS, UPLOAD, type Field } from '@/lib/intake';
import { INBOX } from '@/lib/data';

/* ============================================================
   NEW-BUILD QUESTIONNAIRE

   Six short steps then a dropzone. Answers post to /api/intake;
   files go straight from the browser to Blob storage and only
   their URLs travel with the answers.

   Two deliberate choices:

   · Nothing blocks on the upload. Files are the one part a
     visitor cannot retry easily, so they upload as they are
     dropped and the submit button reports what is still going.

   · Validation only fires on the step you are leaving. Marking
     step 5 invalid while someone is still on step 2 is how forms
     get abandoned.
   ============================================================ */

type Answers = Record<string, string | string[]>;
type Upload = { name: string; size: number; url?: string; pathname?: string; error?: string; pending?: boolean };
type State = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

export default function IntakeForm() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const [files, setFiles] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<State>('idle');
  const [uploadsOff, setUploadsOff] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const last = step === INTAKE_STEPS.length;      // the files screen

  /* A file dropped ANYWHERE outside the dropzone makes the browser navigate to
     that file — which silently destroys every answer typed so far, with no
     warning and no way back. Swallowing drops at the window level is the only
     thing that prevents it; the dropzone's own handler still runs first
     because element listeners fire before this one on the way up. */
  useEffect(() => {
    const swallow = (e: DragEvent) => e.preventDefault();
    /* `dragleave` does not reliably fire when a drag ends off-element or is
       cancelled, so the dragging flag has to be cleared from the window too —
       the submit button is gated on it, and a stuck flag would disable the
       button permanently with nothing on screen explaining why. */
    const clear = (e: DragEvent) => { e.preventDefault(); setDragging(false); };
    window.addEventListener('dragover', swallow);
    window.addEventListener('drop', clear);
    window.addEventListener('dragend', clear);
    return () => {
      window.removeEventListener('dragover', swallow);
      window.removeEventListener('drop', clear);
      window.removeEventListener('dragend', clear);
    };
  }, []);

  /* Ask the upload route whether a store is attached, rather than inferring it
     from a failed upload. The Blob client's thrown error does not carry the
     status code, so string-matching it silently never fired — and a dropzone
     that cannot accept anything is worse than no dropzone. */
  const [probed, setProbed] = useState(false);
  const [confirmNoFiles, setConfirmNoFiles] = useState(false);
  useEffect(() => {
    if (!last || probed) return;
    setProbed(true);
    fetch('/api/intake/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then((r) => setUploadsOff(r.status === 503))
      .catch(() => setUploadsOff(true));
  }, [last, probed]);
  const total = INTAKE_STEPS.length + 1;
  const pct = Math.round(((step + 1) / total) * 100);

  const set = (id: string, v: string | string[]) => {
    setA((s) => ({ ...s, [id]: v }));
    setErrors((e) => (e[id] ? { ...e, [id]: '' } : e));
  };

  const str = (id: string) => (Array.isArray(a[id]) ? (a[id] as string[]).join(', ') : (a[id] as string) || '');

  /* ---------- uploads ---------------------------------------------------- */

  const upload = useCallback(async (list: FileList | File[]) => {
    const incoming = Array.from(list);
    setFiles((cur) => {
      const room = UPLOAD.maxFiles - cur.length;
      return [...cur, ...incoming.slice(0, Math.max(0, room)).map((f) => ({ name: f.name, size: f.size, pending: true }))];
    });

    const { upload: put } = await import('@vercel/blob/client');

    for (const file of incoming.slice(0, UPLOAD.maxFiles)) {
      const mark = (patch: Partial<Upload>) =>
        setFiles((cur) => cur.map((u) => (u.name === file.name && u.size === file.size ? { ...u, ...patch } : u)));

      if (file.size > UPLOAD.maxBytes) {
        mark({ pending: false, error: `Too big (${kb(file.size)}) — 25 MB max` });
        continue;
      }
      try {
        const blob = await put(file.name, file, {
          access: 'private',
          handleUploadUrl: '/api/intake/upload',
        });
        mark({ pending: false, url: blob.url, pathname: blob.pathname });
        setConfirmNoFiles(false);
      } catch {
        mark({ pending: false, error: 'Upload failed' });
      }
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) upload(e.dataTransfer.files);
  };

  /* ---------- step movement ---------------------------------------------- */

  const validate = () => {
    if (last) return true;
    const bad: Record<string, string> = {};
    for (const f of INTAKE_STEPS[step].fields) {
      if (!f.required) continue;
      if (!str(f.id).trim()) bad[f.id] = 'This one we do need.';
      else if (f.kind === 'email' && !EMAIL.test(str(f.id).trim())) bad[f.id] = 'That email does not look right.';
    }
    setErrors(bad);
    if (Object.keys(bad).length) {
      document.getElementById(`f-${Object.keys(bad)[0]}`)?.focus();
      return false;
    }
    return true;
  };

  const go = (dir: 1 | -1) => {
    if (dir === 1 && !validate()) return;
    setStep((s) => Math.min(total - 1, Math.max(0, s + dir)));
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    /* Never send silently from the files screen with nothing attached. The one
       purpose of this screen is files, so an empty submit is far more likely to
       be a mis-click or a stray keypress than a decision — and once it is sent
       the visitor cannot add anything. One deliberate second click. */
    const attached = files.filter((f) => f.url).length;
    if (!uploadsOff && attached === 0 && !confirmNoFiles) {
      setConfirmNoFiles(true);
      return;
    }

    setState('sending');
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...a,
          files: files.filter((f) => f.url).map((f) => ({ name: f.name, url: f.url, pathname: f.pathname })),
          botcheck: (document.getElementById('bot-i') as HTMLInputElement)?.value || '',
        }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  };

  /* ---------- done ------------------------------------------------------- */

  if (state === 'sent') {
    return (
      <div className="mx-auto max-w-[640px] rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center" role="status" aria-live="polite">
        <p className="text-4xl" aria-hidden>✓</p>
        <h2 className="mt-5 text-[length:var(--step-2)] font-extrabold leading-tight">That is everything we need to start.</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          It has landed with us along with {files.filter((f) => f.url).length} file
          {files.filter((f) => f.url).length === 1 ? '' : 's'}. You will hear back within one
          working day — usually with a couple of follow-up questions and a first direction.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-[720px]">
      <div ref={topRef} className="scroll-mt-28" />

      {/* progress */}
      <div className="mb-10">
        <div className="flex items-end justify-between text-[11px] uppercase tracking-[0.22em] text-white/40">
          <span>{last ? 'Files' : `${INTAKE_STEPS[step].n} — ${INTAKE_STEPS[step].title}`}</span>
          <span>{step + 1} / {total}</span>
        </div>
        <div className="mt-3 h-px w-full bg-white/12">
          <div className="h-px bg-orange transition-[width] duration-500 ease-expo" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {!last ? (
        <>
          <p className="mb-9 text-[15px] leading-relaxed text-muted">{INTAKE_STEPS[step].blurb}</p>
          <div className="grid gap-7">
            {INTAKE_STEPS[step].fields.map((f) => (
              <Row key={f.id} f={f} value={a[f.id]} err={errors[f.id]} onChange={(v) => set(f.id, v)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-[length:var(--step-2)] font-extrabold leading-tight">Drop in anything you have.</h2>
          <p className="mt-4 mb-8 text-[15px] leading-relaxed text-muted">{UPLOAD.blurb}</p>

          {uploadsOff ? (
            <p className="rounded-xl border border-orange/40 bg-orange/10 p-5 text-[14px] leading-relaxed">
              File uploads are not switched on yet. Finish the form and email your files to{' '}
              <a className="underline" href={`mailto:${INBOX}`}>{INBOX}</a> — nothing you have typed will be lost.
            </p>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border border-dashed p-12 text-center transition-colors ${
                dragging ? 'border-orange bg-orange/10' : 'border-white/20 bg-white/[0.02] hover:border-white/40'
              }`}
            >
              <p className="text-[15px] font-semibold">Drag files here</p>
              <p className="mt-2 text-[13px] text-muted">or click to choose — up to {UPLOAD.maxFiles} files, 25 MB each</p>
              <input
                ref={inputRef} type="file" multiple hidden accept={UPLOAD.accept.join(',')}
                onChange={(e) => e.target.files && upload(e.target.files)}
              />
            </div>
          )}

          {files.length > 0 && !uploadsOff && (
            <ul className="mt-6 grid gap-2">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px]">
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className={`shrink-0 text-[11px] uppercase tracking-[0.16em] ${f.error ? 'text-orange' : 'text-white/40'}`}>
                    {f.pending ? 'Uploading…' : f.error ? f.error : kb(f.size)}
                  </span>
                  <button
                    type="button" aria-label={`Remove ${f.name}`}
                    onClick={(e) => { e.stopPropagation(); setFiles((c) => c.filter((_, j) => j !== i)); }}
                    className="shrink-0 text-white/40 transition-colors hover:text-white"
                  >✕</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* honeypot */}
      <input id="bot-i" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div className="mt-11 flex flex-wrap items-center gap-4 border-t border-white/10 pt-7">
        {step > 0 && (
          <button type="button" onClick={() => go(-1)} className="inline-flex min-h-[48px] items-center rounded-full border border-white/20 px-6 text-[13px] font-semibold transition-colors hover:border-white/50">
            Back
          </button>
        )}
        {!last ? (
          <button type="button" onClick={() => go(1)} className="inline-flex min-h-[48px] items-center rounded-full bg-orange px-8 text-[13px] font-semibold text-white transition-opacity hover:opacity-90">
            Continue
          </button>
        ) : (
          <button type="submit" disabled={state === 'sending' || dragging || files.some((f) => f.pending)} className="inline-flex min-h-[48px] items-center rounded-full bg-orange px-8 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {state === 'sending' ? 'Sending…' : files.some((f) => f.pending) ? 'Waiting for uploads…' : 'Send it over'}
          </button>
        )}
        {!last && <span className="text-[12px] text-white/35">Takes about four minutes.</span>}
        {confirmNoFiles && state === 'idle' && (
          <p className="w-full text-[13px] leading-relaxed text-white/70">
            Nothing is attached yet — drop your files above, or press
            <strong className="text-white"> Send it over </strong>
            again to send without them.
          </p>
        )}
        {state === 'error' && (
          <p className="w-full text-[13px] text-orange">
            That did not send. Try again, or email <a className="underline" href={`mailto:${INBOX}`}>{INBOX}</a>.
          </p>
        )}
      </div>
    </form>
  );
}

/* ---------- one question ------------------------------------------------- */

function Row({ f, value, err, onChange }: { f: Field; value: string | string[] | undefined; err?: string; onChange: (v: string | string[]) => void }) {
  const id = `f-${f.id}`;
  const arr = Array.isArray(value) ? value : [];
  const base = 'w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-[15px] outline-none transition-colors placeholder:text-white/25 focus:border-orange';
  const border = err ? 'border-orange' : 'border-white/12';

  return (
    <div>
      <label htmlFor={id} className="block text-[14px] font-semibold">
        {f.label}{!f.required && <span className="ml-2 text-[11px] font-normal uppercase tracking-[0.16em] text-white/30">optional</span>}
      </label>
      {f.hint && <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/40">{f.hint}</p>}

      <div className="mt-3">
        {f.kind === 'textarea' ? (
          <textarea id={id} rows={f.rows ?? 3} placeholder={f.placeholder} value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)} className={`${base} ${border} resize-y leading-relaxed`} />
        ) : f.kind === 'chips' || f.kind === 'multi' ? (
          <div className="flex flex-wrap gap-2" id={id} role="group" aria-label={f.label}>
            {f.options!.map((o) => {
              const on = f.kind === 'multi' ? arr.includes(o) : value === o;
              return (
                <button
                  key={o} type="button" aria-pressed={on}
                  onClick={() => onChange(f.kind === 'multi' ? (on ? arr.filter((x) => x !== o) : [...arr, o]) : on ? '' : o)}
                  className={`inline-flex min-h-[44px] items-center rounded-full border px-5 text-[13px] transition-colors ${
                    on ? 'border-orange bg-orange text-white' : 'border-white/15 text-white/70 hover:border-white/40'
                  }`}
                >{o}</button>
              );
            })}
          </div>
        ) : (
          <input id={id} type={f.kind} placeholder={f.placeholder} value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)} className={`${base} ${border}`}
            autoComplete={f.id === 'email' ? 'email' : f.id === 'phone' ? 'tel' : f.id === 'name' ? 'name' : 'off'} />
        )}
      </div>

      {err && <p className="mt-2 text-[12.5px] text-orange">{err}</p>}
    </div>
  );
}
