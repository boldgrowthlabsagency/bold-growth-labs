'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FLOW, SAMPLE_REVIEWS, SAMPLE_RATING, SAMPLE_COUNT } from '@/lib/reviewflow';

/* ============================================================
   REVIEWS — an interactive walkthrough, not a list of bullets

   The point of this page is that a prospect can SEE the flow
   rather than read a description of it, so the phone on the
   right actually plays each step. Selling a website build with
   a page that only describes things would be a poor advert.

   It advances on its own so a visitor who does nothing still
   sees the whole story, and stops the moment they take control —
   an auto-player that keeps yanking the view away from someone
   who just clicked is the most annoying pattern in this genre.
   ============================================================ */

const DWELL = 4200;   // ms per step while auto-playing

export default function ReviewFlow() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);

  /* Only run while on screen — and never at all under reduced motion, where
     the visitor drives it entirely. */
  useEffect(() => {
    if (!auto) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let seen = true;
    let timer: number | undefined;
    const tick = () => { if (seen) setI((k) => (k + 1) % FLOW.length); };
    timer = window.setInterval(tick, DWELL);

    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window && wrap.current) {
      io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { threshold: 0.2 });
      io.observe(wrap.current);
    }
    return () => { window.clearInterval(timer); io?.disconnect(); };
  }, [auto]);

  const pick = useCallback((k: number) => { setAuto(false); setI(k); }, []);
  const step = FLOW[i];

  return (
    <div ref={wrap} className="rf">
      <div className="rf-grid">
        {/* ---- the steps ---- */}
        <ol className="rf-steps">
          {FLOW.map((s, k) => {
            const on = k === i;
            return (
              <li key={s.n}>
                <button
                  type="button"
                  onClick={() => pick(k)}
                  className={`rf-step${on ? ' is-on' : ''}`}
                  aria-current={on ? 'step' : undefined}
                >
                  <span className="rf-step__n">{s.n}</span>
                  <span className="rf-step__body">
                    <span className="rf-step__t">{s.title}</span>
                    <span className="rf-step__c">{s.copy}</span>
                    {on && s.note && <span className="rf-step__note">{s.note}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* ---- the phone ---- */}
        <div className="rf-phone" aria-hidden>
          <div className="rf-phone__notch" />
          <div className="rf-phone__screen">
            <Screen kind={step.screen} />
          </div>
        </div>
      </div>

      {/* the running state, announced once rather than on every tick */}
      <p className="sr-only" role="status" aria-live="polite">
        Step {step.n}: {step.title}. {step.copy}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Stars({ n = 5, className = '' }: { n?: number; className?: string }) {
  return (
    <span className={`rf-stars ${className}`}>
      {Array.from({ length: 5 }).map((_, k) => (
        <svg key={k} viewBox="0 0 24 24" className={k < n ? 'is-on' : ''} aria-hidden>
          <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9z" />
        </svg>
      ))}
    </span>
  );
}

function Screen({ kind }: { kind: string }) {
  if (kind === 'job') {
    return (
      <div className="rf-scr rf-scr--app">
        <p className="rf-scr__bar">Your job software</p>
        <div className="rf-job">
          <p className="rf-job__t">Patio &amp; retaining wall</p>
          <p className="rf-job__m">14 Cypress Lane &middot; 3 days</p>
          <span className="rf-job__done">✓ Marked complete</span>
        </div>
        <p className="rf-scr__hint">That is your entire involvement.</p>
      </div>
    );
  }

  if (kind === 'sms') {
    return (
      <div className="rf-scr rf-scr--sms">
        <p className="rf-scr__bar">Messages &middot; now</p>
        <div className="rf-bubble">
          Hi Marisol — thanks for having us out this week. If you have twenty seconds,
          would you mind leaving us a quick review? It genuinely helps.
          <span className="rf-bubble__link">g.page/r/review</span>
        </div>
        <p className="rf-scr__hint">Sent 20 minutes after the job closed.</p>
      </div>
    );
  }

  if (kind === 'google') {
    return (
      <div className="rf-scr rf-scr--g">
        <p className="rf-scr__bar">Rate your experience</p>
        <div className="rf-gbox">
          <div className="rf-gbox__biz">
            <span className="rf-gbox__logo" />
            <span>Your Business</span>
          </div>
          <Stars n={5} className="rf-stars--lg" />
          <div className="rf-gbox__field">Share details of your experience…</div>
          <span className="rf-gbox__btn">Post</span>
        </div>
        <p className="rf-scr__hint">One tap from the text. No app, no account hunt.</p>
      </div>
    );
  }

  if (kind === 'landed') {
    return (
      <div className="rf-scr rf-scr--landed">
        <p className="rf-scr__bar">Your Google profile</p>
        <div className="rf-rating">
          <strong>{SAMPLE_RATING}</strong>
          <Stars n={5} />
          <span>{SAMPLE_COUNT} reviews</span>
        </div>
        <div className="rf-rev rf-rev--new">
          <span className="rf-rev__badge">New</span>
          <Stars n={5} />
          <p>{SAMPLE_REVIEWS[0].text}</p>
          <span className="rf-rev__by">{SAMPLE_REVIEWS[0].name} &middot; just now</span>
        </div>
      </div>
    );
  }

  if (kind === 'reply') {
    return (
      <div className="rf-scr rf-scr--reply">
        <p className="rf-scr__bar">Your Google profile</p>
        <div className="rf-rev">
          <Stars n={4} />
          <p>{SAMPLE_REVIEWS[3].text}</p>
          <span className="rf-rev__by">{SAMPLE_REVIEWS[3].name}</span>
        </div>
        <div className="rf-reply">
          <span className="rf-reply__who">Response from the owner</span>
          <p>
            Thanks Kev — you are right that the rain cost us a day, and we would rather
            tell you early than have you wondering. Glad the wall came out well.
          </p>
        </div>
        <p className="rf-scr__hint">Answered within one business day. Always.</p>
      </div>
    );
  }

  return (
    <div className="rf-scr rf-scr--site">
      <p className="rf-scr__bar">yourbusiness.com</p>
      <div className="rf-sitewrap">
        <p className="rf-site__lbl">What our customers say</p>
        <div className="rf-rating rf-rating--site">
          <strong>{SAMPLE_RATING}</strong>
          <Stars n={5} />
          <span>{SAMPLE_COUNT} Google reviews</span>
        </div>
        {SAMPLE_REVIEWS.slice(0, 2).map((r) => (
          <div key={r.name} className="rf-card">
            <Stars n={r.stars} />
            <p>{r.text}</p>
            <span>{r.name} &middot; {r.when}</span>
          </div>
        ))}
      </div>
      <p className="rf-scr__hint">Live on your site, updating itself.</p>
    </div>
  );
}

/* The widget, at full size, below the walkthrough. */
export function ReviewWidget() {
  return (
    <div className="rw">
      <div className="rw-head">
        <div className="rw-score">
          <strong>{SAMPLE_RATING}</strong>
          <div>
            <Stars n={5} />
            <span>Based on {SAMPLE_COUNT} Google reviews</span>
          </div>
        </div>
        <span className="rw-badge">Updates automatically</span>
      </div>
      <div className="rw-grid">
        {SAMPLE_REVIEWS.map((r) => (
          <article key={r.name} className="rw-card">
            <Stars n={r.stars} />
            <p className="rw-card__t">{r.text}</p>
            <p className="rw-card__by">{r.name} <span>&middot; {r.when}</span></p>
          </article>
        ))}
      </div>
    </div>
  );
}
