'use client';
import { useEffect, useRef, useState } from 'react';
import { laptopBeats } from '@/lib/data';
import Logo from './Logo';
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
  const spill = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const [lit, setLit] = useState(0);      // 0 → 1 backlight ramp
  const [feed, setFeed] = useState(0);    // 0 → 1 scroll position inside the screen
  const feedEl = useRef<HTMLDivElement>(null);
  const areaEl = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0); // px the page can move before its end

  useEffect(() => {
    const sec = section.current;
    if (!sec) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lid.current?.style.setProperty('transform', 'rotateX(-14deg)');
      setLit(1); setFeed(0); setBeat(laptopBeats.length - 1);
      return;
    }

    let raf = 0, target = 0, cur = 0;

    /* Measure how far the page inside the screen can actually travel.

       The previous version set the feed to `min-height: 200%` and moved it a
       flat -50%, assuming the percentage would resolve against the screen.
       Inside a flex column with an indefinite content height that percentage
       is unreliable — so the feed was often shorter than assumed and -50%
       scrolled it clean off the bottom, which is the blank panel. Measuring
       both boxes removes the guess entirely. */
    const measureFeed = () => {
      const f = feedEl.current, a = areaEl.current;
      if (!f || !a) return;
      setTravel(Math.max(0, f.scrollHeight - a.clientHeight));
    };

    const measure = () => {
      const r = sec.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target = clamp(-r.top / (total || 1));
    };

    const draw = () => {
      cur += (target - cur) * 0.11;
      const p = cur;

      /* A complete arc rather than an open-and-hold:

           0   → .32   the hinge opens and the screen lights
           .32 → .78   the page scrolls inside the screen
           .78 → 1     the lid closes again and the light dies

         Closing at the end is what removes the blank-panel problem for good —
         the page stops travelling before it can reach its own end, and the
         section finishes on a shut laptop instead of an empty screen. */
      const open  = clamp(p / 0.32);
      const read  = clamp((p - 0.32) / 0.46);
      const close = clamp((p - 0.78) / 0.22);

      /* Closed −90°, open −4°, then shut again — the reference's range. */
      const deg = -90 + open * 86 - close * 86;
      const lift = read * (1 - close);              // eases forward while readable

      if (lid.current) lid.current.style.transform = `rotateX(${deg}deg)`;
      if (rig.current) {
        rig.current.style.transform =
          `perspective(1500px) rotateX(${-22 + open * 4 - close * 3}deg) ` +
          `translate3d(0, ${lift * -8}px, ${lift * 50}px) scale(${1 + lift * 0.02})`;
      }
      /* the hinge light rises as it opens and goes out as it shuts */
      if (glow.current) glow.current.style.opacity = String(clamp(open * 1.5) * (1 - close));
      /* the panel throws light as it comes up, and stops when it shuts */
      if (spill.current) spill.current.style.opacity = String(clamp((open - 0.25) / 0.6) * (1 - close));

      /* A boolean here was the "black for a split second then loads" glitch:
         the screen sat at its near-black glass colour until open crossed 0.66,
         then the whole UI cross-faded in at once. A ramp lights it the way a
         real panel does — backlight first, content resolving as it brightens.
         Rounded so React is not handed a new value on all 60 frames a second. */
      /* Light up with the hinge, and die with it. */
      setLit(Math.round(clamp((open - 0.18) / 0.42) * (1 - close) * 20) / 20);
      /* The page inside the screen scrolls with the reader. Quantised for the
         same reason — the transform is smooth, the state updates are not. */
      /* Scrolls only during the reading phase, so it never runs off the end. */
      setFeed(Math.round(read * 100) / 100);
      setBeat(p < 0.34 ? 0 : p < 0.66 ? 1 : 2);

      raf = requestAnimationFrame(draw);
    };

    measure();
    measureFeed();
    /* Re-measure once webfonts land, or the first pass measures fallback type. */
    (document as any).fonts?.ready?.then(measureFeed).catch(() => {});
    window.addEventListener('resize', measureFeed);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('resize', measureFeed);
    };
  }, []);

  return (
    <>
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
              {/* the four edges of the panel, so it has an actual edge to see */}
              <div className="laptop__lidwall laptop__lidwall--top" aria-hidden />
              <div className="laptop__lidwall laptop__lidwall--bot" aria-hidden />
              <div className="laptop__lidwall laptop__lidwall--left" aria-hidden />
              <div className="laptop__lidwall laptop__lidwall--right" aria-hidden />
              <div className="laptop__screen">
                <div className="laptop__backlight" style={{ opacity: lit * 0.55 }} aria-hidden />
                <div className="laptop__glass" />
                <MiniSite lit={lit} feed={feed} travel={travel} feedRef={feedEl} areaRef={areaEl} />
              </div>
            </div>
            {/* base */}
            <div className="laptop__base">
              <div className="laptop__baseunder" aria-hidden />
              <div className="laptop__keys" aria-hidden>
                {[14, 14, 13, 12, 0].map((n, r) =>
                  n === 0 ? (
                    <div key={r} className="laptop__krow laptop__krow--space">
                      {Array.from({ length: 5 }).map((_, i) => <span key={i} />)}
                    </div>
                  ) : (
                    <div key={r} className="laptop__krow" style={{ ['--keys' as any]: n }}>
                      {Array.from({ length: n }).map((_, i) => <span key={i} />)}
                    </div>
                  ),
                )}
              </div>
              <div className="laptop__pad" aria-hidden />
            </div>
            <div ref={glow} className="laptop__hingeglow" aria-hidden />
            <div ref={spill} className="laptop__spill" aria-hidden />
          </div>
          <div className="laptop__shadow" aria-hidden />
        </div>

        {/* ---------- synchronized punchline ---------- */}
        <div className="shell relative z-[3] h-[3.2em] w-full overflow-hidden text-center">
          {laptopBeats.map((b, i) => (
            <p
              key={b.text}
              className="absolute inset-x-0 mx-auto max-w-[28ch] text-[var(--step-1)] font-semibold leading-snug"
              style={{
                opacity: beat === i ? 1 : 0,
                transform: `translate3d(0, ${beat === i ? 0 : beat > i ? -34 : 34}px, 0)`,
                filter: beat === i ? 'blur(0px)' : 'blur(7px)',
                transition: 'opacity .55s var(--e-expo), transform .55s var(--e-expo), filter .55s var(--e-expo)',
              }}
            >
              {(() => {
                /* Split on the accent so the emphasis is data-driven, and honour
                   the `|` in the copy as a hard line break. Falls back to the
                   plain line if the phrase is edited out of the sentence. */
                const at = b.text.indexOf(b.accent);
                const parts = at < 0
                  ? [b.text]
                  : [b.text.slice(0, at), b.accent, b.text.slice(at + b.accent.length)];
                return parts.map((chunk, ci) => {
                  const lines = chunk.split('|');
                  const inner = lines.map((ln, li) => (
                    <span key={li}>
                      {li > 0 && <br />}
                      {ln}
                    </span>
                  ));
                  return ci === 1
                    ? <span key={ci} className="text-orange">{inner}</span>
                    : <span key={ci}>{inner}</span>;
                });
              })()}
            </p>
          ))}
        </div>
      </div>
      </section>

      <div className="shell relative z-[3] pb-16" style={{ background: 'var(--bold-navy)' }}>
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
    </>
  );
}

/* A full BOLD Growth Labs site living inside the screen — nav, hero, service
   grid, proof stats, pricing row, CTA and footer. Enough content that it reads
   as a real page rather than a placeholder. */
function MiniSite({ lit, feed, travel, feedRef, areaRef }: {
  lit: number; feed: number; travel: number;
  feedRef: React.RefObject<HTMLDivElement>; areaRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      className="laptop__ui"
      style={{ opacity: lit }}
      aria-hidden
    >
      <div className="bs__nav">
        <span className="bs__logo"><Logo variant="full" /></span>
        <nav><span>Work</span><span>Services</span><span>Process</span><span>Pricing</span></nav>
        <span className="bs__navcta">Start a Project</span>
      </div>

      {/* the page scrolls inside the screen as the reader scrolls the real one */}
      <div ref={areaRef} className="bs__scrollarea">
        {/* Travel is measured, in px, so the last section always lands flush
            with the bottom of the panel and it can never scroll to blank. */}
        <div ref={feedRef} className="bs__feed" style={{ transform: `translate3d(0, ${(-feed * travel).toFixed(1)}px, 0)` }}>
        <div className="bs__hero">
          <span className="bs__eyebrow">Bold Growth Labs</span>
          <strong><em>Next-Gen</em> Websites.<br />Scaling Businesses.</strong>
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
          <span className="bs__lbl">What clients say</span>
          <p className="bs__quote">&ldquo;Calls started coming in the first week. It finally looks like the business we actually are.&rdquo;</p>
          <span className="bs__quoteby">Owner &middot; Home services</span>
        </div>

        <div className="bs__sec">
          <span className="bs__lbl">Recent work</span>
          <div className="bs__work">
            <div className="bs__wcard"><i /><b>Sunline</b><u>Pools &amp; Patios</u></div>
            <div className="bs__wcard"><i /><b>Ridgeline</b><u>Roofing</u></div>
            <div className="bs__wcard"><i /><b>Meridian</b><u>Cabinetry</u></div>
          </div>
        </div>

        <div className="bs__sec bs__sec--alt">
          <span className="bs__lbl">How it works</span>
          <div className="bs__steps">
            <div className="bs__step"><em>01</em><b>Discover</b></div>
            <div className="bs__step"><em>02</em><b>Design</b></div>
            <div className="bs__step"><em>03</em><b>Build</b></div>
            <div className="bs__step"><em>04</em><b>Launch</b></div>
          </div>
        </div>

        <div className="bs__sec">
          <span className="bs__lbl">Common questions</span>
          <div className="bs__faq">
            <div className="bs__q"><b>How long does it take?</b><i>+</i></div>
            <div className="bs__q"><b>Do I own the site?</b><i>+</i></div>
            <div className="bs__q"><b>Can you write the copy?</b><i>+</i></div>
          </div>
        </div>

        <div className="bs__cta"><strong>Let&rsquo;s build something BOLD.</strong><span className="bs__b1">Start Your Project</span></div>
        <div className="bs__foot"><span>BOLD Growth Labs</span><span>boldgrowthlabs@gmail.com</span></div>
        </div>
      </div>
    </div>
  );
}
