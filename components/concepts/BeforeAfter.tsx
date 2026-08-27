'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Img, type Slug } from './kit';

/* ============================================================
   BEFORE / AFTER SLIDER

   A dragged handle, not a scroll-driven wipe. The distinction
   matters for these plates: the site was taken back to the
   ground, so the two frames do not register — different roof,
   different footprint, different everything. A scroll wipe rakes
   past that mismatch at whatever speed the page decides and it
   reads as a glitch. A handle the visitor drags puts them in
   charge of the comparison, and the shift between frames becomes
   something they are examining rather than something happening
   to them.

   Input is pointer-based so mouse, trackpad, pen and touch all
   land in one path. The handle is a real focusable control with
   arrow-key support, because dragging is not available to
   everyone and a slider nobody can operate is decoration.
   ============================================================ */

type Props = {
  slug: Slug;
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  /** starting position, 0–100 */
  start?: number;
  sizes?: string;
  className?: string;
  labels?: [string, string];
};

export default function BeforeAfter({
  slug, before, after, beforeAlt, afterAlt,
  start = 50, sizes = '100vw', className = '', labels = ['Before', 'After'],
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(start);
  const [dragging, setDragging] = useState(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    setPct(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  /* Listeners go on the window, not the element. Bound to the element the drag
     dies the moment the pointer leaves it, which is exactly what happens when
     someone drags to either extreme — the end of the range being unreachable is
     the one bug a slider cannot have. */
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => { e.preventDefault(); setFromClientX(e.clientX); };
    const up = () => setDragging(false);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging, setFromClientX]);

  /* stopPropagation is load-bearing, not defensive. The concept modal binds
     ArrowLeft/ArrowRight on `document` to page between builds, so without this
     every arrow press on a focused handle threw the visitor out of Sunline and
     into the next concept — the slider was completely unusable by keyboard.
     Claiming the arrows only while the handle has focus leaves the modal's
     shortcut working everywhere else. */
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const claim = () => { e.preventDefault(); e.stopPropagation(); };
    if (e.key === 'ArrowLeft') { claim(); setPct((p) => Math.max(0, p - step)); }
    else if (e.key === 'ArrowRight') { claim(); setPct((p) => Math.min(100, p + step)); }
    else if (e.key === 'Home') { claim(); setPct(0); }
    else if (e.key === 'End') { claim(); setPct(100); }
  };

  const clip = `inset(0 ${(100 - pct).toFixed(2)}% 0 0)`;

  return (
    <div
      ref={wrap}
      className={`ba ${className}${dragging ? ' ba--dragging' : ''}`}
      onPointerDown={(e) => {
        /* Click anywhere on the plate jumps the handle there, so the whole
           image is the control rather than a 40px target. */
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setDragging(true);
        setFromClientX(e.clientX);
      }}
    >
      {/* AFTER sits underneath and is revealed as the handle moves left */}
      <div className="ba__layer">
        <Img slug={slug} name={after} alt={afterAlt} sizes={sizes} className="ba__img" />
      </div>

      {/* BEFORE is clipped from the right */}
      <div className="ba__layer ba__layer--before" style={{ clipPath: clip, WebkitClipPath: clip }}>
        <Img slug={slug} name={before} alt={beforeAlt} sizes={sizes} className="ba__img" />
      </div>

      <span className="ba__tag ba__tag--l" aria-hidden style={{ opacity: pct > 12 ? 1 : 0 }}>{labels[0]}</span>
      <span className="ba__tag ba__tag--r" aria-hidden style={{ opacity: pct < 88 ? 1 : 0 }}>{labels[1]}</span>

      <div className="ba__seam" style={{ left: `${pct}%` }} aria-hidden />

      <button
        type="button"
        className="ba__handle"
        style={{ left: `${pct}%` }}
        role="slider"
        aria-label={`Reveal ${labels[1]}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={`${Math.round(pct)}% ${labels[1]}`}
        onKeyDown={onKey}
        onPointerDown={(e) => { e.stopPropagation(); setDragging(true); }}
      >
        <span aria-hidden>‹›</span>
      </button>
    </div>
  );
}
