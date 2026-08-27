import Logo from './Logo';
import Scramble from './Scramble';
import { nav } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-14" style={{ background: 'var(--bold-slate)' }}>
      <div className="shell">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="max-w-[300px]">
            <Logo variant="full" />
            {/* Staggered delays cascade the decode down the footer as it comes
                into view, instead of firing every line at the same instant. */}
            <Scramble as="p" className="mt-4 block text-sm leading-relaxed text-muted" delay={0}>
              Design. Strategy. Growth. Websites built to make people stop.
            </Scramble>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-1" aria-label="Footer">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="inline-flex min-h-[44px] items-center text-sm text-muted transition-colors hover:text-white">{n.label}</a>
            ))}
            <a href="#faq" className="inline-flex min-h-[44px] items-center text-sm text-muted transition-colors hover:text-white">FAQ</a>
          </nav>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/35">
          <Scramble delay={90}>&copy; {new Date().getFullYear()} BOLD Growth Labs.</Scramble>
          <a href="mailto:boldgrowthlabs@gmail.com" className="inline-flex min-h-[44px] items-center transition-colors hover:text-white">
            <Scramble delay={180}>boldgrowthlabs@gmail.com</Scramble>
          </a>
        </div>
      </div>
    </footer>
  );
}
