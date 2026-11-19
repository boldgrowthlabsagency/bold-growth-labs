'use client';
import { useEffect, useRef, useState } from 'react';
import { AREAS, AUDIT_FIELDS, CHOICES, GROUPS, MAX_BOTTLENECKS, OPTIONAL, TEXT, recommend } from '@/lib/audit';

/* ============================================================
   GROWTH AUDIT

   ApplyForm's shape, rebuilt for business owners: one screen,
   tap-first, every answer but the website required so each row
   in the sheet is enough to prepare a call from.

   Same two spam defences — honeypot and time trap, both answered
   with a fake success. The thank-you is not a dead end: it plays
   back the three areas the answers point at, so the owner leaves
   seeing more than "websites".
   ============================================================ */

type State = 'idle' | 'sending' | 'sent' | 'error';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const digits = (s: string) => s.replace(/\D/g, '');
const byId = Object.fromEntries(CHOICES.map((c) => [c.id, c]));

export default function AuditForm() {
  const [v, setV] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<State>('idle');
  const [source, setSource] = useState('');
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
    const q = new URLSearchParams(window.location.search);
    setSource(q.get('src') || q.get('utm_source') || '');
  }, []);

  const str = (id: string) => (Array.isArray(v[id]) ? (v[id] as string[]).join(', ') : ((v[id] as string) || ''));
  const set = (id: string, val: string | string[]) => {
    setV((s) => ({ ...s, [id]: val }));
    setErrors((e) => (e[id] ? { ...e, [id]: '' } : e));
  };
  /* reads the latest state, not the render's: two quick taps on a multi-select
     otherwise keep only the second */
  const toggle = (id: string, o: string, multi?: boolean) => {
    setV((s) => {
      const cur = s[id];
      if (!multi) return { ...s, [id]: cur === o ? '' : o };
      const arr = Array.isArray(cur) ? cur : [];
      if (id === 'bottleneck' && !arr.includes(o) && arr.length >= MAX_BOTTLENECKS) return s;
      return { ...s, [id]: arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o] };
    });
    setErrors((e) => (e[id] ? { ...e, [id]: '' } : e));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bad: Record<string, string> = {};
    if (!str('name').trim()) bad.name = 'Add your name.';
    if (!str('business').trim()) bad.business = 'Add the business name.';
    if (!EMAIL.test(str('email').trim())) bad.email = str('email').trim() ? 'That email does not look right.' : 'Add your email.';
    if (digits(str('phone')).length < 10) bad.phone = 'A number we can call — 10 digits.';
    for (const c of CHOICES) if (!str(c.id)) bad[c.id] = c.multi ? 'Tap at least one.' : 'Tap one.';
    if (!str('fix').trim()) bad.fix = 'One line is plenty.';

    setErrors(bad);
    if (Object.keys(bad).length) {
      document.getElementById(`g-${Object.keys(bad)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setState('sending');
    try {
      const payload: Record<string, string> = {};
      for (const f of AUDIT_FIELDS) payload[f] = str(f);
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          source,
          elapsed: Date.now() - mountedAt.current,
          botcheck: (document.getElementById('audit-bot') as HTMLInputElement)?.value || '',
        }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  };

  useEffect(() => {
    if (state === 'sent') document.getElementById('audit-sent')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [state]);

  if (state === 'sent') {
    const areas = recommend(v);
    return (
      <div id="audit-sent" className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 sm:p-8" role="status" aria-live="polite">
        <p className="eyebrow">Audit requested</p>
        <h2 className="mt-3 text-[length:var(--step-2)] font-extrabold leading-tight">
          Thanks, {str('name').split(' ')[0] || 'friend'}.
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          We&rsquo;ll go through {str('business') || 'your business'} properly and reach out within 24&ndash;48 hours to
          walk you through what we find.
        </p>

        <p className="mt-7 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/50">Where we&rsquo;d look first</p>
        <ol className="mt-3 grid gap-3">
          {areas.map((id, i) => (
            <li key={id} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <span className="mt-0.5 text-[13px] font-bold text-orange">0{i + 1}</span>
              <div>
                <p className="text-[15px] font-semibold">{AREAS[id].title}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{AREAS[id].copy}</p>
              </div>
            </li>
          ))}
        </ol>
        {/* a tally of taps is not an audit — say so, rather than let it read as one */}
        <p className="mt-4 text-[12px] leading-relaxed text-white/40">
          A first read from your answers, not the audit itself. The real one looks at your site, listings and numbers.
        </p>
      </div>
    );
  }

  const input =
    'w-full rounded-xl border bg-white/[0.04] px-4 py-3.5 text-[16px] outline-none transition-colors placeholder:text-white/25 focus:border-orange';
  const field = (id: keyof typeof TEXT, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Text id={id} label={TEXT[id].label} hint={'hint' in TEXT[id] ? (TEXT[id] as { hint: string }).hint : undefined} err={errors[id]}>
      <input id={`g-${id}`} value={str(id)} onChange={(e) => set(id, e.target.value)} {...props}
        className={`${input} ${errors[id] ? 'border-orange' : 'border-white/12'}`} />
    </Text>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-10">
      {/* ---- contact ---- */}
      <Section n={1} title="About you">
        <div className="grid gap-4">
          {/* 16px inputs on purpose: anything smaller and iOS zooms the page on focus */}
          <div className="grid gap-4 sm:grid-cols-2">
            {field('name', { autoComplete: 'name' })}
            {field('business', { autoComplete: 'organization' })}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('email', { type: 'email', inputMode: 'email', autoComplete: 'email' })}
            {field('phone', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '(619) 555-0123' })}
          </div>
          {field('website', { type: 'url', inputMode: 'url', autoComplete: 'url', placeholder: 'yourbusiness.com' })}
        </div>
      </Section>

      {/* ---- the taps, in four short groups ---- */}
      {GROUPS.map((g, gi) => (
        <Section key={g.title} n={gi + 2} title={g.title}>
          <div className="grid gap-7">
            {g.ids.map((id) => {
              const c = byId[id];
              const cur = v[c.id];
              const arr = Array.isArray(cur) ? cur : [];
              const capped = c.id === 'bottleneck' && arr.length >= MAX_BOTTLENECKS;
              return (
                <div key={c.id} id={`g-${c.id}`}>
                  <p className="text-[15px] font-semibold">{c.label}</p>
                  {c.hint && <p className="mt-1 text-[12.5px] leading-relaxed text-white/45">{c.hint}</p>}
                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={c.label}>
                    {c.options.map((o) => {
                      const on = c.multi ? arr.includes(o) : cur === o;
                      const off = capped && !on;
                      return (
                        <button
                          key={o} type="button" aria-pressed={on} disabled={off}
                          onClick={() => toggle(c.id, o, c.multi)}
                          className={`inline-flex min-h-[46px] items-center rounded-full border px-5 text-[14px] transition-colors disabled:opacity-35 ${
                            on ? 'border-orange bg-orange text-white' : 'border-white/15 text-white/75 active:border-white/40'
                          }`}
                        >{o}</button>
                      );
                    })}
                  </div>
                  {errors[c.id] && <p className="mt-2 text-[12.5px] text-orange">{errors[c.id]}</p>}
                </div>
              );
            })}
          </div>
        </Section>
      ))}

      {field('fix', { maxLength: 280 })}

      <input id="audit-bot" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div className="grid gap-3">
        <button
          type="submit" disabled={state === 'sending'}
          className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-orange px-8 text-[15px] font-bold text-white transition-opacity disabled:opacity-60"
        >
          {state === 'sending' ? 'Sending…' : 'Get my growth audit'}
        </button>
        <p className="text-center text-[11.5px] leading-relaxed text-white/40">
          By sending this you agree we can call, text or email you about your audit. Message rates may apply.
        </p>
        {state === 'error' && (
          <p className="text-center text-[13px] text-orange">That didn&rsquo;t send — give it another tap.</p>
        )}
      </div>
    </form>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-5 flex w-full items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50">
        <span className="text-orange">0{n}</span>
        {title}
        <span className="h-px flex-1 bg-white/10" aria-hidden />
      </legend>
      {children}
    </fieldset>
  );
}

function Text({ id, label, hint, err, children }: { id: string; label: string; hint?: string; err?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={`g-${id}`} className="block text-[15px] font-semibold">
        {label}
        {OPTIONAL.has(id) && <span className="ml-2 text-[12px] font-normal text-white/40">optional</span>}
      </label>
      {hint && <p className="mt-1 text-[12.5px] leading-relaxed text-white/45">{hint}</p>}
      <div className="mt-2">{children}</div>
      {err && <p className="mt-2 text-[12.5px] text-orange">{err}</p>}
    </div>
  );
}
