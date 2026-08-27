'use client';
import { useRef, type ReactNode } from 'react';

/* Subtle magnetic pull + highlight sweep + arrow travel.
   Pointer-type guarded so touch devices never get stuck in a hover state. */
export default function MagneticButton({
  children, href = '#contact', variant = 'primary', className = '', arrow = true, onClick,
}: {
  children: ReactNode; href?: string; variant?: 'primary' | 'ghost';
  className?: string; arrow?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
    el.style.transform = `translate3d(${x}px, ${y - 2}px, 0)`;
  };
  const reset = () => { const el = ref.current; if (el) el.style.transform = 'translate3d(0,0,0)'; };

  const base =
    'group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 ' +
    'text-[13.5px] font-bold tracking-[0.02em] transition-[box-shadow,border-color,background-color] ' +
    'duration-300 will-change-transform';
  const skin =
    variant === 'primary'
      ? 'bg-orange text-white shadow-[var(--sh-glow)] hover:shadow-[0_16px_54px_rgba(232,82,10,.5)]'
      : 'border border-white/25 text-white hover:border-white/60 hover:bg-white/[0.04]';

  return (
    <a
      ref={ref} href={href} data-cursor="build"
      onClick={onClick}
      onPointerMove={move} onPointerLeave={reset}
      className={`${base} ${skin} ${className}`}
      style={{ transition: 'transform .35s var(--e-expo), box-shadow .3s ease, border-color .3s ease' }}
    >
      {/* highlight sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      <span className="relative">{children}</span>
      {arrow && (
        <svg
          className="relative h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-2"
          viewBox="0 0 24 24" fill="none" aria-hidden
        >
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </a>
  );
}
