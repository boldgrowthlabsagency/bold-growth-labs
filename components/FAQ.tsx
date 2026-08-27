'use client';
import { useState } from 'react';
import { faqs } from '@/lib/data';
import SectionReveal from './SectionReveal';

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section relative" style={{ background: 'var(--bold-navy)' }}>
      <div className="shell relative z-[2]">
        <SectionReveal><p className="eyebrow mb-6">FAQ</p></SectionReveal>
        <SectionReveal delay={60}>
          <h2 className="display max-w-[14ch]">Questions?<br /><span className="text-orange">Let&rsquo;s make this easy.</span></h2>
        </SectionReveal>

        <div className="mt-12 grid gap-x-6 md:grid-cols-2">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <SectionReveal key={f.q} delay={(i % 2) * 60}>
                <div className="faq">
                  <button className="faq__q" aria-expanded={on} onClick={() => setOpen(on ? null : i)}>
                    <span>{f.q}</span>
                    <span className="faq__ico" style={{ transform: on ? 'rotate(135deg)' : 'none' }}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <div className="faq__a" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden"><p>{f.a}</p></div>
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
