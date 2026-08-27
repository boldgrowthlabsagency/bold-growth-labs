'use client';
import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

/* ============================================================
   SCRAMBLE / DECODE REVEAL — ported from blacklinedesign.website

   When a line scrolls into view its characters flicker through
   random glyphs and settle left to right, like something being
   decoded. It re-arms on exit, so scrolling back up replays it.

   The reference build did this by swapping innerHTML and putting
   the original markup back afterwards. That fights React for
   ownership of the DOM. Here the real children stay mounted and
   React-owned as an invisible "ghost" — which both reserves the
   exact box so nothing reflows mid-decode, and keeps the true
   text in the accessibility tree throughout. Only the decorative
   overlay is built imperatively, and React never manages it.
   ============================================================ */

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&*<>/~';
const rg = () => GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);

type Char = { c: string; col: string };

/* Flatten to characters, tagging each with the colour it inherits where it
   actually sits. That is what lets a line containing a link or an accent-
   coloured span settle back into its real colours instead of one flat one. */
function buildChars(root: HTMLElement): Char[] {
  const out: Char[] = [];
  (function walk(node: Node) {
    for (let n = node.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) {
        const col = getComputedStyle(n.parentElement as HTMLElement).color;
        const t = n.nodeValue || '';
        for (let k = 0; k < t.length; k++) out.push({ c: t.charAt(k), col });
      } else if (n.nodeType === 1 && n.nodeName !== 'IMG' && n.nodeName !== 'svg') {
        walk(n);
      }
    }
  })(root);
  return out;
}

export default function Scramble({
  as: Tag = 'span',
  children,
  className = '',
  delay = 0,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** ms to hold before decoding — stagger sibling lines into a cascade */
  delay?: number;
}) {
  const host = useRef<HTMLElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);
  const vis = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = host.current, g = ghost.current, v = vis.current;
    if (!el || !g || !v) return;
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0, safety: any, startAt: number | null = null, running = false, armed = true;

    const cleanup = () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
      running = false;
      startAt = null;
      el.classList.remove('is-decoding');
      v.textContent = '';
    };

    const run = () => {
      if (running || !armed) return;
      armed = false;

      const chars = buildChars(g);
      const n = chars.length;
      if (!n) return;
      running = true;

      /* Phones decode roughly twice as fast. A long line at desktop cadence
         leaves a phone screen full of gibberish for several seconds, which
         stops reading as an effect and starts reading as a broken font. */
      const phone = window.matchMedia('(max-width: 760px)').matches;
      const per = phone
        ? Math.max(14, Math.min(30, 820 / n))
        : Math.max(28, Math.min(66, 1800 / n));
      const win = phone ? 150 : 300;   // ms each character spends scrambling
      const tickMs = 34;               //  ~30fps is plenty; every frame just burns paint
      const total = n * per + win;

      const spans: HTMLSpanElement[] = [];
      const frag = document.createDocumentFragment();
      for (let j = 0; j < n; j++) {
        const s = document.createElement('span');
        s.className = 'scr-c is-p';
        frag.appendChild(s);
        spans.push(s);
      }
      v.textContent = '';
      v.appendChild(frag);
      el.classList.add('is-decoding');

      /* A backgrounded tab stops firing rAF. Without this the line would be
         left mid-decode — permanently gibberish — for anyone who switches away
         and comes back. */
      safety = setTimeout(cleanup, total + 900);

      let lastR = -99999;
      const state: number[] = new Array(n).fill(0);

      const frame = (now: number) => {
        if (!running) return;
        if (startAt === null) startAt = now;
        const e = now - startAt;
        if (e >= total) { cleanup(); return; }

        if (now - lastR >= tickMs) {
          lastR = now;
          for (let k = 0; k < n; k++) {
            const ch = chars[k], sp = spans[k];
            const cs = k * per, se = cs + win;
            if (ch.c === ' ') {
              if (state[k] !== 1) { state[k] = 1; sp.textContent = ' '; sp.className = 'scr-c'; }
              continue;
            }
            if (e < cs) {
              if (state[k] !== 2) { state[k] = 2; sp.textContent = ''; sp.className = 'scr-c is-p'; }
            } else if (e < se) {
              sp.textContent = rg(); sp.className = 'scr-c is-s'; state[k] = 3;
            } else if (state[k] !== 4) {
              state[k] = 4; sp.textContent = ch.c; sp.style.color = ch.col; sp.className = 'scr-c';
            }
          }
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    let hold: any;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          clearTimeout(hold);
          hold = setTimeout(run, delay);
        } else if (!running) {
          clearTimeout(hold);
          armed = true;   // re-arm so scrolling back up replays the decode
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 40px 0px' });

    io.observe(el);
    return () => { io.disconnect(); clearTimeout(hold); cleanup(); };
  }, [delay]);

  return (
    <Tag ref={host} className={`scr ${className}`}>
      <span ref={ghost} className="scr-ghost">{children}</span>
      <span ref={vis} className="scr-vis" aria-hidden />
    </Tag>
  );
}

