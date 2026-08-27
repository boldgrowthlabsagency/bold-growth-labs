'use client';
import { services } from '@/lib/data';
import SectionReveal from './SectionReveal';
import MagneticButton from './MagneticButton';

export default function Services() {
  return (
    <section id="services" className="section relative overflow-hidden" style={{ background: 'var(--bold-slate)' }}>
      <div className="shell relative z-[2]">
        <SectionReveal><p className="eyebrow mb-6">What we build</p></SectionReveal>
        <SectionReveal delay={60}>
          <h2 className="display max-w-[18ch]">
            We don&rsquo;t build websites.<br /><span className="text-orange">We build digital growth engines.</span>
          </h2>
        </SectionReveal>

        <div className="mt-14 border-t border-white/10">
          {services.map((s, i) => (
            <SectionReveal key={s.title} delay={i * 55}>
              <a href="#contact" data-cursor="open" className="svc-row group">
                <span className="svc-row__n">{s.n}</span>
                <h3 className="svc-row__t">{s.title}</h3>
                <p className="svc-row__c">{s.copy}</p>
                <svg className="svc-row__a" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </SectionReveal>
          ))}
        </div>
      </div>
          <div className="shell relative z-[2]">
        <SectionReveal>
          <div className="cta-rail mt-14">
            <div>
              <h3 className="cta-rail__h">Not sure which of these you need?</h3>
              <p className="cta-rail__p">Most people aren&rsquo;t. Tell us what isn&rsquo;t working and we&rsquo;ll tell you what would move the needle first.</p>
            </div>
            <div className="cta-rail__btns">
              <MagneticButton href="#work">See what we can build</MagneticButton>
            </div>
          </div>
        </SectionReveal>
      </div>
</section>
  );
}
