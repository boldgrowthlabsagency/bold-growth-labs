'use client';
import { useEffect, useRef, useState } from 'react';

/* Desktop only. A dot that expands into a labelled disc over interactive
   elements. Disabled entirely on touch and under reduced motion. */
const LABELS: Record<string, string> = {
  build: 'Build', view: 'View Project', open: 'Open', drag: 'Drag',
};

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [on, setOn] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    setOn(true);

    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY; setSeen(true);
      const hit = (e.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null;
      setLabel(hit ? LABELS[hit.dataset.cursor || ''] ?? null : null);
    };
    const tick = () => {
      x += (tx - x) * 0.22; y += (ty - y) * 0.22;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, []);

  if (!on) return null;

  return (
    <div
      ref={dot} aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[999] flex items-center justify-center rounded-full mix-blend-difference"
      style={{
        opacity: seen ? 1 : 0,
        width: label ? 106 : 10, height: label ? 106 : 10,
        background: label ? 'rgba(255,255,255,.95)' : '#fff',
        transition: 'width .34s var(--e-expo), height .34s var(--e-expo), background .34s ease, opacity .2s ease',
      }}
    >
      {label && (
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black">{label}</span>
      )}
    </div>
  );
}
