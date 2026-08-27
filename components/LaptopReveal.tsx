'use client';
import { useEffect, useRef, useState } from 'react';
import { laptopBeats } from '@/lib/data';
import SectionReveal from './SectionReveal';
import MagneticButton from './MagneticButton';

/* ============================================================
   A real CSS-3D laptop. The lid rotates around its actual hinge
   (transform-origin at the bottom edge of the lid, which is the
   line it shares with the base) — the whole object is not just
   spun. Scroll drives the hinge from closed to ~105 degrees, the
   screen lights up on the way, then the object eases forward.
   ============================================================ */

const clamp = (n: number, a = 0, b = 1) => Math.min(Math.max(n, a), b);

export default function LaptopReveal() {
  const section = useRef<HTMLElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const lid = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const sec = section.current;
    if (!sec) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lid.current?.style.setProperty('transform', 'rotateX(-14deg)');
      setLit(true); setBeat(laptopBeats.length - 1);
      return;
    }

    let raf = 0, target = 0, cur = 0;

    const measure = () => {
      const r = sec.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target = clamp(-r.top / (total || 1));
    };

    const draw = () => {
      cur += (target - cur) * 0.11;
      const p = cur;

      // 0 → .62 : hinge opens.  .62 → 1 : object eases forward.
      const open = clamp(p / 0.62);
      const push = clamp((p - 0.62) / 0.38);
      const deg = -92 + open * 106;          // closed −92°, open ~ +14°

      if (lid.current) lid.current.style.transform = `rotateX(${deg}deg)`;
      if (rig.current) {
        rig.current.style.transform =
          `perspective(1800px) rotateX(${16 - open * 5 - push * 4}deg) translate3d(0, ${push * -10}px, ${push * 70}px) scale(${1 + push * 0.025})`;
      }
      // an orange light travels the hinge as it opens, then the screen spills light
      if (glow.current) glow.current.style.opacity = String(clamp(open * 1.5) * (1 - push * 0.35));

      setLit(open > 0.66);
      setBeat(p < 0.34 ? 0 : p < 0.66 ? 1 : 2);

      raf = requestAnimationFrame(draw);
    };

    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section ref={section} id="solution" className="relative" style={{ height: '300vh', background: 'var(--bold-navy)' }}>
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-4 overflow-hidden px-4 pt-[72px]">
        <div className="lightsource" style={{ inset: '10% 18% 8% 18%' }} />

        <div className="shell relative z-[3] text-center">
          <p className="eyebrow mb-5 justify-center">The solution</p>
          <h2 className="display mx-auto max-w-[14ch]">
            Your website shouldn&rsquo;t just exist.<br /><span className="text-orange">It should work.</span>
          </h2>
        </div>

        {/* ---------- the object ---------- */}
        <div ref={rig} className="laptop-rig relative z-[2]" style={{ transformStyle: 'preserve-3d' }}>
          <div className="laptop">
            {/* lid — rotates on the hinge it shares with the base */}
            <div ref={lid} className="laptop__lid" style={{ transformOrigin: 'bottom center', transformStyle: 'preserve-3d' }}>
              <div className="laptop__lidback" />
              <div className="laptop__screen">
                <div className="laptop__glass" />
                <MiniSite lit={lit} />
              </div>
            </div>
            {/* base */}
            <div className="laptop__base">
              <div className="laptop__keys" aria-hidden>
                {Array.from({ length: 60 }).map((_, i) => <span key={i} />)}
              </div>
              <div className="laptop__pad" aria-hidden />
            </div>
            <div ref={glow} className="laptop__hingeglow" aria-hidden />
          </div>
          <div className="laptop__shadow" aria-hidden />
        </div>

        {/* ---------- synchronized punchline ---------- */}
        <div className="shell relative z-[3] h-[3.4em] w-full overflow-hidden text-center">
          {laptopBeats.map((t, i) => (
            <p
              key={t}
              className="absolute inset-x-0 mx-auto max-w-[22ch] text-[var(--step-1)] font-semibold leading-snug"
              style={{
                opacity: beat === i ? 1 : 0,
                transform: `translate3d(0, ${beat === i ? 0 : beat > i ? -34 : 34}px, 0)`,
                filter: beat === i ? 'blur(0px)' : 'blur(7px)',
                transition: 'opacity .55s var(--e-expo), transform .55s var(--e-expo), filter .55s var(--e-expo)',
              }}
            >
              {i === 2 ? <>And make them <span className="text-orange">take action.</span></> : t}
            </p>
          ))}
        </div>
      </div>
          <div className="shell relative z-[3] pb-4">
        <SectionReveal>
          <div className="cta-rail">
            <div>
              <h3 className="cta-rail__h">That&rsquo;s the standard we build to.</h3>
              <p className="cta-rail__p">Every build gets the same engineering, whether it&rsquo;s one page or twelve.</p>
            </div>
            <div className="cta-rail__btns">
              <MagneticButton href="#contact">Let&rsquo;s talk</MagneticButton>
            </div>
          </div>
        </SectionReveal>
      </div>
</section>
  );
}

/* A full BOLD Growth Labs site living inside the screen — nav, hero, service
   grid, proof stats, pricing row, CTA and footer. Enough content that it reads
   as a real page rather than a placeholder. */
function MiniSite({ lit }: { lit: boolean }) {
  return (
    <div className="laptop__ui" style={{ opacity: lit ? 1 : 0, transition: 'opacity .5s ease .05s' }} aria-hidden>
      <div className="bs__nav">
        <span className="bs__logo">BOLD<i>.</i></span>
        <nav><span>Work</span><span>Services</span><span>Process</span><span>Pricing</span></nav>
        <span className="bs__navcta">Start a Project</span>
      </div>

      <div className="bs__scrollarea">
        <div className="bs__hero">
          <span className="bs__eyebrow">Bold Growth Labs</span>
          <strong>Built to make<br /><em>people stop.</em></strong>
          <p>Websites and growth systems that turn attention into action.</p>
          <div className="bs__btns"><span className="bs__b1">Build Something Bold</span><span className="bs__b2">See What We Do</span></div>
        </div>

        <div className="bs__sec">
          <span className="bs__lbl">What we build</span>
          <div className="bs__grid">
            {['Websites','Landing Pages','Redesigns','Brand Identity','SEO','AI & Automation'].map((t) => (
              <div key={t} className="bs__card"><i />{t}</div>
            ))}
          </div>
        </div>

        <div className="bs__stats">
          {[['4', 'steps'], ['1wk', 'to live'], ['100%', 'yours']].map(([v, k]) => (
            <div key={k}><strong>{v}</strong><span>{k}</span></div>
          ))}
        </div>

        <div className="bs__sec bs__sec--alt">
          <span className="bs__lbl">Pricing</span>
          <div className="bs__plans">
            <div className="bs__plan"><b>Landing</b><u>$400</u></div>
            <div className="bs__plan bs__plan--on"><b>Redesign</b><u>$699+</u></div>
            <div className="bs__plan"><b>Custom</b><u>$999+</u></div>
          </div>
        </div>

        <div className="bs__cta"><strong>Let&rsquo;s build something BOLD.</strong><span className="bs__b1">Start Your Project</span></div>
        <div className="bs__foot"><span>BOLD Growth Labs</span><span>boldgrowthlabs@gmail.com</span></div>
      </div>
    </div>
  );
}
