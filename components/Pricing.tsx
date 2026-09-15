'use client';
import { useEffect, useRef, useState } from 'react';
import { plans, PHONE } from '@/lib/data';
import SectionReveal from './SectionReveal';
import MagneticButton from './MagneticButton';

export default function Pricing() {
  /* SCRUBBED reveal, not a one-shot.

     SectionReveal deliberately never re-hides, and that is the right default:
     content vanishing because you scrolled back up reads as a bug. A scrub is
     a different thing — it is tied 1:1 to wheel position, so moving up runs
     the cards back out at exactly the rate you are moving. That reads as
     direct manipulation rather than as content being taken away, which is why
     it works on the reference build and why it is scoped to this grid only. */
  const grid = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [ps, setPs] = useState<number[]>(() => plans.map(() => 0));

  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setPs(plans.map(() => 1)); return; }

    let raf = 0;
    const read = () => {
      raf = 0;
      /* Per-card, not per-grid. Measuring the grid meant the whole scrub
         finished inside the first ~300px; on a phone the cards stack into a
         column roughly 1800px tall, so everything after that first screen was
         static and the effect looked like it was never applied. Each card now
         answers to its own position, so it resolves on the way in and runs
         back out on the way up, wherever it sits in the column. */
      const start = window.innerHeight * 0.94;
      const end = window.innerHeight * 0.46;
      setPs(cards.current.map((c) => {
        if (!c) return 0;
        const r = c.getBoundingClientRect();
        return Math.min(1, Math.max(0, (start - r.top) / (start - end)));
      }));
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

  return (
    <section id="pricing" className="section relative overflow-hidden" style={{ background: 'var(--bold-navy)' }}>
      <div className="lightsource" style={{ inset: '-10% 20% 40% 20%' }} />
      <div className="shell relative z-[2]">
        <SectionReveal><p className="eyebrow mb-6">Pricing</p></SectionReveal>
        <SectionReveal delay={60}>
          <h2 className="display max-w-[15ch]">Simple pricing. <span className="text-orange">Pick what fits.</span></h2>
        </SectionReveal>
        <SectionReveal delay={110}>
          <p className="lede mt-6">
            No confusing retainers. No mystery quotes. Start with what your business actually needs.
          </p>
        </SectionReveal>

        <div ref={grid} className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((pl, i) => {
            const t = ps[i] ?? 0;
            return (
            <div
              key={pl.id}
              ref={(el) => { cards.current[i] = el; }}
              style={{
                opacity: t,
                transform: `translate3d(0, ${((1 - t) * 46).toFixed(1)}px, 0) scale(${(0.965 + t * 0.035).toFixed(4)})`,
                willChange: t > 0 && t < 1 ? 'opacity, transform' : 'auto',
              }}
            >
              <article className={`plan ${pl.featured ? 'plan--featured' : ''}`}>
                {pl.featured && <span className="plan__badge">Most popular</span>}
                <h3 className="plan__name">{pl.name}</h3>
                <p className="plan__price">
                  {pl.from && <em>From </em>}${pl.price.toLocaleString()}
                </p>
                <p className="plan__blurb">{pl.blurb}</p>
                {pl.tiers && (
                  <ul className="plan__tiers">{pl.tiers.map((x) => <li key={x}>{x}</li>)}</ul>
                )}
                <ul className="plan__features">
                  {pl.features.map((f) => (
                    <li key={f}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 12.5l5.2 5L20 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <MagneticButton href="#contact" variant={pl.featured ? 'primary' : 'ghost'} className="mt-7 w-full justify-center">
                  {pl.cta}
                </MagneticButton>
              </article>
            </div>
            );
          })}
        </div>
      </div>
          <div className="shell relative z-[2]">
        <SectionReveal>
          <div className="cta-rail mt-14">
            <div>
              <h3 className="cta-rail__h">Know which one fits?</h3>
              <p className="cta-rail__p">Fixed quote before we start. No retainers, no surprise invoices.</p>
            </div>
            <div className="cta-rail__btns">
              <MagneticButton href="#contact">Choose your build</MagneticButton>
              <MagneticButton href={`tel:${PHONE}`} variant="ghost" arrow={false}>Call BOLD</MagneticButton>
            </div>
          </div>
        </SectionReveal>
      </div>
</section>
  );
}
