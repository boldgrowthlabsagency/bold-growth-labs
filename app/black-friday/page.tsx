import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import BlackFridayForm from '@/components/BlackFridayForm';
import Countdown from '@/components/Countdown';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { ADDON_DEALS, BF, REDESIGN_BONUSES, REFERRAL, money } from '@/lib/blackfriday';

/* ============================================================
   /black-friday — the November 2026 special.

   noindex and out of the sitemap like the other unlisted pages:
   it expires, and an indexed sale page outlives its deadline in
   search results. It IS linked from the homepage banner and the
   pricing cards while the sale runs — that is the point of it.
   ============================================================ */

const DESCRIPTION = `Website redesigns ${money(499)} (normally ${money(699)}), everything else discounted. Ends ${BF.endsLabel}.`;

export const metadata: Metadata = {
  title: 'Black Friday special | BOLD Growth Labs',
  description: DESCRIPTION,
  openGraph: {
    title: 'Black Friday: website redesigns $499',
    description: DESCRIPTION,
    url: 'https://boldgrowthlabs.io/black-friday',
    siteName: 'BOLD Growth Labs',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Black Friday: website redesigns $499', description: DESCRIPTION },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

const bonusValue = REDESIGN_BONUSES.reduce((n, b) => n + b.value, 0);

export default function BlackFridayPage() {
  return (
    <AuroraBackground>
    <main id="main" className="min-h-screen pb-16 pt-8 md:pt-16">
      <div className="mx-auto w-full max-w-[600px] px-5">
        <a href="/" aria-label="BOLD Growth Labs home" className="inline-block">
          <Logo variant="full" />
        </a>

        <header className="mb-10 mt-9">
          <p className="eyebrow mb-4">Black Friday special</p>
          <h1 className="display">
            Website redesigns <span className="whitespace-nowrap"><span className="text-white/35 line-through decoration-2">$699</span>{' '}
            <span className="text-orange">$499.</span></span>
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-muted">
            We&rsquo;ve already offered this to our current clients. Now it&rsquo;s open to everyone until {BF.endsLabel}.
            Everything else we build is discounted too. Only {BF.slots} redesign spots at this price, because that&rsquo;s
            how many we can deliver properly.
          </p>

          <p className="mb-3 mt-7 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50">Price goes back up in</p>
          <Countdown to={BF.endsAt} />
        </header>

        <section aria-labelledby="bf-incl" className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
          <h2 id="bf-incl" className="text-[15px] font-bold">The $499 redesign comes with</h2>
          <ul className="mt-4 grid gap-2.5 text-[14px] text-white/80">
            <li className="flex gap-3"><Tick />Up to 3 redesigned pages, mobile-first, built for speed</li>
            {REDESIGN_BONUSES.map((b) => (
              <li key={b.label} className="flex gap-3"><Tick /><span>{b.label} <span className="text-white/45">— free, {money(b.value)} value</span></span></li>
            ))}
            <li className="flex gap-3"><Tick />You own it, 100%</li>
          </ul>
          <p className="mt-4 text-[12.5px] text-white/45">
            That&rsquo;s {money(699 + bonusValue)} of work for $499.
          </p>

          <h2 className="mt-7 text-[15px] font-bold">Also on sale</h2>
          <ul className="mt-4 grid gap-2.5 text-[14px] text-white/80">
            {ADDON_DEALS.map((d) => <li key={d} className="flex gap-3"><Tick />{d}</li>)}
          </ul>
        </section>

        <BlackFridayForm />

        <section aria-labelledby="bf-ref" className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
          <h2 id="bf-ref" className="text-[length:var(--step-1)] font-extrabold leading-tight">
            Give ${REFERRAL.give}. Get ${REFERRAL.get}.
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            Know a business owner whose website needs help? When they book, they get ${REFERRAL.give} off our regular pricing, and you
            get ${REFERRAL.get} for each one once their deposit clears. No limit, and you don&rsquo;t have to be a
            client. Book above and you&rsquo;ll get your own link to share.
          </p>
        </section>

        <p className="mt-8 text-[12px] leading-relaxed text-white/40">
          Booking holds your price for {BF.holdHours} hours; a {BF.depositPct}% deposit paid within that window locks it
          in, with the balance due at launch. Black Friday prices need the
          booking by {BF.endsLabel} at 11:59pm Pacific. Builds can be scheduled
          into December or January. Referral rewards are paid once the referred client&rsquo;s deposit clears. The
          referral credit applies to regular pricing only and does not combine with Black Friday pricing.
        </p>
      </div>
    </main>
    </AuroraBackground>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="mt-[3px] h-[15px] w-[15px] shrink-0 text-orange">
      <path d="M4 12.5l5.2 5L20 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
