import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import AuditForm from '@/components/AuditForm';
import { AUDIT } from '@/lib/audit';
import { AuroraBackground } from '@/components/ui/aurora-background';

/* ============================================================
   /audit — growth audit for business owners who want to scale.

   Unlisted like /start, /reviews, /revisions and /apply: noindex,
   not in the nav, not in the sitemap. It is a link sent after a
   conversation or posted deliberately, laid out phone first.
   ============================================================ */

const DESCRIPTION = 'Two minutes of taps. We find the bottlenecks capping your growth — leads, follow-up, ads, admin — and show you what fixing them takes.';

export const metadata: Metadata = {
  title: 'Free growth audit | BOLD Growth Labs',
  description: DESCRIPTION,
  openGraph: {
    title: 'Free growth audit',
    description: DESCRIPTION,
    url: 'https://boldgrowthlabs.io/audit',
    siteName: 'BOLD Growth Labs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free growth audit',
    description: DESCRIPTION,
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AuditPage() {
  return (
    <AuroraBackground>
    <main id="main" className="min-h-screen pb-16 pt-8 md:pt-16">
      <div className="mx-auto w-full max-w-[600px] px-5">
        <a href="/" aria-label="BOLD Growth Labs home" className="inline-block">
          <Logo variant="full" />
        </a>

        <header className="mb-10 mt-9">
          <p className="eyebrow mb-4">{AUDIT.eyebrow}</p>
          <h1 className="display">
            {AUDIT.title}{' '}
            <span className="whitespace-nowrap">
              {AUDIT.lead} <span className="text-orange">{AUDIT.accent}</span>
            </span>
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-muted">{AUDIT.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {AUDIT.pills.map((t) => (
              <p key={t} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[12.5px] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden />
                {t}
              </p>
            ))}
          </div>
        </header>

        <AuditForm />
      </div>
    </main>
    </AuroraBackground>
  );
}
