'use client';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import MagneticButton from './MagneticButton';
import Scramble from './Scramble';
import { nav } from '@/lib/data';

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const f = () => setSolid(window.scrollY > 24);
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500"
      style={{
        background: solid ? 'rgba(var(--navy-rgb), .72)' : 'transparent',
        backdropFilter: solid ? 'blur(16px) saturate(140%)' : 'none',
        borderBottom: `1px solid ${solid ? 'rgba(255,255,255,.08)' : 'transparent'}`,
      }}
    >
      <div className="shell flex h-[74px] items-center justify-between">
        <a href="#top" aria-label="BOLD Growth Labs home" data-cursor="open" className="inline-flex min-h-[44px] items-center">
          <Logo variant="full" className="hidden sm:block" />
          <Logo variant="compact" className="sm:hidden" />
        </a>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {nav.map((n, i) => (
            <a
              key={n.href} href={n.href}
              className="group relative text-[13.5px] text-muted transition-colors duration-300 hover:text-white"
            >
              <Scramble delay={140 + i * 110}>{n.label}</Scramble>
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-orange transition-[width] duration-300 ease-out group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <MagneticButton href="#contact" className="hidden sm:inline-flex !px-6 !py-3 !text-[12.5px]">
            Start a Project
          </MagneticButton>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open} aria-label="Toggle menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <span className="h-px w-5 bg-white transition-transform" style={{ transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }} />
            <span className="h-px w-5 bg-white transition-opacity" style={{ opacity: open ? 0 : 1 }} />
            <span className="h-px w-5 bg-white transition-transform" style={{ transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden md:hidden"
        style={{
          maxHeight: open ? 320 : 0,
          transition: 'max-height .5s var(--e-expo)',
          background: 'rgba(var(--navy-rgb), .96)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <nav className="shell flex flex-col gap-1 py-5" aria-label="Mobile">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-2.5 text-lg font-semibold">
              {n.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="mt-3 rounded-full bg-orange px-6 py-3 text-center text-sm font-bold">
            Start a Project →
          </a>
        </nav>
      </div>
    </header>
  );
}
