import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import IntakeForm from '@/components/IntakeForm';

/* ============================================================
   /start — the new-build questionnaire.

   Unlisted, not secret. `noindex, nofollow` keeps it out of
   search results and `nocache/noimageindex` keeps it out of the
   cached copies that survive a delisting, but anyone with the
   link can open it — which is the point, since you send it to a
   prospect after a call.

   It is deliberately not in the site nav. A visitor who has not
   spoken to you yet should meet the contact form, not eighteen
   questions about their business.
   ============================================================ */

export const metadata: Metadata = {
  title: 'Project questionnaire | BOLD Growth Labs',
  description: 'A few questions so we can start building.',
  /* Its own card. Without this the page inherits the homepage's openGraph —
     "Websites Built to Make People Stop" and the marketing blurb — so a link
     sent to one person unfurls as an advert instead of the thing they were
     sent. The matching image is opengraph-image.tsx beside this file. */
  openGraph: {
    title: 'Tell us about the work',
    description: 'A few questions so we can start building. About four minutes, mostly tapping an option.',
    url: 'https://boldgrowthlabs.io/start',
    siteName: 'BOLD Growth Labs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tell us about the work',
    description: 'A few questions so we can start building. About four minutes, mostly tapping an option.',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function StartPage() {
  return (
    <main id="main" className="min-h-screen bg-navy py-14 md:py-20">
      <div className="shell">
        <header className="mx-auto mb-14 max-w-[720px]">
          <a href="/" aria-label="BOLD Growth Labs home" className="inline-block">
            <Logo variant="full" />
          </a>
          <h1 className="display mt-11 max-w-[16ch]">
            Tell us about <span className="text-orange">the work.</span>
          </h1>
          <p className="lede mt-6">
            Enough for us to start building — no more than that. Whether you are a
            business, a foundation, an agency or a committee, most of this is tapping
            an option. Six answers need typing; leave anything you are unsure about blank.
          </p>
        </header>

        <IntakeForm />

        <footer className="mx-auto mt-20 max-w-[720px] border-t border-white/10 pt-7 text-[12px] text-white/35">
          Whatever you send stays between us and is used only to build your site.
        </footer>
      </div>
    </main>
  );
}
