'use client';
import { useState } from 'react';
import SectionReveal from './SectionReveal';
import { PHONE, PHONE_DISPLAY, NEEDS, INBOX } from '@/lib/data';

/* ============================================================
   Real submission. Posts same-origin to /api/contact, which
   forwards to the Apps Script bound to the enquiries spreadsheet —
   a row lands in the sheet and a notification lands in the inbox.

   The mail-client fallback stays, but only fires when the server
   reports the endpoint is unconfigured, or the request genuinely
   fails. Previously it was the ONLY path, which meant a visitor
   without a configured mail app submitted into nothing.
   ============================================================ */

type State = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [need, setNeed] = useState<string[]>([]);
  const [state, setState] = useState<State>('idle');
  const [msg, setMsg] = useState('');

  const toggle = (n: string) =>
    setNeed((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);

    const summary = [
      `Name: ${f.get('name')}`,
      `Business: ${f.get('business') || '—'}`,
      `Email: ${f.get('email')}`,
      `Phone: ${f.get('phone') || '—'}`,
      `Needs: ${need.join(', ') || 'Not specified'}`,
      '',
      String(f.get('details') || ''),
    ].join('\n');

    const mailtoFallback = () => {
      window.location.href =
        `mailto:${INBOX}?subject=${encodeURIComponent('New inquiry — BOLD Growth Labs')}` +
        `&body=${encodeURIComponent(summary)}`;
    };

    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.get('name'),
          business: f.get('business'),
          email: f.get('email'),
          phone: f.get('phone'),
          needs: need,
          details: f.get('details'),
          botcheck: f.get('botcheck') || '',
          source: 'boldgrowthlabs.io',
        }),
      });

      /* 503 means the sheet endpoint has not been configured yet. Hand the
         visitor to their mail client rather than telling them it sent. */
      if (res.status === 503) { setState('idle'); mailtoFallback(); return; }

      const json = await res.json().catch(() => ({ ok: res.ok }));
      if (res.ok && json.ok) {
        setState('sent');
        setMsg('Got it. We&rsquo;ll reply within 24 hours.');
        form.reset();
        setNeed([]);
      } else if (res.status === 422) {
        setState('error');
        setMsg('Please check your name and email, then try again.');
      } else {
        throw new Error(json.reason || 'Send failed');
      }
    } catch {
      setState('error');
      setMsg('That didn&rsquo;t send. Email us directly and we&rsquo;ll pick it up.');
    }
  };

  return (
    <section id="contact" className="section relative overflow-hidden" style={{ background: 'var(--bold-slate)' }}>
      <div className="lightsource" style={{ inset: '-20% -10% 40% 40%' }} />
      <div className="shell relative z-[2] grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionReveal><p className="eyebrow mb-6">Start here</p></SectionReveal>
          <SectionReveal delay={60}>
            <h2 className="display max-w-[13ch]">
              Let&rsquo;s build something <span className="text-orange">that works.</span>
            </h2>
          </SectionReveal>
          <SectionReveal delay={110}>
            <p className="lede mt-6">Tell us what you&rsquo;re working with. We&rsquo;ll get back to you within 24 hours.</p>
          </SectionReveal>
          <SectionReveal delay={150}>
            <ul className="mt-8 space-y-3">
              {['Transparent pricing — no hidden fees',
                'A clear process with fixed deliverables',
                'You own everything we build',
                'We reply within 24 hours'].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="mt-[3px] text-orange" aria-hidden>✓</span>{t}
                </li>
              ))}
            </ul>
          </SectionReveal>
          <SectionReveal delay={190}>
            <div className="mt-8 rounded-xl border border-white/10 p-5">
              <p className="text-sm text-white/60">Prefer to talk?</p>
              {/* min-h-[44px] + items-center: this rendered 24px tall on a phone,
                  under the 44px minimum for a tap target — and it is a phone
                  number, so it is the one link most likely to be tapped there. */}
              <a href={`tel:${PHONE}`} className="cta cta--ghost mt-3 inline-flex min-h-[44px] items-center" data-cursor="open">
                Call BOLD <span aria-hidden>→</span>
              </a>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{PHONE_DISPLAY}</p>
            </div>
          </SectionReveal>
        </div>

        <SectionReveal delay={100}>
          {/* On success the form is REPLACED by this panel. Previously the only
              signal was one small line under the button swapping "We respond
              within 24 hours." for "Got it. We'll reply within 24 hours." —
              same position, same size, nearly the same words. People submitted
              and could not tell whether anything had happened, which on the
              one form that exists to capture leads is the worst place to be
              ambiguous. */}
          {state === 'sent' ? (
            <div className="cform cform--sent" role="status" aria-live="polite">
              <span className="cform-tick" aria-hidden>✓</span>
              <h3 className="cform-sent-h">Thanks &mdash; we&rsquo;ve got it.</h3>
              <p className="cform-sent-p">
                Your inquiry is in and we&rsquo;ll reply within 24 hours, usually sooner.
                If it&rsquo;s urgent, call us on{' '}
                <a href={`tel:${PHONE}`} className="underline">{PHONE_DISPLAY}</a>.
              </p>
              <button
                type="button"
                className="cform-again"
                onClick={() => { setState('idle'); setMsg(''); }}
              >
                Send another
              </button>
            </div>
          ) : (
          <form className="cform" onSubmit={submit} noValidate={false}>
            {/* honeypot — bots fill it, humans never see it */}
            <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="cform__row">
              <label className="cform__f"><span>Name</span><input name="name" required autoComplete="name" /></label>
              <label className="cform__f"><span>Business name</span><input name="business" autoComplete="organization" /></label>
            </div>
            <div className="cform__row">
              <label className="cform__f"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label>
              <label className="cform__f"><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
            </div>

            <fieldset className="cform__set">
              <legend>What do you need?</legend>
              <div className="cform__chips">
                {NEEDS.map((n) => (
                  <button type="button" key={n} onClick={() => toggle(n)}
                          aria-pressed={need.includes(n)}
                          className={need.includes(n) ? 'is-on' : ''}>{n}</button>
                ))}
              </div>
            </fieldset>

            <label className="cform__f"><span>Project details</span><textarea name="details" rows={4} /></label>

            <button type="submit" className="cta cta--primary cform__submit" data-cursor="build" disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending…' : 'Send my inquiry'} <span aria-hidden>→</span>
            </button>

            <p className="cform__note" role="status" aria-live="polite">
              {state === 'error' && (
                <span className="text-orange">
                  That didn&rsquo;t send. <a href={`mailto:${INBOX}`} className="underline">Email us directly</a>.
                </span>
              )}
              {state !== 'error' && 'We respond within 24 hours.'}
            </p>
          </form>
          )}
        </SectionReveal>
      </div>
    </section>
  );
}
