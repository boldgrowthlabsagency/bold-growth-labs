'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/* Reveals once and stays revealed. Never re-hides content the user has
   already read — that is the single most common scroll-animation bug. */
export default function SectionReveal({
  children, delay = 0, y = 22, as: Tag = 'div', className = '',
}: { children: ReactNode; delay?: number; y?: number; as?: any; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as any}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translate3d(0, ${y}px, 0)`,
        transition: `opacity .7s var(--e-expo) ${delay}ms, transform .7s var(--e-expo) ${delay}ms`,
        willChange: shown ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  );
}
