import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import MagneticButton from '@/components/MagneticButton';
import ReviewFlow, { ReviewWidget } from '@/components/ReviewFlow';
import { PHONE, PHONE_DISPLAY } from '@/lib/data';

/* ============================================================
   /reviews — the Reviews & Reputation walkthrough.

   Unlisted, same as /start: noindex and not in the nav, meant to
   be sent to a prospect after a conversation rather than found.
   ============================================================ */

export const metadata: Metadata = {
  title: 'How the review system works | BOLD Growth Labs',
  description: 'A step-by-step look at how reviews reach your Google profile and your website.',
  /* Its own card. Without this the page inherits the homepage's openGraph —
     "Websites Built to Make People Stop" and the marketing blurb — so a link
     sent to one person unfurls as an advert instead of the thing they were
     sent. The matching image is opengraph-image.tsx beside this file. */
  openGraph: {
    title: 'How the review system works',
    description: 'From a finished job to a review on your website, step by step.',
    url: 'https://boldgrowthlabs.io/reviews',
    siteName: 'BOLD Growth Labs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How the review system works',
    description: 'From a finished job to a review on your website, step by step.',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function ReviewsPage() {
  return (
    <main id="main" className="min-h-screen bg-navy py-14 md:py-20">
      <div className="shell">
        <header className="mb-14 max-w-[760px]">
          <a href="/" aria-label="BOLD Growth Labs home" className="inline-block">
            <Logo variant="full" />
          </a>
          <p className="eyebrow mb-5 mt-11">Reviews &amp; Reputation</p>
          <h1 className="display max-w-[18ch]">
            From a finished job to <span className="text-orange">a review on your site.</span>
          </h1>
          <p className="lede mt-6">
            Six steps. You do the first one. Here is exactly what happens after that —
            press any step to jump to it.
          </p>
        </header>

        <ReviewFlow />

        {/* ---- the widget, full size ---- */}
        <section className="mt-24 max-w-[980px]">
          <p className="eyebrow mb-5">The widget</p>
          <h2 className="display max-w-[16ch]">This is what ends up <span className="text-orange">on your website.</span></h2>
          <p className="lede mt-5 mb-10">
            It pulls from your Google profile, so it is never out of date and you never
            paste a review in by hand.
          </p>
          <ReviewWidget />
          <p className="mt-4 text-[12px] text-white/35">
            Sample reviews, written for this demonstration. Your widget shows only real
            reviews from your own profile.
          </p>
        </section>

        {/* ---- what we will not do ---- */}
        <section className="mt-24 max-w-[760px] rounded-[22px] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-[length:var(--step-1)] font-extrabold">What we will never do</h2>
          <ul className="mt-5 grid gap-3 text-[15px] leading-relaxed text-muted">
            <li>
              <strong className="text-white">Screen customers first.</strong> Surveying people
              and only sending the happy ones to Google is called review gating. It breaches
              Google&rsquo;s policies and the FTC&rsquo;s rules, and it can get your profile
              suspended. Everyone gets asked.
            </li>
            <li>
              <strong className="text-white">Offer anything in exchange.</strong> No discounts,
              no draws, no free upgrades. Incentivised reviews are against Google&rsquo;s terms.
            </li>
            <li>
              <strong className="text-white">Write reviews.</strong> Not ever, not from any
              account. Every review on your profile comes from someone who actually hired you.
            </li>
          </ul>
          <p className="mt-6 text-[14px] leading-relaxed text-white/55">
            Plenty of companies sell the other version. It works until it doesn&rsquo;t, and
            when it stops working you lose the profile, not just the reviews.
          </p>
        </section>

        {/* ---- pricing + cta ---- */}
        <section className="mt-24 max-w-[760px]">
          <h2 className="display max-w-[14ch]">What it costs.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="plan">
              <h3 className="plan__name">Reviews &amp; Reputation</h3>
              <p className="plan__price">$199<em> /mo</em></p>
              <p className="plan__blurb">Plus a one-time $299 setup.</p>
              <ul className="plan__features">
                <li>Automated requests after every job</li>
                <li>Monitoring across every platform</li>
                <li>Every review answered in one business day</li>
                <li>The widget, live on your site</li>
                <li>One-page monthly report</li>
              </ul>
            </div>
            <div className="plan plan--featured">
              <span className="plan__badge">Best value</span>
              <h3 className="plan__name">Local Growth Bundle</h3>
              <p className="plan__price">$279<em> /mo</em></p>
              <p className="plan__blurb">Plus the same one-time $299 setup. Saves $69 every month after that.</p>
              <ul className="plan__features">
                <li>Everything in Reviews &amp; Reputation</li>
                <li>Local SEO &amp; AI search</li>
                <li>Google Business Profile managed</li>
                <li>One report covering both</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticButton href="/start">Get started</MagneticButton>
            <MagneticButton href={`tel:${PHONE}`} variant="ghost" arrow={false}>
              Call {PHONE_DISPLAY}
            </MagneticButton>
          </div>
        </section>

        <footer className="mt-20 border-t border-white/10 pt-7 text-[12px] text-white/35">
          BOLD Growth Labs &middot; boldgrowthlabs.io
        </footer>
      </div>
    </main>
  );
}
