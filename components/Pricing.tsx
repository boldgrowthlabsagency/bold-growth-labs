'use client';
import { plans, PHONE } from '@/lib/data';
import SectionReveal from './SectionReveal';
import MagneticButton from './MagneticButton';

export default function Pricing() {
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

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((p, i) => (
            <SectionReveal key={p.id} delay={i * 70}>
              <article className={`plan ${p.featured ? 'plan--featured' : ''}`}>
                {p.featured && <span className="plan__badge">Most popular</span>}
                <h3 className="plan__name">{p.name}</h3>
                <p className="plan__price">
                  {p.from && <em>From </em>}${p.price.toLocaleString()}
                </p>
                <p className="plan__blurb">{p.blurb}</p>
                {p.tiers && (
                  <ul className="plan__tiers">{p.tiers.map((t) => <li key={t}>{t}</li>)}</ul>
                )}
                <ul className="plan__features">
                  {p.features.map((f) => (
                    <li key={f}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 12.5l5.2 5L20 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <MagneticButton href="#contact" variant={p.featured ? 'primary' : 'ghost'} className="mt-7 w-full justify-center">
                  {p.cta}
                </MagneticButton>
              </article>
            </SectionReveal>
          ))}
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
