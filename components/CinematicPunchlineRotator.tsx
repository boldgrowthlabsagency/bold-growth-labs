'use client';
import { useEffect, useRef } from 'react';
import { punchlines, PUNCHLINE_HOLD_MS } from '@/lib/data';

/* ============================================================
   PUNCHLINE ROTATOR

   Each punchline is ONE visual composition, and it is built on
   stage in three beats rather than arriving all at once:

     1. the white lead wipes in left to right
     2. a deliberate beat of stillness
     3. the orange accent morphs in through liquid goo
     4. the supporting line arrives last, and cleanly — no blur,
        no goo, because by then the reader is reading, not
        watching, and a second effect there just competes
     5. a long hold, then the whole composition leaves together

   THE GOO (ported from blacklinedesign.website): the blur and the
   threshold live on DIFFERENT elements. The inner ink layer takes
   an animated gaussian blur; the wrapper crushes the result
   through an SVG alpha threshold, which snaps the softened edges
   back to hard ones. Blurred glyphs therefore fatten and fuse
   into blobs rather than merely going out of focus. Collapsing
   both filters onto one element gives a plain blur and the whole
   effect quietly disappears.

   The reference morphs a single short word inside a fixed-width
   slot, so its two words overlap and genuinely pour into each
   other. Here the accent is a whole phrase whose position moves
   with the lead, so instead of cross-morphing two phrases we
   coalesce one out of the goo — and the curves below are shaped
   to spend most of the morph inside the band where the threshold
   actually produces visible blobs.
   ============================================================ */

/* Beat lengths in seconds. */
const LEAD_IN = 1.10;   // left-to-right wipe of the white lead
const GAP     = 1.00;   // stillness before the accent arrives
const MORPH   = 1.50;   // the goo morph itself
const SUPP_IN = 0.70;   // supporting line, clean fade
const HOLD    = PUNCHLINE_HOLD_MS / 1000;   // reading time, everything on screen
const EXIT    = 0.90;

/* Absolute positions on the composition's timeline. */
const T_LEAD  = LEAD_IN;             // lead fully revealed
const T_GAP   = T_LEAD + GAP;        // accent starts morphing
const T_MORPH = T_GAP + MORPH;       // accent fully resolved
const T_SUPP  = T_MORPH + SUPP_IN;   // supporting line landed
const T_HOLD  = T_SUPP + HOLD;       // reading time over
const T_END   = T_HOLD + EXIT;

/* --- the goo curves ---------------------------------------------------
   Two things govern how liquid this actually looks.

   First, opacity has to reach full EARLY — by 22% of the morph. While the
   layer is still semi-transparent the threshold has nothing solid to bite
   on and simply erases it, so any blur spent at low opacity is invisible
   and wasted. Get to opaque fast, then do all the interesting work with
   blur alone.

   Second, the peak has to be high enough. At this weight the strokes are
   thick and resist blurring: 3px only rounds the corners. It takes ~5.5px
   before glyphs genuinely fuse and ~8px before the phrase becomes an
   abstract run of blobs — which is where the morph should START, so there
   is somewhere to travel from. The gentle 1.1 exponent then holds it
   inside the liquid band for most of the morph instead of racing through
   it, which is the difference between a morph you notice and a blur you
   don't. */
const PEAK_BLUR_DESKTOP = 9;
const PEAK_BLUR_PHONE = 7;   // animated blur over the particle video is expensive on phones

const gooOpacity = (p: number) => (p <= 0 ? 0 : Math.min(1, Math.pow(p / 0.22, 0.7)));
const gooBlur = (p: number, peak: number) => peak * Math.pow(1 - p, 1.1);

/* The mass gathers horizontally as it resolves. Transform, not
   letter-spacing — letter-spacing would change the box width and could
   rewrap the line mid-morph. */
const gooSquash = (p: number) => 1 + 0.06 * (1 - p);

const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export default function CinematicPunchlineRotator() {
  const wrap = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const els = slides.current.filter(Boolean) as HTMLDivElement[];
    if (!els.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const peak = window.matchMedia('(max-width: 900px)').matches
      ? PEAK_BLUR_PHONE : PEAK_BLUR_DESKTOP;

    const q = (el: HTMLElement, sel: string) => el.querySelector(sel) as HTMLElement;

    /* The reveal is a gradient mask sweeping across the line rather than a
       per-letter stagger: nothing is split into spans, so the headline stays
       one selectable, screen-reader-legible string, and the edge is a soft
       gradient instead of a row of popping glyphs. */
    const paintLead = (el: HTMLElement, p: number) => {
      const a = p * 122 - 22;
      el.style.setProperty('--wipe-a', `${a.toFixed(2)}%`);
      el.style.setProperty('--wipe-b', `${(a + 22).toFixed(2)}%`);
    };

    const paintGoo = (el: HTMLElement, p: number) => {
      el.style.opacity = gooOpacity(p).toFixed(3);
      el.style.filter = `blur(${gooBlur(p, peak).toFixed(2)}px)`;
      el.style.transform = `scaleX(${gooSquash(p).toFixed(4)})`;
    };

    let killed = false, ctx: any;

    (async () => {
      const { gsap } = await import('gsap');
      if (killed) return;

      const easeLead = gsap.parseEase('power2.inOut');
      const easeMorph = gsap.parseEase('power1.inOut');

      ctx = gsap.context(() => {
        /* Park every composition off stage in its pre-reveal state. */
        els.forEach((el) => {
          gsap.set(el, { autoAlpha: 0, filter: 'blur(0px)', y: 0 });
          q(el, '[data-goo]').classList.add('is-live');
          paintLead(q(el, '[data-lead]'), 0);
          paintGoo(q(el, '[data-ink]'), 0);
          gsap.set(q(el, '[data-supp]'), { opacity: 0, y: 12 });
        });

        let idx = 0;
        let current: any = null;
        let visible = true;
        const shouldRun = () => visible && !document.hidden;

        /* One timeline per composition, chained on completion rather than
           fired by an interval. An interval would eventually collide with a
           cycle that ran long; chaining cannot drift or overlap. */
        const runCycle = () => {
          if (killed) return;
          const el = els[idx];
          const lead = q(el, '[data-lead]');
          const goo = q(el, '[data-goo]');
          const ink = q(el, '[data-ink]');
          const supp = q(el, '[data-supp]');

          gsap.set(el, { autoAlpha: 1, filter: 'blur(0px)', y: 0 });
          gsap.set(supp, { opacity: 0, y: 12 });
          gsap.set(goo, { scale: 1 });
          paintLead(lead, 0);
          paintGoo(ink, 0);

          const tl: any = gsap.timeline({
            onUpdate: () => {
              const t = tl.time();
              paintLead(lead, t >= T_LEAD ? 1 : easeLead(clamp(t / LEAD_IN)));
              paintGoo(ink, t <= T_GAP ? 0 : easeMorph(clamp((t - T_GAP) / MORPH)));
            },
            onComplete: () => {
              gsap.set(el, { autoAlpha: 0 });
              idx = (idx + 1) % els.length;
              runCycle();
            },
          });

          tl
            /* A whisper of a settle on the accent as it finishes fusing. */
            .fromTo(goo, { scale: 0.985 }, { scale: 1, duration: MORPH, ease: 'power2.out' }, T_GAP)
            /* Supporting line — last, and deliberately plain. */
            .fromTo(supp, { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: SUPP_IN, ease: 'power2.out' }, T_MORPH)
            /* The composition leaves as one piece. */
            .to(el, { opacity: 0, filter: 'blur(12px)', y: -14, duration: EXIT, ease: 'power2.in' }, T_HOLD)
            .set(el, { autoAlpha: 0, filter: 'blur(0px)', y: 0 }, T_END);

          current = tl;
          if (!shouldRun()) tl.pause();
        };

        /* The threshold filter re-rasterises the accent on every frame it
           moves, so it is not something to leave running under a footer
           nobody is looking at. */
        const sync = () => {
          if (!current) return;
          shouldRun() ? current.play() : current.pause();
        };

        let io: IntersectionObserver | null = null;
        if ('IntersectionObserver' in window && wrap.current) {
          io = new IntersectionObserver(
            (es) => es.forEach((e) => { visible = e.isIntersecting; sync(); }),
            { threshold: 0 },
          );
          io.observe(wrap.current);
        }

        const onVis = () => sync();
        document.addEventListener('visibilitychange', onVis);

        runCycle();
        sync();

        return () => {
          current?.kill();
          io?.disconnect();
          document.removeEventListener('visibilitychange', onVis);
        };
      }, wrap);
    })();

    return () => { killed = true; ctx?.revert?.(); };
  }, []);

  return (
    <div ref={wrap} className="relative">
      {/* Liquid-goo threshold. Blur first, then crush the alpha channel so
          everything above roughly half-opaque snaps to solid and everything
          below vanishes — that hard cutoff is what turns blurred glyphs into
          blobs. The RGB rows are identity, so the orange passes through
          untouched and the filter stays background-agnostic. */}
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

      <div className="relative" style={{ minHeight: 'var(--rot-h, 11.5rem)' }}>
        {punchlines.map((p, i) => (
          <div
            key={p.headline}
            ref={(el) => { slides.current[i] = el; }}
            className="absolute inset-0"
            style={{ visibility: i === 0 ? 'visible' : 'hidden', opacity: i === 0 ? 1 : 0 }}
            aria-hidden={i > 0}
          >
            <h1 className="display display--hero origin-left">
              <span data-lead className="wipe text-white">{p.headline}</span>{' '}
              <span data-goo className="goo text-orange">
                <span data-ink className="goo__ink">{p.accent}</span>
              </span>
            </h1>
            <p
              data-supp
              className="mt-5 max-w-[36ch] text-[var(--step-1)] leading-snug text-white/70 will-change-[transform,opacity]"
            >
              {p.supporting}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
