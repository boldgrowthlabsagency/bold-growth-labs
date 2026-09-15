import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import RevisionForm from '@/components/RevisionForm';
import { ROUNDS_INCLUDED } from '@/lib/revisions';
import { PHONE, PHONE_DISPLAY } from '@/lib/data';

/* ============================================================
   /revisions — feedback on a build that is finished but not live.

   Unlisted, like /start and /reviews: noindex and not in the nav.
   You send it to a client with a preview link, so it should never
   be something a cold visitor meets instead of the contact form.
   ============================================================ */

export const metadata: Metadata = {
  title: 'Request changes | BOLD Growth Labs',
  description: 'Tell us what to change before your site goes live.',
  /* Its own card. Without this the page inherits the homepage's openGraph —
     "Websites Built to Make People Stop" and the marketing blurb — so a link
     sent to one person unfurls as an advert instead of the thing they were
     sent. The matching image is opengraph-image.tsx beside this file. */
  openGraph: {
    title: 'Request changes',
    description: 'Tell us what to change before your site goes live. Two rounds are included.',
    url: 'https://boldgrowthlabs.io/revisions',
    siteName: 'BOLD Growth Labs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Request changes',
    description: 'Tell us what to change before your site goes live. Two rounds are included.',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function RevisionsPage() {
  return (
    <main id="main" className="min-h-screen bg-navy py-14 md:py-20">
      <div className="shell">
        <header className="mx-auto mb-12 max-w-[820px]">
          <a href="/" aria-label="BOLD Growth Labs home" className="inline-block">
            <Logo variant="full" />
          </a>
          <p className="eyebrow mb-5 mt-11">Before we go live</p>
          <h1 className="display max-w-[17ch]">
            Tell us what to <span className="text-orange">change.</span>
          </h1>
          <p className="lede mt-6">
            Put everything in one place and we will work through it as a batch. It is far
            quicker than a run of texts, and nothing gets lost between them.
          </p>

          {/* the scope line — stated plainly, once, without being heavy about it */}
          <p className="mt-7 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-[13px] text-white/70">
            <span className="font-semibold text-white">
              {ROUNDS_INCLUDED} rounds of revisions are included
            </span>
            <span className="text-white/30">·</span>
            <span>anything beyond that we will quote before doing, never after</span>
          </p>
        </header>

        <RevisionForm />

        <section className="mx-auto mt-16 max-w-[820px] rounded-[20px] border border-white/10 bg-white/[0.03] p-7">
          <h2 className="text-[15px] font-bold">Two things that speed this up</h2>
          <ul className="mt-4 grid gap-3 text-[14px] leading-relaxed text-muted">
            <li>
              <strong className="text-white">Say where, not just what.</strong> &ldquo;Hero, the
              line under the headline&rdquo; gets fixed today. &ldquo;The text is too
              small&rdquo; costs us a message each way first.
            </li>
            <li>
              <strong className="text-white">Screenshot anything that looks wrong.</strong> Most
              &ldquo;this is broken&rdquo; turns out to be one device or one browser, and a
              picture settles it in seconds.
            </li>
          </ul>
          <p className="mt-5 text-[13px] text-white/45">
            Would rather talk it through? Call {PHONE_DISPLAY} —{' '}
            <a className="underline" href={`tel:${PHONE}`}>tap to dial</a>.
          </p>
        </section>

        <footer className="mx-auto mt-16 max-w-[820px] border-t border-white/10 pt-7 text-[12px] text-white/35">
          BOLD Growth Labs &middot; boldgrowthlabs.io
        </footer>
      </div>
    </main>
  );
}
