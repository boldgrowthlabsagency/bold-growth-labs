'use client';
import { useEffect, useRef } from 'react';
import CinematicPunchlineRotator from './CinematicPunchlineRotator';
import Scramble from './Scramble';
import MagneticButton from './MagneticButton';
import { PHONE } from '@/lib/data';

/* The particle band stays exactly as designed: the molecule lives in its own
   frame and nothing is ever layered on top of it, so it can never be cropped
   or obscured. The punchline composition sits beneath it. */
export default function Hero() {
  const v = useRef<HTMLVideoElement>(null);
  const band = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = v.current, b = band.current;
    if (!el || !b) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.removeAttribute('src'); return; }

    /* Order matters. muted/playsInline must be set BEFORE the source is
       (re)loaded or iOS refuses to autoplay. And swapping .src after the
       element has begun fetching does nothing until load() is called — that
       omission is what left the mobile hero frozen on its poster. */
    el.muted = true; el.defaultMuted = true; el.playsInline = true; el.loop = true;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');

    const live = () => { b.classList.add('is-live'); b.classList.remove('is-blocked'); };

    /* iOS Low Power Mode refuses autoplay outright — muted and playsinline make
       no difference, play() simply rejects. It is not a bug we can code around,
       because Apple requires a real user gesture. So when the promise rejects we
       arm the whole document: the visitor's very next tap or scroll counts as
       that gesture and the video starts. Meanwhile the band flags itself so the
       poster reads as deliberate rather than broken. */
    const unlock = () => {
      const pr = el.play();
      if (pr && pr.then) pr.then(live).catch(() => {});
    };
    const GESTURES = ['pointerdown', 'touchstart', 'touchend', 'click', 'scroll', 'keydown'] as const;
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      b.classList.add('is-blocked');
      GESTURES.forEach((g) =>
        document.addEventListener(g, unlock, { passive: true } as AddEventListenerOptions));
    };
    const disarm = () => {
      GESTURES.forEach((g) => document.removeEventListener(g, unlock));
    };

    const start = () => {
      const pr = el.play();
      if (pr && pr.then) pr.then(live).catch(arm);
      else live();
    };

    el.addEventListener('loadeddata', () => { if (el.readyState >= 2) start(); });
    el.addEventListener('canplay', () => { if (el.paused) start(); });
    el.addEventListener('playing', live);
    el.addEventListener('pause', () => { if (!el.ended) arm(); });

    /* 900px, not 768 — it has to match the CSS breakpoint that switches the
       band's aspect ratio, or a tablet gets the tall mobile frame with the wide
       desktop clip inside it and the molecule shrinks into a letterbox. */
    if (window.matchMedia('(max-width: 900px)').matches && el.dataset.mobileSrc) {
      el.src = el.dataset.mobileSrc;
      el.poster = '/poster-mobile.jpg';
      const p = document.getElementById('heroPoster') as HTMLImageElement | null;
      if (p) p.src = '/poster-mobile.jpg';
      el.load();                    // <- without this the swap never takes effect
    } else if (el.readyState >= 2) {
      start();
    }

    /* Safari sometimes fires nothing at all if the tab was backgrounded during
       load. Nudge it once when the page becomes visible again. */
    const onVis = () => { if (!document.hidden && el.paused) start(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { document.removeEventListener('visibilitychange', onVis); disarm(); };
  }, []);

  return (
    <section id="top" className="relative">
      {/* ---------- particle band ---------- */}
      <div
        ref={band}
        className="hero-band grain relative w-full overflow-hidden"
        style={{ background: '#000427' }}
      >
        <video
          ref={v} id="heroVideo" className="absolute inset-0 h-full w-full object-contain"
          src="/hero.mp4" data-mobile-src="/hero-mobile.mp4" poster="/poster.jpg"
          muted playsInline loop preload="auto" aria-hidden
        />
        <img id="heroPoster" src="/poster.jpg" alt="" aria-hidden className="hero-poster absolute inset-0 h-full w-full object-contain" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[26%]"
             style={{ background: 'linear-gradient(0deg, var(--bold-navy) 0%, rgba(var(--navy-rgb),.6) 45%, transparent 100%)' }} />
        <span className="hero-tag absolute bottom-6 left-6 z-[3] rounded border border-white/15 bg-black/30 px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.19em] text-white/55 backdrop-blur-sm">
          Particle study
        </span>
        {/* Only ever visible when the browser has refused autoplay (iOS Low
            Power Mode). One tap anywhere on the page clears it. */}
        <span className="hero-tap absolute bottom-6 left-6 z-[3] items-center gap-2 rounded border border-white/25 bg-black/45 px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.19em] text-white/85 backdrop-blur-sm">
          <i aria-hidden />Tap to play
        </span>
      </div>

      {/* ---------- punchline ---------- */}
      <div className="relative overflow-hidden">
        <div className="lightsource" style={{ inset: '-30% 30% 20% -20%' }} />
        <div className="shell hero-copy relative z-[2] pb-[clamp(2.5rem,6vh,4rem)] pt-[clamp(1.25rem,3vh,2.4rem)]">
          <p className="eyebrow mb-4"><Scramble>Bold Growth Labs</Scramble></p>
          <CinematicPunchlineRotator />
          {/* Supporting positioning line. Two beats on two lines: the first
              sets up the situation, the second answers it. Both are legible on
              their own — the earlier version dimmed the first half to 60% and
              lifted the second to 85%, which read as half the sentence being
              greyed out or disabled rather than as emphasis. The step now runs
              upward into full white, so the accent lands as a deliberate
              close instead of the opening looking broken. */}
          <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-white/75 md:mt-7 md:text-base">
            A new site, a rebuild, or finally getting found.
            <span className="mt-1 block font-medium text-white">
              Impactful builds, engineered to convert.
            </span>
          </p>

          {/* capability pills */}
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Capabilities">
            {['Websites', 'AI Creative', 'SEO & AI Search', 'Automation'].map((c) => (
              <li key={c} className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/55">
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
            <MagneticButton href="#contact">Get a Free Growth Audit</MagneticButton>
            <MagneticButton href={`tel:${PHONE}`} variant="ghost" arrow={false}>Call BOLD</MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
