import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import RevisionForm from '@/components/RevisionForm';
import RevisionChecklist from '@/components/RevisionChecklist';
import { ROUNDS_INCLUDED, HOW_IT_WORKS, SCOPE, NEXT_STEPS } from '@/lib/revisions';
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
            Everything in one place, worked through as a batch. It is far quicker than a run
            of texts, and nothing gets lost between them.
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

        {/* ---- how this works: three steps, before they are asked to do any of it ---- */}
        <section className="mx-auto mb-12 max-w-[820px]">
          <h2 className="text-[length:var(--step-1)] font-extrabold">How this works</h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-3">
            {HOW_IT_WORKS.map((s) => (
              <li key={s.n} className="rv-step">
                <span className="rv-step__n">{s.n}</span>
                <h3 className="mt-3 text-[15px] font-bold leading-snug">{s.t}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---- the five-minute check ---- */}
        <div className="mx-auto mb-12 max-w-[820px]">
          <RevisionChecklist />
        </div>

        <RevisionForm />

        {/* ---- what a round covers. Said here, so the first invoice is never
             the first time they hear it ---- */}
        <section className="mx-auto mt-16 grid max-w-[820px] gap-4 md:grid-cols-2">
          <div className="rv-scope">
            <h2 className="text-[15px] font-bold">Included in a round</h2>
            <ul className="mt-4 grid gap-2.5 text-[13.5px] leading-relaxed text-muted">
              {SCOPE.included.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-[2px] shrink-0 text-orange" aria-hidden>✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rv-scope">
            <h2 className="text-[15px] font-bold">Quoted separately</h2>
            <ul className="mt-4 grid gap-2.5 text-[13.5px] leading-relaxed text-muted">
              {SCOPE.quoted.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-[2px] shrink-0 text-white/30" aria-hidden>+</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12.5px] leading-relaxed text-white/40">
              Ask for any of it here anyway — we will price it and tell you before anything
              is built.
            </p>
          </div>
        </section>

        {/* ---- what happens after they send ---- */}
        <section className="mx-auto mt-10 max-w-[820px] rounded-[20px] border border-white/10 bg-white/[0.03] p-7">
          <h2 className="text-[15px] font-bold">What happens after you send it</h2>
          <ol className="mt-4 grid gap-3 text-[14px] leading-relaxed text-muted">
            {NEXT_STEPS.map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="rv-next__n" aria-hidden>{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-[13px] text-white/45">
            Stuck, or would rather talk it through? Call {PHONE_DISPLAY} —{' '}
            <a className="underline" href={`tel:${PHONE}`}>tap to dial</a>. Please still put the
            changes themselves on this page, so there is one list we both work from.
          </p>
        </section>

        <footer className="mx-auto mt-16 max-w-[820px] border-t border-white/10 pt-7 text-[12px] text-white/35">
          BOLD Growth Labs &middot; boldgrowthlabs.io
        </footer>
      </div>
    </main>
  );
}
