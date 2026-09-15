'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { steps } from '@/lib/data';
import SectionReveal from './SectionReveal';

/* ============================================================
   HOW IT WORKS — a sticky card DECK

   The previous version cross-faded one step out and the next in,
   which meant only ever one step on screen and no sense of
   progress through a sequence. This stacks instead: each card
   rises from below, lands on the pile, and the cards already
   landed shrink and slide down a little so a sliver of each
   stays visible. Arriving IS the animation — nothing has a
   separate entrance tween.

   The numbered dots are the interactive control (they scroll to
   a step). The cards themselves are not clickable: they carry no
   role or tabindex, because a card that looks pressable but only
   scrolls is worse than one that plainly isn't.

   Reduced motion collapses the whole thing to a plain readable
   list — no pin, no stacking, no transforms.
   ============================================================ */

const REST = 14;      // px each landed card sits below the one before — the visible sliver
const SHRINK = 0.035; // scale removed per card stacked on top

export default function Process() {
  const sec = useRef<HTMLElement>(null);
  const [prog, setProg] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setReduced(true); return; }
    const el = sec.current;
    if (!el) return;

    let raf = 0;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setProg(Math.min(1, Math.max(0, -r.top / (span || 1))));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Scroll to the point where card k has just landed. */
  const jump = useCallback((k: number) => {
    const el = sec.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (k / steps.length) * span + span * 0.06, behavior: 'smooth' });
  }, []);

  /* How far each card has travelled: 0 = still below, 1 = landed. The +0.6
     bias means card 01 is already most of the way in as the pin engages —
     without it the deck is empty for the first beat and reads as broken. */
  const RAMP = steps.length + 0.6;
  const landed = (k: number) => Math.min(1, Math.max(0, prog * RAMP - k + 0.6));
  /* Derived from the same RAMP the cards use. Computing this off the raw
     progress instead left the highlighted dot one behind the card actually
     on top of the deck. */
  const active = Math.min(steps.length - 1, Math.max(0, Math.floor(prog * RAMP + 0.1)));

  if (reduced) {
    return (
      <section id="process" className="section relative" style={{ background: 'var(--bold-navy)' }}>
        <div className="shell">
          <p className="eyebrow mb-6">How it works</p>
          <h2 className="display mb-12">From idea to <span className="text-orange">impact.</span></h2>
          <ol className="grid gap-5">
            {steps.map((s) => (
              <li key={s.n} className="proc-card proc-card--static">
                <span className="proc-card__n">{s.n}</span>
                <h3 className="proc-card__t">{s.title}</h3>
                <p className="proc-card__p">{s.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={sec} id="process" className="relative" style={{ height: '360vh', background: 'var(--bold-navy)' }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="lightsource" style={{ inset: '20% -10% 20% 45%' }} />
        <div className="shell relative z-[2] grid w-full items-center gap-10 md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">

          <div>
            <SectionReveal><p className="eyebrow mb-6">How it works</p></SectionReveal>
            <h2 className="display">From idea to <span className="text-orange">impact.</span></h2>
            <p className="lede mt-5 max-w-[34ch]">Four steps, no wasted motion and no surprises.</p>

            {/* the jump control */}
            <div className="mt-9 flex items-center gap-3" role="tablist" aria-label="Process steps">
              {steps.map((s, k) => (
                <span key={s.n} className="flex items-center gap-3">
                  <button
                    type="button" role="tab" aria-selected={active === k}
                    aria-label={`Step ${s.n}: ${s.title}`}
                    onClick={() => jump(k)}
                    className={`proc-dot ${active === k ? 'is-on' : ''}`}
                  >
                    <span>{s.n}</span>
                  </button>
                  {k < steps.length - 1 && <span className="proc-dot-line" aria-hidden />}
                </span>
              ))}
            </div>
          </div>

          {/* the deck */}
          <div className="proc-deck">
            {steps.map((s, k) => {
              const t = landed(k);
              /* Cards stacked on top of this one push it down and shrink it. */
              const above = Math.max(0, Math.min(steps.length - 1 - k, prog * RAMP - k - 0.4));
              return (
                <article
                  key={s.n}
                  className="proc-card"
                  aria-hidden={t < 0.5}
                  style={{
                    zIndex: k + 1,
                    opacity: t < 0.06 ? 0 : 1,
                    transform:
                      `translate3d(0, ${((1 - t) * 46 + above * REST).toFixed(1)}%, 0) ` +
                      `scale(${(1 - above * SHRINK).toFixed(4)})`,
                  }}
                >
                  <span className="proc-card__n">{s.n}</span>
                  <h3 className="proc-card__t">{s.title}</h3>
                  <p className="proc-card__p">{s.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
