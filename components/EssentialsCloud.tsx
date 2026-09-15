'use client';
import { useEffect, useRef, useState } from 'react';
import { pills } from '@/lib/data';
import SectionReveal from './SectionReveal';

/* Pills distributed across a deep 3D field — foreground, middle and back
   planes get different scale, blur and parallax rate. Hovering one brings it
   toward the viewer and pushes its neighbours back. */

const LAYOUT = [
  { x: 8,  y: 14, z: 2 }, { x: 30, y: 5,  z: 1 }, { x: 55, y: 12, z: 3 }, { x: 79, y: 6,  z: 1 },
  { x: 4,  y: 40, z: 1 }, { x: 24, y: 33, z: 3 }, { x: 62, y: 36, z: 2 }, { x: 84, y: 30, z: 3 },
  { x: 12, y: 63, z: 3 }, { x: 36, y: 58, z: 2 }, { x: 58, y: 64, z: 1 }, { x: 80, y: 55, z: 2 },
  { x: 20, y: 85, z: 2 }, { x: 44, y: 80, z: 1 }, { x: 66, y: 88, z: 3 }, { x: 88, y: 78, z: 1 },
];

export default function EssentialsCloud() {
  const field = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = field.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, t = 0, c = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      t = (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight;
    };
    const draw = () => {
      c += (t - c) * 0.08;
      el.style.setProperty('--par', String(c));
      raf = requestAnimationFrame(draw);
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', measure); };
  }, []);

  return (
    <section className="section relative overflow-hidden" style={{ background: 'var(--bold-navy)' }}>
      <div className="lightsource" style={{ inset: '18% 26% 22% 26%' }} />
      <div className="shell relative z-[3] text-center">
        <SectionReveal><p className="eyebrow mb-6 justify-center">The foundation</p></SectionReveal>
        <SectionReveal delay={60}>
          <h2 className="display mx-auto max-w-[16ch]">
            Everything your website needs.<br /><span className="text-orange">Nothing it doesn&rsquo;t.</span>
          </h2>
        </SectionReveal>
        <SectionReveal delay={120}>
          <p className="lede mx-auto mt-6 text-center">
            Every BOLD Growth Labs website is built with the foundation required to look credible,
            perform fast, and turn attention into action.
          </p>
        </SectionReveal>
      </div>

      <div ref={field} className="pill-field relative z-[2] mx-auto mt-14 hidden max-w-[1180px] md:block">
        {pills.map((p, i) => {
          const L = LAYOUT[i % LAYOUT.length];
          const on = active === i;
          const dim = active !== null && !on;
          return (
            <button
              key={p.label}
              onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)} onBlur={() => setActive(null)}
              className={`pill pill--drift z-${L.z} ${L.x >= 70 ? 'is-right' : ''} ${on ? 'is-on' : ''} ${dim ? 'is-dim' : ''}`}
              style={{
                left: `${L.x}%`, top: `${L.y}%`, ['--depth' as any]: L.z,
                /* each pill drifts on its own clock so the field never pulses in unison */
                ['--dur' as any]: `${11 + (i % 5) * 2.4}s`,
                ['--delay' as any]: `${-(i * 1.37) % 9}s`,
                ['--amp' as any]: `${5 + L.z * 2.5}px`,
                ['--drift' as any]: i % 2 ? '1' : '-1',
              }}
              aria-describedby={`pd-${i}`}
            >
              <span className="pill__label">
                <svg className="pill__check" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 12.5l5.2 5L20 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {p.label}
              </span>
              <span id={`pd-${i}`} className="pill__detail">{p.detail}</span>
            </button>
          );
        })}
      </div>

      {/* mobile: a drifting cluster, not a packed block of buttons */}
      <div className="shell relative z-[2] mt-10 md:hidden">
        <div className="pill-cluster">
          {pills.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setActive(active === i ? null : i)}
              className={`pill-bob pill-chip ${active === i ? 'is-on' : ''}`}
              aria-pressed={active === i}
              style={{
                /* every chip on its own clock; the vertical nudge stops the
                   wrapped rows reading as flat lines */
                ['--dur' as any]: `${5.5 + (i % 5) * 1.3}s`,
                ['--delay' as any]: `${-(i * 0.71) % 6}s`,
                ['--drift' as any]: i % 2 ? '1' : '-1',
                /* capped so two adjacent rows can never close their gap mid-float */
                ['--amp' as any]: `${3 + (i % 3)}px`,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {active !== null && (
          <p className="pill-detail-mobile" role="status" aria-live="polite">
            {pills[active].detail}
          </p>
        )}
      </div>
    </section>
  );
}
