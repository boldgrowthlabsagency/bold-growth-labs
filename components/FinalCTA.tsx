'use client';
import { useEffect, useRef } from 'react';
import MagneticButton from './MagneticButton';
import SectionReveal from './SectionReveal';

/* Closing frame. A soft orange light source drifts with the cursor — the
   orange behaving as light rather than as a coloured shape. */
export default function FinalCTA() {
  const orb = useRef<HTMLDivElement>(null);
  const sec = useRef<HTMLElement>(null);

  useEffect(() => {
    const s = sec.current, o = orb.current;
    if (!s || !o) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const move = (e: PointerEvent) => {
      const r = s.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * 0.12;
      ty = (e.clientY - (r.top + r.height / 2)) * 0.12;
    };
    const tick = () => {
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      o.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    s.addEventListener('pointermove', move);
    raf = requestAnimationFrame(tick);
    return () => { s.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={sec} id="contact" className="relative overflow-hidden py-[clamp(6rem,18vh,12rem)]" style={{ background: 'var(--bold-navy)' }}>
      <div ref={orb} className="lightsource" style={{ inset: '-20% 15% -20% 15%', filter: 'blur(30px)' }} />
      <div className="grain absolute inset-0" />
      <div className="shell relative z-[3] text-center">
        <SectionReveal>
          <h2 className="display mx-auto max-w-[15ch]">
            Your business deserves<br />a website people <span className="text-orange">remember.</span>
          </h2>
        </SectionReveal>
        <SectionReveal delay={90}>
          <p className="mt-7 text-[var(--step-2)] font-semibold">Let&rsquo;s build something BOLD.</p>
        </SectionReveal>
        <SectionReveal delay={150}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <MagneticButton href="mailto:boldgrowthlabs@gmail.com">Start Your Project</MagneticButton>
            <MagneticButton href="#work" variant="ghost" arrow={false}>See Our Work</MagneticButton>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
