'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SECTIONS, DEVICES, PRIORITIES, DECISIONS, ROUND_OPTIONS, SHOT, ASSETS, EXAMPLE,
  emptyRequest, type RevisionRequest, type Asset,
} from '@/lib/revisions';
import { INBOX } from '@/lib/data';

/* ============================================================
   REVISION REQUESTS

   A repeating list, not a questionnaire. The client adds one
   block per change, and the whole lot arrives as a single
   submission — eight items in one place beats eight texts over
   three days, which is the actual problem being solved.

   Screenshots go straight from the browser to Blob storage using
   the questionnaire's signing route. That route only mints a
   short-lived token and enforces the limits server-side, so it is
   deliberately reused rather than copied — duplicating the one
   piece of security-critical code here would be the wrong kind of
   tidy.

   The list is saved to the client's own browser as they type. A
   client working through a site on a phone gets interrupted — a
   call comes in, the tab is dropped — and losing eleven carefully
   written changes is the one thing that would send them back to
   texting us. Uploaded files are not restored (the blob reference
   would outlive the page), so the draft keeps text only.
   ============================================================ */

const DRAFT = 'bgl-revisions-draft-v1';

type State = 'idle' | 'sending' | 'sent' | 'error';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RevisionForm() {
  const [client, setClient] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [decision, setDecision] = useState('');
  const [round, setRound] = useState(ROUND_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<RevisionRequest[]>([emptyRequest()]);
  const [busy, setBusy] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<State>('idle');
  const [uploadsOff, setUploadsOff] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dragging, setDragging] = useState(false);
  const [restored, setRestored] = useState(false);
  const assetInput = useRef<HTMLInputElement>(null);
  const listEnd = useRef<HTMLDivElement>(null);
  /* State, not a ref: the save effect must not run until the restored values
     have actually been committed. With a ref it runs in the same commit as the
     restore, writing the still-empty initial rows back over the draft — which
     ate a restored list exactly once before this was caught. */
  const [hydrated, setHydrated] = useState(false);

  /* Restore a draft, if there is one. Runs before the save effect can write,
     so an empty first render never wipes what is stored. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.client) setClient(d.client);
        if (d.name) setName(d.name);
        if (d.email) setEmail(d.email);
        if (d.decision) setDecision(d.decision);
        if (d.round) setRound(d.round);
        if (d.notes) setNotes(d.notes);
        if (Array.isArray(d.rows) && d.rows.length) setRows(d.rows);
        if (d.rows?.some((r: RevisionRequest) => r.detail?.trim()) || d.client) setRestored(true);
      }
    } catch {
      /* a blocked or full store is not worth a message */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      /* text only — a screenshot's blob reference would not survive the page */
      const strip = rows.map(({ page, section, device, priority, detail }) => ({
        page, section, device, priority, detail,
      }));
      localStorage.setItem(DRAFT, JSON.stringify({ client, name, email, decision, round, notes, rows: strip }));
    } catch {
      /* ignore */
    }
  }, [hydrated, client, name, email, decision, round, notes, rows]);

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT); } catch { /* ignore */ }
  };

  const startFresh = () => {
    clearDraft();
    setClient(''); setName(''); setEmail(''); setDecision(''); setRound(ROUND_OPTIONS[0]);
    setNotes(''); setRows([emptyRequest()]); setAssets([]); setErrors({}); setRestored(false);
  };

  /* Ask the signing route whether a store is attached, rather than waiting for
     an upload to fail. A dropzone that cannot accept anything is worse than no
     dropzone — same reasoning as the questionnaire. */
  useEffect(() => {
    fetch('/api/intake/upload', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    })
      .then((r) => setUploadsOff(r.status === 503))
      .catch(() => setUploadsOff(true));
  }, []);

  /* A file dropped anywhere but a dropzone makes the browser navigate to it,
     which destroys every request typed so far. Same trap as IntakeForm. */
  useEffect(() => {
    const swallow = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', swallow);
    window.addEventListener('drop', swallow);
    return () => {
      window.removeEventListener('dragover', swallow);
      window.removeEventListener('drop', swallow);
    };
  }, []);

  const patch = (i: number, p: Partial<RevisionRequest>) =>
    setRows((r) => r.map((row, k) => (k === i ? { ...row, ...p } : row)));

  const addRow = () => {
    setRows((r) => [...r, emptyRequest()]);
    window.setTimeout(() => listEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };

  const removeRow = (i: number) =>
    setRows((r) => (r.length === 1 ? [emptyRequest()] : r.filter((_, k) => k !== i)));

  const attach = useCallback(async (i: number, file: File) => {
    if (file.size > SHOT.maxBytes) {
      patch(i, { shotName: `${file.name} — too big (12 MB max)`, shotUrl: undefined, shotPath: undefined });
      return;
    }
    setBusy((b) => ({ ...b, [i]: true }));
    try {
      const { upload: put } = await import('@vercel/blob/client');
      const blob = await put(file.name, file, {
        access: 'private',
        handleUploadUrl: '/api/intake/upload',
      });
      patch(i, { shotUrl: blob.url, shotPath: blob.pathname, shotName: file.name });
    } catch {
      patch(i, { shotName: `${file.name} — upload failed` });
    } finally {
      setBusy((b) => ({ ...b, [i]: false }));
    }
  }, []);

  const addAssets = useCallback(async (list: FileList | File[]) => {
    const incoming = Array.from(list);
    setAssets((cur) => {
      const room = ASSETS.maxFiles - cur.length;
      return [...cur, ...incoming.slice(0, Math.max(0, room)).map((f) => ({ name: f.name, pending: true }))];
    });

    const { upload: put } = await import('@vercel/blob/client');
    for (const file of incoming.slice(0, ASSETS.maxFiles)) {
      const mark = (patch: Partial<Asset>) =>
        setAssets((cur) => cur.map((a) => (a.name === file.name ? { ...a, ...patch } : a)));
      if (file.size > ASSETS.maxBytes) {
        mark({ pending: false, error: 'Too big — 25 MB max' });
        continue;
      }
      try {
        const blob = await put(file.name, file, { access: 'private', handleUploadUrl: '/api/intake/upload' });
        mark({ pending: false, url: blob.url, pathname: blob.pathname });
      } catch {
        mark({ pending: false, error: 'Upload failed' });
      }
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addAssets(e.dataTransfer.files);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bad: Record<string, string> = {};
    if (!client.trim()) bad.client = 'Which site is this for?';
    if (!name.trim()) bad.name = 'Please add your name.';
    if (!email.trim() || !EMAIL.test(email.trim())) bad.email = 'A working email, so we can reply.';
    if (!decision) bad.decision = 'Pick one — it tells us whether to publish.';

    /* An empty list is only a problem when they are asking for changes. Someone
       approving as-is has nothing to list, and blocking them would be absurd. */
    const filled = rows.filter((r) => r.detail.trim());
    if (decision === DECISIONS[1] && filled.length === 0) {
      bad.rows = 'Add at least one change, or switch to “Approved — publish as is”.';
    }

    /* A block with a page, a chip or a screenshot but no description would be
       dropped on send without a word — including the file they just waited for.
       Say so instead of silently losing it. */
    const started = rows.findIndex(
      (r) => !r.detail.trim() && (r.page.trim() || r.section || r.device || r.priority || r.shotPath),
    );
    if (started > -1) {
      bad.rows = `Change ${started + 1} has nothing written in it yet — say what should change, or remove it.`;
    }

    setErrors(bad);
    if (Object.keys(bad).length) {
      document.getElementById(`f-${Object.keys(bad)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setState('sending');
    try {
      const res = await fetch('/api/revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client, name, email, decision, round, notes,
          requests: filled,
          assets: assets.filter((a) => a.url).map((a) => ({ name: a.name, url: a.url, pathname: a.pathname })),
          botcheck: (document.getElementById('rev-bot') as HTMLInputElement)?.value || '',
        }),
      });
      if (res.ok) clearDraft();
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  };

  if (state === 'sent') {
    const n = rows.filter((r) => r.detail.trim()).length;
    return (
      <div className="mx-auto max-w-[640px] rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center" role="status" aria-live="polite">
        <p className="text-4xl" aria-hidden>✓</p>
        <h2 className="mt-5 text-[length:var(--step-2)] font-extrabold leading-tight">Got it.</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          {n > 0
            ? `${n} ${n === 1 ? 'change is' : 'changes are'} in front of us, along with your decision.`
            : 'Your decision is logged.'}{' '}
          {assets.filter((a) => a.url).length > 0 &&
            `${assets.filter((a) => a.url).length} file${assets.filter((a) => a.url).length === 1 ? '' : 's'} came through with it. `}
          You will hear back within one working day with what we are doing and when.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-[820px]">
      {restored && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-4 text-[13px]">
          <span className="text-white/70">We kept what you had typed last time.</span>
          <button type="button" onClick={startFresh} className="underline underline-offset-2 hover:text-orange">
            Start fresh
          </button>
        </div>
      )}

      {/* ---- who, and the decision ---- */}
      <section className="rv-panel">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="client" label="Which site is this for?" err={errors.client}>
            <input id="f-client" value={client} onChange={(e) => setClient(e.target.value)} className="rv-input" placeholder="Business name" />
          </Field>
          <Field id="round" label="Revision round">
            <div className="rv-chips">
              {ROUND_OPTIONS.map((r) => (
                <Chip key={r} on={round === r} onClick={() => setRound(r)}>{r}</Chip>
              ))}
            </div>
          </Field>
          <Field id="name" label="Your name" err={errors.name}>
            <input id="f-name" value={name} onChange={(e) => setName(e.target.value)} className="rv-input" autoComplete="name" />
          </Field>
          <Field id="email" label="Email" err={errors.email}>
            <input id="f-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rv-input" autoComplete="email" />
          </Field>
        </div>

        <div id="f-decision" className="mt-8">
          <p className="rv-label">Where are you at?</p>
          <p className="rv-hint">This is the part that decides whether we publish, so it is worth a moment.</p>
          <div className="mt-4 grid gap-2">
            {DECISIONS.map((d) => (
              <button
                key={d} type="button" onClick={() => setDecision(d)}
                aria-pressed={decision === d}
                className={`rv-decision${decision === d ? ' is-on' : ''}`}
              >
                <span className="rv-decision__dot" aria-hidden />
                {d}
              </button>
            ))}
          </div>
          {errors.decision && <p className="rv-err">{errors.decision}</p>}
        </div>
      </section>

      {/* ---- the list ---- */}
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[length:var(--step-1)] font-extrabold">What needs changing</h2>
            <p className="rv-hint mt-1">
              One block per change. Telling us the page and the spot saves a round trip —
              &ldquo;hero, the line under the headline&rdquo; beats &ldquo;the text&rdquo;.
            </p>
          </div>
          <span className="rv-count">{rows.filter((r) => r.detail.trim()).length} listed</span>
        </div>

        {errors.rows && <p id="f-rows" className="rv-err mb-4">{errors.rows}</p>}

        <div className="grid gap-4">
          {rows.map((r, i) => (
            <article key={i} className="rv-req">
              <header className="rv-req__head">
                <span className="rv-req__n">{String(i + 1).padStart(2, '0')}</span>
                <button type="button" onClick={() => removeRow(i)} className="rv-req__x" aria-label={`Remove request ${i + 1}`}>
                  Remove
                </button>
              </header>

              <div className="grid gap-4">
                <label className="rv-sub">
                  Page
                  <input
                    value={r.page} onChange={(e) => patch(i, { page: e.target.value })}
                    className="rv-input" placeholder="Home, or paste the link"
                  />
                </label>

                <div>
                  <span className="rv-sub">Section</span>
                  <div className="rv-chips mt-2">
                    {SECTIONS.map((sname) => (
                      <Chip key={sname} on={r.section === sname} onClick={() => patch(i, { section: r.section === sname ? '' : sname })}>
                        {sname}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="rv-sub">Seen on</span>
                    <div className="rv-chips mt-2">
                      {DEVICES.map((d) => (
                        <Chip key={d} on={r.device === d} onClick={() => patch(i, { device: r.device === d ? '' : d })}>{d}</Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="rv-sub">How important</span>
                    <div className="rv-chips mt-2">
                      {PRIORITIES.map((pr) => (
                        <Chip key={pr} on={r.priority === pr} onClick={() => patch(i, { priority: r.priority === pr ? '' : pr })}>{pr}</Chip>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="rv-sub" htmlFor={`detail-${i}`}>
                    What should change?
                  </label>
                  <textarea
                    id={`detail-${i}`}
                    rows={3} value={r.detail} onChange={(e) => patch(i, { detail: e.target.value })}
                    className="rv-input resize-y leading-relaxed"
                    placeholder="Say it however you would say it out loud."
                  />
                  {/* the example sits where the writing happens, which is the only
                      place it is any use */}
                  {i === 0 && (
                    <div className="rv-eg">
                      <p><span className="rv-eg__y" aria-hidden>✓</span> {EXAMPLE.good}</p>
                      <p className="mt-2 text-white/35"><span className="rv-eg__n" aria-hidden>✕</span> {EXAMPLE.vague}</p>
                    </div>
                  )}
                </div>

                {!uploadsOff && (
                  <div>
                    <span className="rv-sub">Screenshot</span>
                    <label className="rv-shot">
                      <input
                        type="file" hidden accept={SHOT.accept.join(',')}
                        onChange={(e) => e.target.files?.[0] && attach(i, e.target.files[0])}
                      />
                      {busy[i] ? 'Uploading…' : r.shotName ? r.shotName : 'Add a screenshot — optional, but it settles most things instantly'}
                    </label>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div ref={listEnd} />
        <button type="button" onClick={addRow} className="rv-add">+ Add another change</button>
      </section>

      {/* ---- new material ---- */}
      {!uploadsOff && (
        <section className="mt-12">
          <h2 className="text-[length:var(--step-1)] font-extrabold">New files for the site</h2>
          <p className="rv-hint mt-1 max-w-[62ch]">{ASSETS.blurb}</p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => assetInput.current?.click()}
            className={`rv-drop${dragging ? ' is-over' : ''}`}
          >
            <p className="rv-drop__t">Drag files here</p>
            <p className="rv-drop__s">or click to choose — up to {ASSETS.maxFiles} files, 25 MB each</p>
            <input
              ref={assetInput} type="file" multiple hidden accept={ASSETS.accept.join(',')}
              onChange={(e) => e.target.files && addAssets(e.target.files)}
            />
          </div>

          {assets.length > 0 && (
            <ul className="mt-4 grid gap-2">
              {assets.map((a, i) => (
                <li key={`${a.name}-${i}`} className="rv-file">
                  <span className="min-w-0 flex-1 truncate">{a.name}</span>
                  <span className={`shrink-0 text-[11px] uppercase tracking-[0.16em] ${a.error ? 'text-orange' : 'text-white/40'}`}>
                    {a.pending ? 'Uploading…' : a.error ? a.error : 'Added'}
                  </span>
                  <button
                    type="button" aria-label={`Remove ${a.name}`}
                    onClick={(e) => { e.stopPropagation(); setAssets((c) => c.filter((_, k) => k !== i)); }}
                    className="rv-file__x"
                  >✕</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ---- anything else ---- */}
      <section className="mt-10">
        <label className="rv-sub">
          Anything else? <span className="rv-optional">optional</span>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="rv-input resize-y leading-relaxed" />
        </label>
      </section>

      <input id="rev-bot" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      {uploadsOff && (
        <p className="mt-8 rounded-xl border border-orange/40 bg-orange/10 p-5 text-[14px] leading-relaxed">
          File uploads are not switched on. Send screenshots and any new files to{' '}
          <a className="underline" href={`mailto:${INBOX}`}>{INBOX}</a> — everything you have typed still sends.
        </p>
      )}

      {/* On a phone the send button is a long way below the last change, so the
          count and the button follow the client down the page. */}
      <div className="rv-bar md:hidden" aria-hidden={state === 'sending'}>
        <span className="text-[12.5px] text-white/60">
          {rows.filter((r) => r.detail.trim()).length} change
          {rows.filter((r) => r.detail.trim()).length === 1 ? '' : 's'} listed
        </span>
        <button
          type="submit"
          disabled={state === 'sending' || Object.values(busy).some(Boolean) || assets.some((a) => a.pending)}
          className="inline-flex min-h-[44px] items-center rounded-full bg-orange px-6 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          {state === 'sending' ? 'Sending…' : 'Send'}
        </button>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-white/10 pt-7">
        <button
          type="submit"
          disabled={state === 'sending' || Object.values(busy).some(Boolean) || assets.some((a) => a.pending)}
          className="inline-flex min-h-[48px] items-center rounded-full bg-orange px-8 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === 'sending' ? 'Sending…' : (Object.values(busy).some(Boolean) || assets.some((a) => a.pending)) ? 'Waiting for uploads…' : 'Send this over'}
        </button>
        <span className="text-[12.5px] text-white/40">Saved in this browser as you type.</span>
        {state === 'error' && (
          <p className="w-full text-[13px] text-orange">
            That did not send. Try again, or email <a className="underline" href={`mailto:${INBOX}`}>{INBOX}</a>.
          </p>
        )}
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- */

function Field({ id, label, err, children }: { id: string; label: string; err?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={`f-${id}`} className="rv-label">{label}</label>
      <div className="mt-2">{children}</div>
      {err && <p className="rv-err">{err}</p>}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={`rv-chip${on ? ' is-on' : ''}`}>
      {children}
    </button>
  );
}
