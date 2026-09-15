import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import ApplyForm from '@/components/ApplyForm';
import { ROLE } from '@/lib/hiring';
import { AuroraBackground } from '@/components/ui/aurora-background';

/* ============================================================
   /apply — appointment center applications.

   Unlisted like /start, /reviews and /revisions: noindex, not in
   the nav, not in the sitemap. It exists to sit behind an
   Instagram story link sticker, so it is laid out for a phone
   first and a desktop second.
   ============================================================ */

export const metadata: Metadata = {
  title: `Now hiring: ${ROLE.title} | BOLD Growth Labs`,
  description: 'Call real estate agents about leads we generate. Set your own hours. One minute to apply.',
  openGraph: {
    title: `Now hiring: ${ROLE.title}`,
    description: 'Call real estate agents about leads we generate. Set your own hours. One minute to apply.',
    url: 'https://boldgrowthlabs.io/apply',
    siteName: 'BOLD Growth Labs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Now hiring: ${ROLE.title}`,
    description: 'Call real estate agents about leads we generate. Set your own hours. One minute to apply.',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function ApplyPage() {
  return (
    <AuroraBackground>
    <main id="main" className="min-h-screen pb-16 pt-8 md:pt-16">
      <div className="mx-auto w-full max-w-[560px] px-5">
        <a href="/" aria-label="BOLD Growth Labs home" className="inline-block">
          <Logo variant="full" />
        </a>

        <header className="mb-9 mt-9">
          <p className="eyebrow mb-4">Now hiring</p>
          <h1 className="display">
            {ROLE.title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="text-orange">{ROLE.title.split(' ').slice(-1)}</span>
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-muted">{ROLE.summary}</p>
          <p className="mt-2 text-[13px] text-white/50">About a minute to apply · mostly taps</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[12.5px] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden />
            {ROLE.perk}
          </p>
        </header>

        <ApplyForm />
      </div>
    </main>
    </AuroraBackground>
  );
}
