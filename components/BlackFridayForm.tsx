'use client';
import { useEffect, useRef, useState } from 'react';
import { BF, BTC, REFERRAL, SALE_PLANS, bonusesFor, deposit, isBtcCode, money, refLink } from '@/lib/blackfriday';
import { PHONE, PHONE_DISPLAY } from '@/lib/data';
import FileDrop, { type DroppedFile } from './FileDrop';

/* ============================================================
   BLACK FRIDAY BOOKING

   Built to be finished in under a minute on a phone: one tap for
   the plan, four fields, one button. Website, referral and notes
   are optional — every extra required field is a booking lost.

   `?plan=` pre-selects a plan (the homepage cards link with it) and
   `?ref=` records who referred them, so a shared link carries the
   credit with it and the friend never has to remember a name. There is
   no "who sent you?" field: only someone arriving on a referral link
   sees who referred them, as a read-only note.
   `?code=` pre-fills a member code — the link sent to BTC members
   carries it, so they never have to type it.

   The confirmation is where the referral ask lives: the moment
   someone has just said yes is when they are most willing to pass
   it on, so it hands them their own link, ready to send.
   ============================================================ */

type State = 'idle' | 'sending' | 'sent' | 'error' | 'ended';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const digits = (s: string) => s.replace(/\D/g, '');

/* `member` is the /btc page: the committee code is applied up front and the
   code field is replaced by a note saying so. */
export default function BlackFridayForm({ member = false }: { member?: boolean }) {
  const [v, setV] = useState<Record<string, string>>({ plan: SALE_PLANS[0].id, ...(member ? { code: BTC.code } : {}) });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<State>('idle');
  const [source, setSource] = useState('');
  const [copied, setCopied] = useState(false);
  /* /btc only: brand files and photos, uploaded straight to the private store */
  const [files, setFiles] = useState<DroppedFile[]>([]);
  const uploading = files.some((f) => f.pending);
  const attached = files.filter((f) => f.url);
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
    const q = new URLSearchParams(window.location.search);
    setSource(q.get('src') || q.get('utm_source') || '');
    const plan = q.get('plan');
    const ref = q.get('ref');
    const code = q.get('code');
    setV((s) => ({
      ...s,
      ...(plan && SALE_PLANS.some((p) => p.id === plan) ? { plan } : {}),
      ...(ref ? { referredBy: ref.replace(/-/g, ' ').slice(0, 60) } : {}),
      ...(code ? { code: code.slice(0, 20) } : {}),
    }));
  }, []);

  const set = (id: string, val: string) => {
    setV((s) => ({ ...s, [id]: val }));
    setErrors((e) => (e[id] ? { ...e, [id]: '' } : e));
  };
  const plan = SALE_PLANS.find((p) => p.id === v.plan) ?? SALE_PLANS[0];
  const btc = isBtcCode(v.code);
  const bonuses = bonusesFor(plan.id, v.code);
  const bonusTotal = bonuses.reduce((n, b) => n + b.value, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bad: Record<string, string> = {};
    if (!v.name?.trim()) bad.name = 'Add your name.';
    if (!v.business?.trim()) bad.business = 'Add the business name.';
    if (!EMAIL.test(v.email?.trim() || '')) bad.email = v.email?.trim() ? 'That email does not look right.' : 'Add your email.';
    if (digits(v.phone || '').length < 10) bad.phone = 'A number we can text — 10 digits.';
    /* committee members are buying a refresh of a site, so we need to see it first */
    if (member && !v.website?.trim()) bad.website = 'Add your current website, or type “none”.';
    if (v.code?.trim() && !btc) bad.code = 'That code isn’t right. Check it, or leave it blank.';
    setErrors(bad);
    if (Object.keys(bad).length) {
      document.getElementById(`bf-${Object.keys(bad)[0]}`)?.focus();
      return;
    }

    setState('sending');
    try {
      const res = await fetch('/api/black-friday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...v,
          files: attached.map((f) => ({ name: f.name, url: f.url, pathname: f.pathname })),
          source,
          elapsed: Date.now() - mountedAt.current,
          botcheck: (document.getElementById('bf-bot') as HTMLInputElement)?.value || '',
        }),
      });
      if (res.status === 410) return setState('ended');
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  };

  useEffect(() => {
    if (state === 'sent') document.getElementById('bf-sent')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [state]);

  if (state === 'ended') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7" role="status">
        <p className="text-[15px] leading-relaxed text-muted">
          The Black Friday special has ended. Call <a className="text-orange underline" href={`tel:${PHONE}`}>{PHONE_DISPLAY}</a> and
          we&rsquo;ll see what we can do.
        </p>
      </div>
    );
  }

  if (state === 'sent') {
    const first = v.name.split(' ')[0] || 'friend';
    const link = refLink(v.name);
    const shareText = `I just booked my website with BOLD Growth Labs. This link gets you $${REFERRAL.give} off your build:`;
    const share = async () => {
      if (navigator.share) {
        try { await navigator.share({ title: 'BOLD Growth Labs Black Friday', text: shareText, url: link }); } catch { /* dismissed */ }
        return;
      }
      try {
        await navigator.clipboard.writeText(`${shareText} ${link}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      } catch { /* clipboard blocked — the link is on screen to copy by hand */ }
    };

    return (
      <div id="bf-sent" className="grid gap-5" role="status" aria-live="polite">
        <div className="rounded-2xl border border-orange/40 bg-white/[0.03] p-7 sm:p-8">
          <p className="eyebrow">Spot held</p>
          <h2 className="mt-3 text-[length:var(--step-2)] font-extrabold leading-tight">You&rsquo;re in, {first}.</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Your {plan.name} is locked at <strong className="text-white">{money(plan.now)}</strong>. We&rsquo;re holding
            your spot for {BF.holdHours} hours. A {money(deposit(plan.now))} deposit makes it yours, and the build can
            start now or be scheduled for later.
          </p>
          {bonuses.length > 0 && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50">
                {btc ? `Included with your ${BTC.name} booking` : 'Included with your booking'}
              </p>
              <ul className="mt-3 grid gap-1.5 text-[14px] text-white/85">
                {bonuses.map((b) => (
                  <li key={b.label}>✓ {b.label}{b.value ? <span className="text-white/45"> — {money(b.value)} value</span> : null}</li>
                ))}
              </ul>
              <p className="mt-3 text-[12.5px] text-white/50">
                We&rsquo;ve emailed this to {v.email} so you have it in writing.
                {attached.length > 0 && <> We also received your {attached.length} file{attached.length === 1 ? '' : 's'}.</>}
              </p>
            </div>
          )}
          {BF.depositUrl ? (
            <a href={BF.depositUrl} target="_blank" rel="noopener"
              className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-orange px-8 text-[15px] font-bold text-white">
              Pay my {money(deposit(plan.now))} deposit
            </a>
          ) : (
            <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-[14px] leading-relaxed text-white/80">
              We&rsquo;ll text and email your deposit link to {v.phone} shortly. Questions before then? Call{' '}
              <a className="text-orange underline" href={`tel:${PHONE}`}>{PHONE_DISPLAY}</a>.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 sm:p-8">
          <p className="eyebrow">Know someone who needs this?</p>
          <h3 className="mt-3 text-[length:var(--step-1)] font-extrabold leading-tight">
            Give ${REFERRAL.give}. Get ${REFERRAL.get}.
          </h3>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            Send this link to a business owner you know. They get ${REFERRAL.give} off our regular pricing, and you
            get ${REFERRAL.get} for every friend who books. No limit.
          </p>
          {btc && (
            <div className="mt-5 rounded-xl border border-orange/40 bg-orange/10 p-4">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-orange">{BTC.name} referral rewards</p>
              <p className="mt-1.5 text-[13px] text-white/70">On top of ${REFERRAL.get} each, these add up as your referrals book:</p>
              <ul className="mt-3 grid gap-2 text-[14px] text-white/85">
                {BTC.referralTiers.map((t) => (
                  <li key={t.at} className="flex gap-3">
                    <span className="w-[86px] shrink-0 font-bold text-orange">{t.when}</span>
                    <span>{t.reward} <span className="text-white/45">— {money(t.value)} value</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-5 break-all rounded-xl border border-white/12 bg-black/20 px-4 py-3 font-mono text-[13px] text-white/80">{link}</p>
          <button type="button" onClick={share}
            className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-full border border-white/25 px-8 text-[14px] font-bold text-white">
            {copied ? 'Copied — paste it anywhere' : 'Share my link'}
          </button>
        </div>
      </div>
    );
  }

  const input =
    'w-full rounded-xl border bg-white/[0.04] px-4 py-3.5 text-[16px] outline-none transition-colors placeholder:text-white/25 focus:border-orange';
  const field = (id: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, optional = false) => (
    <div>
      <label htmlFor={`bf-${id}`} className="block text-[14.5px] font-semibold">
        {label}{optional && <span className="ml-2 text-[12px] font-normal text-white/40">optional</span>}
      </label>
      {/* 16px inputs on purpose: anything smaller and iOS zooms the page on focus */}
      <input id={`bf-${id}`} value={v[id] || ''} onChange={(e) => set(id, e.target.value)} {...props}
        className={`mt-2 ${input} ${errors[id] ? 'border-orange' : 'border-white/12'}`} />
      {errors[id] && <p className="mt-2 text-[12.5px] text-orange">{errors[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-8">
      <fieldset>
        <legend className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50">
          <span className="text-orange">01</span>&nbsp; Pick your build
        </legend>
        <div className="grid gap-2.5" role="radiogroup">
          {SALE_PLANS.map((p, i) => {
            const on = v.plan === p.id;
            return (
              <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => set('plan', p.id)}
                className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
                  on ? 'border-orange bg-orange/10' : 'border-white/12 bg-white/[0.03]'
                }`}>
                <span>
                  <span className="flex items-center gap-2 text-[15px] font-semibold">
                    {p.name}
                    {i === 0 && <span className="rounded-full bg-orange px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em]">Best deal</span>}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] text-white/50">{p.note}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[12px] text-white/40 line-through">{money(p.was)}</span>
                  <span className="block text-[20px] font-extrabold leading-tight">{money(p.now)}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-white/50">
          Book now and your price is held for {BF.holdHours} hours. A {BF.depositPct}% deposit
          ({money(deposit(plan.now))}) within that window locks it in; the balance is due at launch.
        </p>

        {bonuses.length > 0 && (
          <div className={`mt-4 rounded-2xl border p-4 ${btc ? 'border-orange/50 bg-orange/10' : 'border-white/10 bg-white/[0.03]'}`}>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-orange">
              {btc ? `${BTC.name} bonuses applied` : 'Free with this build'}
            </p>
            <ul className="mt-2.5 grid gap-1.5 text-[13.5px] text-white/85">
              {bonuses.map((b) => (
                <li key={b.label}>✓ {b.label}{b.value ? <span className="text-white/45"> — {money(b.value)}</span> : null}</li>
              ))}
            </ul>
            <p className="mt-2.5 text-[12px] text-white/50">{money(bonusTotal)} of extras, free.
            </p>
            {btc && (
              <p className="mt-2 text-[12.5px] leading-relaxed text-white/75">
                Plus ${REFERRAL.get} per referral, and a free service at each of your first {BTC.referralTiers.length} referrals,
                up to an {BTC.referralTiers[BTC.referralTiers.length - 1].reward}.
              </p>
            )}
          </div>
        )}
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50">
          <span className="text-orange">02</span>&nbsp; Where to send your deposit link
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('name', 'Your name', { autoComplete: 'name' })}
          {field('business', 'Business', { autoComplete: 'organization' })}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('phone', 'Mobile', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '(619) 555-0123' })}
          {field('email', 'Email', { type: 'email', inputMode: 'email', autoComplete: 'email' })}
        </div>
        {field('website', 'Current website', { inputMode: 'url', autoComplete: 'url', placeholder: member ? 'yourbusiness.com, or “none”' : 'yourbusiness.com' }, !member)}
        {member
          ? <p className="rounded-xl border border-orange/40 bg-orange/10 px-4 py-3.5 text-[13.5px] text-white/85">Committee code <strong>{BTC.code}</strong> applied</p>
          : field('code', 'Member code', { autoCapitalize: 'characters', autoComplete: 'off', placeholder: 'BTC committee code' }, true)}
        {v.referredBy && (
          <p className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-[13.5px] text-white/85">
            Referred by <strong className="capitalize">{v.referredBy}</strong>
          </p>
        )}
      </fieldset>

      {member && (
        <fieldset>
          <legend className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50">
            <span className="text-orange">03</span>&nbsp; Send us your files <span className="normal-case tracking-normal text-white/40">· optional</span>
          </legend>
          <FileDrop files={files} setFiles={setFiles}
            blurb="Your logo, photos of your work, fleet or team, brochures, anything you'd want on the new site. Not required, but it gets your build started faster." />
        </fieldset>
      )}

      <input id="bf-bot" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div className="grid gap-3">
        <button type="submit" disabled={state === 'sending' || uploading}
          className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-orange px-8 text-[15.5px] font-bold text-white transition-opacity disabled:opacity-60">
          {state === 'sending' ? 'Holding your spot…' : uploading ? 'Waiting for uploads…' : `Hold my spot at ${money(plan.now)}`}
        </button>
        <p className="text-center text-[11.5px] leading-relaxed text-white/40">
          Nothing is charged here. We text you a deposit link, and your price is locked once it&rsquo;s paid
          within {BF.holdHours} hours.
          By sending this you agree we can call, text or email you about your booking. Message rates may apply.
        </p>
        {state === 'error' && (
          <p className="text-center text-[13px] text-orange">
            That didn&rsquo;t send. Give it another tap, or call <a className="underline" href={`tel:${PHONE}`}>{PHONE_DISPLAY}</a>.
          </p>
        )}
      </div>
    </form>
  );
}
