'use client';
import { useEffect, useState } from 'react';

/* Counts down to a real deadline. Renders nothing until mounted, so the
   server's clock and the visitor's never disagree on screen. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export default function Countdown({ to, className = '' }: { to: string; className?: string }) {
  const now = useNow();
  if (now === null) return <div className={`h-[74px] ${className}`} aria-hidden />;
  const p = parts(Date.parse(to) - now);
  const cells: [number, string][] = [[p.d, 'days'], [p.h, 'hrs'], [p.m, 'min'], [p.s, 'sec']];
  return (
    <div className={`flex gap-2 ${className}`} role="timer" aria-label={`${p.d} days ${p.h} hours ${p.m} minutes left`}>
      {cells.map(([n, l]) => (
        <div key={l} className="flex min-w-[64px] flex-col items-center rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5">
          <span className="text-[26px] font-extrabold tabular-nums leading-none">{String(n).padStart(2, '0')}</span>
          <span className="mt-1.5 text-[10.5px] uppercase tracking-[0.14em] text-white/45">{l}</span>
        </div>
      ))}
    </div>
  );
}
