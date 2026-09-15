'use client';
import { useEffect, useRef, useState } from 'react';
import { CHOICES, APPLY_FIELDS } from '@/lib/hiring';

/* ============================================================
   APPOINTMENT CENTER APPLICATION

   One screen, tap-first, for people arriving from an Instagram
   story on their phone. Every question is required, so each
   row in the sheet is complete enough to call from.

   Two cheap spam defences, because a link on social media gets
   found by bots: the usual honeypot, and a time trap — a human
   cannot read and answer this in under three seconds, a script
   does it instantly. Both are answered with a fake success so the
   bot does not retry.
   ============================================================ */

type State = 'idle' | 'sending' | 'sent' | 'error';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const digits = (s: string) => s.replace(/\D/g, '');

export default function ApplyForm() {
  const [v, setV] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<State>('idle');
  const [source, setSource] = useState('');
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
    /* ?src=ig on the story link, so the sheet shows where applicants came from
       once the same page is posted in more than one place. */
    const q = new URLSearchParams(window.location.search);
    setSource(q.get('src') || q.get('utm_source') || '');
  }, []);

  const str = (id: string) => (Array.isArray(v[id]) ? (v[id] as string[]).join(', ') : ((v[id] as string) || ''));
  const set = (id: string, val: string | string[]) => {
    setV((s) => ({ ...s, [id]: val }));
    setErrors((e) => (e[id] ? { ...e, [id]: '' } : e));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bad: Record<string, string> = {};
    if (!str('name').trim()) bad.name = 'Add your name.';
    if (digits(str('phone')).length < 10) bad.phone = 'A number we can call — 10 digits.';
    if (!EMAIL.test(str('email').trim())) bad.email = str('email').trim() ? 'That email does not look right.' : 'Add your email.';
    if (!str('city').trim()) bad.city = 'Add your city.';
    for (const c of CHOICES) if (!str(c.id)) bad[c.id] = c.multi ? 'Tap at least one.' : 'Tap one.';
    if (!str('why').trim()) bad.why = 'One line is plenty.';

    setErrors(bad);
    if (Object.keys(bad).length) {
      document.getElementById(`a-${Object.keys(bad)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setState('sending');
    try {
      const payload: Record<string, string | number> = {};
      for (const f of APPLY_FIELDS) payload[f] = str(f);
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          source,
          elapsed: Date.now() - mountedAt.current,
          botcheck: (document.getElementById('apply-bot') as HTMLInputElement)?.value || '',
        }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  };

  /* The button sits at the bottom of a long form; once it collapses into this
     card the page is far shorter, so bring the message into view. */
  useEffect(() => {
    if (state === 'sent') document.getElementById('apply-sent')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [state]);

  if (state === 'sent') {
    return (
      <div id="apply-sent" className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center" role="status" aria-live="polite">
        <p className="text-4xl" aria-hidden>✓</p>
        <h2 className="mt-4 text-[length:var(--step-2)] font-extrabold leading-tight">You&rsquo;re in.</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Thanks, {str('name').split(' ')[0] || 'friend'}. If it looks like a fit, expect a call or text
          from us soon — keep your phone close.
        </p>
      </div>
    );
  }

  const input =
    'w-full rounded-xl border bg-white/[0.04] px-4 py-3.5 text-[16px] outline-none transition-colors placeholder:text-white/25 focus:border-orange';

  return (
    <form onSubmit={submit} noValidate className="grid gap-7">
      {/* ---- contact ---- */}
      <div className="grid gap-4">
        {/* 16px inputs on purpose: anything smaller and iOS zooms the page on focus */}
        <Text id="name" label="Full name" err={errors.name}>
          <input id="a-name" autoComplete="name" value={str('name')} onChange={(e) => set('name', e.target.value)}
            className={`${input} ${errors.name ? 'border-orange' : 'border-white/12'}`} />
        </Text>
        <Text id="phone" label="Phone" err={errors.phone}>
          <input id="a-phone" type="tel" inputMode="tel" autoComplete="tel" value={str('phone')}
            onChange={(e) => set('phone', e.target.value)} placeholder="(619) 555-0123"
            className={`${input} ${errors.phone ? 'border-orange' : 'border-white/12'}`} />
        </Text>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text id="email" label="Email" err={errors.email}>
            <input id="a-email" type="email" inputMode="email" autoComplete="email" value={str('email')}
              onChange={(e) => set('email', e.target.value)}
              className={`${input} ${errors.email ? 'border-orange' : 'border-white/12'}`} />
          </Text>
          <Text id="city" label="City you live in" err={errors.city}>
            <input id="a-city" autoComplete="address-level2" value={str('city')} onChange={(e) => set('city', e.target.value)}
              className={`${input} ${errors.city ? 'border-orange' : 'border-white/12'}`} />
          </Text>
        </div>
      </div>

      {/* ---- the taps ---- */}
      {CHOICES.map((c) => {
        const cur = v[c.id];
        const arr = Array.isArray(cur) ? cur : [];
        return (
          <div key={c.id} id={`a-${c.id}`}>
            <p className="text-[15px] font-semibold">
              {c.label}
            </p>
            {c.hint && <p className="mt-1 text-[12.5px] leading-relaxed text-white/45">{c.hint}</p>}
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={c.label}>
              {c.options.map((o) => {
                const on = c.multi ? arr.includes(o) : cur === o;
                return (
                  <button
                    key={o} type="button" aria-pressed={on}
                    onClick={() => set(c.id, c.multi ? (on ? arr.filter((x) => x !== o) : [...arr, o]) : on ? '' : o)}
                    className={`inline-flex min-h-[46px] items-center rounded-full border px-5 text-[14px] transition-colors ${
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

      <Text id="why" label="In one line — why you’d be good at this" err={errors.why}>
        <input id="a-why" value={str('why')} onChange={(e) => set('why', e.target.value)} maxLength={280}
          className={`${input} ${errors.why ? 'border-orange' : 'border-white/12'}`} />
      </Text>

      <input id="apply-bot" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div className="grid gap-3">
        <button
          type="submit" disabled={state === 'sending'}
          className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-orange px-8 text-[15px] font-bold text-white transition-opacity disabled:opacity-60"
        >
          {state === 'sending' ? 'Sending…' : 'Apply now'}
        </button>
        {/* consent to be contacted — they are giving a phone number to a team that
            works by calling and texting, so say so before they send it */}
        <p className="text-center text-[11.5px] leading-relaxed text-white/40">
          By applying you agree we can call or text you about this role. Message rates may apply.
        </p>
        {state === 'error' && (
          <p className="text-center text-[13px] text-orange">That didn&rsquo;t send — give it another tap.</p>
        )}
      </div>
    </form>
  );
}

function Text({ id, label, err, children }: { id: string; label: string; err?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={`a-${id}`} className="block text-[15px] font-semibold">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {err && <p className="mt-2 text-[12.5px] text-orange">{err}</p>}
    </div>
  );
}
