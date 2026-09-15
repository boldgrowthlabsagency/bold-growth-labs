'use client';
import { useEffect, useRef } from 'react';
import { HERO, HERO_DWELL_MS } from '@/lib/data';

/* ============================================================
   HERO — ONE MORPHING WORD

   Two fixed lines. Only the adjective moves:

       [Next-Gen → Innovative → …] Websites.
       Scaling Businesses.

   The previous version swapped whole compositions — headline,
   accent and a supporting line all leaving together. That gives
   the eye nothing to hold on to and the hero never settles.
   Cycling one word inside an otherwise still headline reads as
   deliberate rather than restless.

   THE GOO: the blur and the threshold live on DIFFERENT elements.
   The two ink layers take an animated gaussian blur; the wrapper
   crushes the result through an SVG alpha threshold, snapping the
   softened edges back to hard ones. Blurred glyphs therefore
   fatten and FUSE rather than merely going out of focus. Collapse
   both onto one element and it degrades silently to an ordinary
   blur — the whole effect quietly disappears.

   THE SIZER is what makes this a morph rather than a crossfade.
   Both words sit absolutely positioned on top of each other, so
   they genuinely pour into one another; an in-flow hidden span
   carries the box width and the baseline, keeping " Websites."
   snug on the same line. That span also holds a real word, so
   with JS off or motion reduced the headline still reads.
   ============================================================ */

const MORPH = 1.5;                        // seconds, word to word
const DWELL = HERO_DWELL_MS / 1000;       // seconds fully resolved

/* ------------------------------------------------------------------
   THE GOO — reverted to the original mechanism.

   A deformation-based melt replaced this for a while, to avoid relying
   on an SVG filter that iOS Safari handles inconsistently. It was not
   an improvement, so this is back to the version that was here before:
   the blur and the threshold live on DIFFERENT elements. The two ink
   layers take an animated gaussian blur; the wrapper crushes the
   result through an SVG alpha threshold, which snaps softened edges
   back to hard ones, so blurred glyphs fatten and FUSE rather than
   merely going out of focus.

   Collapsing both filters onto one element degrades it silently to an
   ordinary blur — the whole effect disappears and nobody can see why.

   Two things govern how liquid it looks. Opacity has to reach full
   EARLY, by 22% of the morph: while a layer is still semi-transparent
   the threshold has nothing solid to bite on and simply erases it, so
   blur spent at low opacity is wasted. And the peak has to be high
   enough — at this weight the strokes are thick and resist blurring,
   and it takes roughly 5.5px before glyphs genuinely fuse.
   ------------------------------------------------------------------ */

const PEAK_DESKTOP = 9;
const PEAK_PHONE = 7;   // animated blur over the hero video is expensive on phones

const gooOpacity = (p: number) => (p <= 0 ? 0 : Math.min(1, Math.pow(p / 0.22, 0.7)));
const gooBlur = (p: number, peak: number) => peak * Math.pow(1 - p, 1.1);
/* The mass gathers horizontally as it resolves. Transform, not letter-spacing —
   letter-spacing changes the box width and would fight the pinned slot. */
const gooSquash = (p: number) => 1 + 0.06 * (1 - p);

const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export default function CinematicPunchlineRotator() {
  const wrap = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLSpanElement>(null);
  const sizer = useRef<HTMLSpanElement>(null);
  const a = useRef<HTMLSpanElement>(null);
  const b = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const els = { slot: slot.current, sizer: sizer.current, a: a.current, b: b.current };
    if (!els.slot || !els.sizer || !els.a || !els.b) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (HERO.words.length < 2) return;

    const peak = window.matchMedia('(max-width: 900px)').matches ? PEAK_PHONE : PEAK_DESKTOP;
    els.slot.classList.add('is-live');

    /* Pin the slot to the WIDEST word so the tail never moves.

       Tweening the width to each incoming word made "Websites." glide left and
       right on every cycle, which pulls the eye to the wrong thing — the point
       of morphing one word is that everything else holds still. Measuring all
       of them up front and locking the box means the tail is nailed down and
       only the glyphs inside the slot change.

       Re-measured on resize because the hero font-size is viewport-derived, so
       the widest word is a different number of pixels at every width. */
    const sizeSlot = () => {
      const el = els.sizer!;
      const keep = el.textContent;
      let widest = 0;
      for (const w of HERO.words) {
        el.textContent = w;
        widest = Math.max(widest, el.getBoundingClientRect().width);
      }
      el.textContent = keep;
      const fs = parseFloat(getComputedStyle(els.slot!).fontSize);
      /* A little breathing room, in em so it tracks the type size. */
      els.slot!.style.width = `${Math.ceil(widest + fs * 0.08)}px`;
    };
    sizeSlot();

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(sizeSlot);
    };
    window.addEventListener('resize', onResize);

    let killed = false;
    let ctx: { revert?: () => void } | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      if (killed) return;
      const ease = gsap.parseEase('power1.inOut');

      ctx = gsap.context(() => {
        let i = 0;
        let out = els.a!;   // the layer currently leaving
        let into = els.b!;  // the layer currently arriving
        let current: gsap.core.Timeline | null = null;
        let onScreen = true;
        const shouldRun = () => onScreen && !document.hidden;

        const paint = (el: HTMLElement, p: number) => {
          el.style.opacity = gooOpacity(p).toFixed(3);
          el.style.filter = `blur(${gooBlur(p, peak).toFixed(2)}px)`;
          el.style.transform = `scaleX(${gooSquash(p).toFixed(4)})`;
        };

        /* Start state: first word solid on layer A, nothing on B. */
        els.a!.textContent = HERO.words[0];
        els.b!.textContent = '';
        paint(els.a!, 1);   // first word, fully resolved
        paint(els.b!, 0);   // second layer parked

        const cycle = () => {
          if (killed) return;
          const next = HERO.words[(i + 1) % HERO.words.length];
          into.textContent = next;
          /* The sizer still carries the current word for screen readers, but
             it no longer drives the box — the slot is pinned to the widest
             word, so nothing after it shifts. */
          els.sizer!.textContent = next;

          const tl = gsap.timeline({
            onUpdate: () => {
              const p = ease(clamp(tl.time() / MORPH));
              paint(out, 1 - p);
              paint(into, p);
            },
            onComplete: () => {
              /* Hand over: the arrived layer becomes the one that leaves next. */
              const t = out; out = into; into = t;
              i = (i + 1) % HERO.words.length;
              current = null;
              gsap.delayedCall(DWELL, cycle);
            },
          });
          tl.to({}, { duration: MORPH });   // drives onUpdate; the box itself never moves
          current = tl;
          if (!shouldRun()) tl.pause();
        };

        /* The threshold re-rasterises the slot on every frame it moves, so it
           is not something to leave running under a fold nobody is looking at. */
        const sync = () => { if (current) shouldRun() ? current.play() : current.pause(); };

        let io: IntersectionObserver | null = null;
        if ('IntersectionObserver' in window && wrap.current) {
          io = new IntersectionObserver(
            (es) => es.forEach((e) => { onScreen = e.isIntersecting; sync(); }),
            { threshold: 0 },
          );
          io.observe(wrap.current);
        }
        const onVis = () => sync();
        document.addEventListener('visibilitychange', onVis);

        gsap.delayedCall(DWELL, cycle);

        return () => {
          current?.kill();
          io?.disconnect();
          document.removeEventListener('visibilitychange', onVis);
          window.removeEventListener('resize', onResize);
          cancelAnimationFrame(resizeRaf);
        };
      }, wrap);
    })();

    return () => { killed = true; ctx?.revert?.(); };
  }, []);

  return (
    <div ref={wrap} className="relative">
      {/* Blur first, then crush the alpha channel so everything above roughly
          half-opaque snaps to solid and everything below vanishes — that hard
          cutoff is what turns blurred glyphs into blobs. The RGB rows are
          identity, so the orange passes through untouched. */}
      <svg width="0" height="0" aria-hidden focusable="false"
           style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <filter id="bgl-goo-threshold" x="-25%" y="-25%" width="150%" height="150%"
                  colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
            <feColorMatrix in="blur" type="matrix"
                           values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" />
          </filter>
        </defs>
      </svg>


      {/* One heading, one string to a screen reader. The morphing slot is
          marked aria-hidden and the sizer carries the readable word, so
          assistive tech is never read a half-finished morph. */}
      <h1 className="display display--hero">
        <span ref={slot} className="goo whitespace-nowrap text-orange">
          <span ref={sizer} className="goo__sizer">{HERO.words[0]}</span>
          <span ref={a} className="goo__ink absolute left-0 top-0" aria-hidden />
          <span ref={b} className="goo__ink absolute left-0 top-0" aria-hidden />
        </span>{' '}
        <span className="text-white">{HERO.tail}</span>
        <br />
        <span className="text-white">{HERO.line2}</span>
      </h1>
    </div>
  );
}
