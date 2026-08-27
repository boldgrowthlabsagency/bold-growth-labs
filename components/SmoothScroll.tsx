'use client';
import { useEffect } from 'react';

/* Lenis gives the whole page the weighted feel that separates a premium build
   from a default one. Skipped entirely under reduced motion.

   It also intercepts wheel and touch events across the whole document and
   drives the page itself, which means ANY nested scrolling container is dead
   on arrival unless Lenis is told to leave it alone. The concept takeover is
   exactly that — a full-viewport panel with its own scroller inside — so it
   was opening and then refusing to scroll.

   Two things fix it and both are needed. The stage carries
   `data-lenis-prevent`, which Lenis honours for events originating inside that
   subtree. And the takeover parks Lenis outright while it is open, via the
   handle below, because the page behind is scroll-locked anyway and a running
   instance has nothing useful to do. */

type LenisLike = { stop: () => void; start: () => void; raf: (t: number) => void; destroy?: () => void };

let instance: LenisLike | null = null;

/** Pause page smooth-scrolling. Safe to call when Lenis never initialised. */
export const pauseSmoothScroll = () => instance?.stop();
/** Resume it. Safe to call when Lenis never initialised. */
export const resumeSmoothScroll = () => instance?.start();

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let lenis: LenisLike | null = null, raf = 0, dead = false;
    (async () => {
      const { default: Lenis } = await import('lenis');
      if (dead) return;
      lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
      }) as unknown as LenisLike;
      instance = lenis;
      const tick = (t: number) => { lenis?.raf(t); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    })();
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      lenis?.destroy?.();
      if (instance === lenis) instance = null;
    };
  }, []);
  return null;
}
