'use client';
import { useEffect, useRef, useState } from 'react';
import { steps } from '@/lib/data';
import SectionReveal from './SectionReveal';

export default function Process() {
  const sec = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const el = sec.current; if (!el) return;
    const f = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.min(Math.max(-r.top / (total || 1), 0), 1);
      setProg(p);
      setI(Math.min(steps.length - 1, Math.floor(p * steps.length + 0.0001)));
    };
    f(); window.addEventListener('scroll', f, { passive: true });
    window.addEventListener('resize', f);
    return () => { window.removeEventListener('scroll', f); window.removeEventListener('resize', f); };
  }, []);

  return (
    <section ref={sec} id="process" className="relative" style={{ height: '320vh', background: 'var(--bold-navy)' }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="lightsource" style={{ inset: '20% -10% 20% 45%' }} />
        <div className="shell relative z-[2] w-full">
          <SectionReveal><p className="eyebrow mb-6">How it works</p></SectionReveal>
          <h2 className="display mb-12">From idea to <span className="text-orange">impact.</span></h2>

          <div className="grid items-start gap-10 md:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
            {/* the number */}
            <div className="relative h-[9rem] overflow-hidden md:h-[16rem]">
              {steps.map((s, k) => (
                <span key={s.n} className="proc-num" style={{
                  opacity: i === k ? 1 : 0,
                  transform: `translate3d(0, ${i === k ? 0 : i > k ? '-60%' : '60%'}, 0)`,
                }}>{s.n}</span>
              ))}
            </div>
            {/* the copy */}
            <div className="relative h-[11rem] md:h-[13rem]">
              {steps.map((s, k) => (
                <div key={s.n} className="absolute inset-0" style={{
                  opacity: i === k ? 1 : 0,
                  transform: `translate3d(0, ${i === k ? 0 : i > k ? -28 : 28}px, 0)`,
                  filter: i === k ? 'blur(0)' : 'blur(6px)',
                  transition: 'opacity .5s var(--e-expo), transform .5s var(--e-expo), filter .5s var(--e-expo)',
                  pointerEvents: i === k ? 'auto' : 'none',
                }}>
                  <h3 className="text-[var(--step-3)] font-extrabold leading-none tracking-tight">{s.title}</h3>
                  <p className="lede mt-4">{s.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 h-px w-full bg-white/10">
            <div className="h-px bg-orange transition-[width] duration-200 ease-out" style={{ width: `${prog * 100}%` }} />
          </div>
          <div className="mt-4 flex gap-6 font-mono text-[10px] uppercase tracking-[0.2em]">
            {steps.map((s, k) => (
              <span key={s.n} style={{ color: i === k ? 'var(--bold-orange)' : 'rgba(255,255,255,.3)' }}>{s.n}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
