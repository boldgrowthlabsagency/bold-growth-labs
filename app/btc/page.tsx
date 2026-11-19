import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import BlackFridayForm from '@/components/BlackFridayForm';
import Countdown from '@/components/Countdown';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { ADDON_DEALS, BF, BTC, EARLY_BONUS, REFERRAL, bonusesFor, earlyLive, money } from '@/lib/blackfriday';

/* ============================================================
   /btc — the Black Friday offer for BTC committee members.

   Unlisted like the other one-person links: noindex, not in the
   nav or sitemap, sent to the committee's WhatsApp group. The
   form runs in `member` mode, so the BTCEB26 code is applied
   without anyone typing it, and every perk on this page comes from
   bonusesFor() — the same list the sheet and the confirmation
   email are written from.

   It is BOLD's offer to members, not BTC's: the page says so, and
   never promises a listing on the BTC website (the board's call).
   ============================================================ */

/* Re-rendered hourly so the early-bird block drops off on its own after Nov 13. */
export const revalidate = 3600;

const DESCRIPTION = 'Black Friday website pricing with free add-ons, built for BTC committee members.';

export const metadata: Metadata = {
  title: 'BTC committee offer | BOLD Growth Labs',
  description: DESCRIPTION,
  openGraph: {
    title: 'BTC committee members: website redesign $499 + free add-ons',
    description: DESCRIPTION,
    url: 'https://boldgrowthlabs.io/btc',
    siteName: 'BOLD Growth Labs',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'BTC committee members: website redesign $499', description: DESCRIPTION },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function BtcPage() {
  const early = earlyLive();
  const perks = bonusesFor('redesign', BTC.code);
  const perksValue = perks.reduce((n, b) => n + b.value, 0);

  return (
    <AuroraBackground>
    <main id="main" className="min-h-screen pb-16 pt-8 md:pt-16">
      <div className="mx-auto w-full max-w-[600px] px-5">
        <a href="/" aria-label="BOLD Growth Labs home" className="inline-block">
          <Logo variant="full" />
        </a>

        <header className="mb-10 mt-9">
          <p className="eyebrow mb-4">For BTC committee members</p>
          <h1 className="display">
            Your website, ready for <span className="text-orange">the BTC launch.</span>
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-muted">
            We&rsquo;re running a Black Friday special for our clients, and we built this offer with free add-ons just
            for BTC committee members, so your own business site is refreshed before the new BTC website goes live.
            It&rsquo;s the only time of the year we can offer it.
          </p>

          {early ? (
            <div className="mt-7 rounded-2xl border border-orange/50 bg-orange/10 p-5 sm:p-6">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-orange">Book by {BF.earlyLabel}</p>
              <p className="mt-2 text-[length:var(--step-1)] font-extrabold leading-tight">
                Free {EARLY_BONUS.label} <span className="text-white/50">({money(EARLY_BONUS.value)} value)</span>
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/75">
                {EARLY_BONUS.detail}. Guaranteed with your committee code {BTC.code}, on any build, if you book by {BF.earlyLabel}.
              </p>
              <p className="mb-3 mt-5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/50">Ends in</p>
              <Countdown to={BF.earlyEndsAt} />
            </div>
          ) : (
            <>
              <p className="mb-3 mt-7 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50">Offer ends in</p>
              <Countdown to={BF.endsAt} />
            </>
          )}
        </header>

        <section aria-labelledby="btc-incl" className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
          <h2 id="btc-incl" className="text-[15px] font-bold">
            Website redesign <span className="text-white/40 line-through">$699</span> <span className="text-orange">$499</span>, plus
          </h2>
          <ul className="mt-4 grid gap-2.5 text-[14px] text-white/80">
            <li className="flex gap-3"><Tick />Up to 3 redesigned pages, mobile-first, built for speed</li>
            {perks.map((b) => (
              <li key={b.label} className="flex gap-3"><Tick />
                <span>{b.label}{b.value ? <span className="text-white/45"> — free, {money(b.value)} value</span> : null}</span>
              </li>
            ))}
            <li className="flex gap-3"><Tick />You own it, 100%</li>
          </ul>
          <p className="mt-4 text-[12.5px] text-white/45">
            {money(perksValue)} of add-ons, free. Every one of them is written into your confirmation email.
          </p>

          <h2 className="mt-7 text-[15px] font-bold">Also on sale for you</h2>
          <ul className="mt-4 grid gap-2.5 text-[14px] text-white/80">
            <li className="flex gap-3"><Tick />Landing page $299 · Custom builds from $799</li>
            {ADDON_DEALS.map((d) => <li key={d} className="flex gap-3"><Tick />{d}</li>)}
          </ul>
        </section>

        <section aria-labelledby="btc-ref" className="mb-10 rounded-2xl border border-orange/40 bg-orange/[0.07] p-6 sm:p-7">
          <h2 id="btc-ref" className="text-[length:var(--step-1)] font-extrabold leading-tight">
            Refer a business owner. You both get ${REFERRAL.get}.
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            They get ${REFERRAL.give} off our regular pricing and you get ${REFERRAL.get} once their deposit clears. As a
            committee member you also earn free services, and they add up:
          </p>
          <ul className="mt-4 grid gap-2.5 text-[14px] text-white/85">
            {BTC.referralTiers.map((t) => (
              <li key={t.at} className="flex gap-3">
                <span className="w-[86px] shrink-0 font-bold text-orange">{t.when}</span>
                <span>{t.reward} <span className="text-white/45">— {money(t.value)} value</span></span>
              </li>
            ))}
          </ul>
        </section>

        <BlackFridayForm member />

        <p className="mt-8 text-[12px] leading-relaxed text-white/40">
          This is an offer from BOLD Growth Labs to BTC committee members, not from the Border Transportation Council.
          Any listing on the BTC website is up to the BTC board. Booking holds your price for {BF.holdHours} hours; a{' '}
          {BF.depositPct}% deposit paid within that window locks it in, with the balance due at launch. The free{' '}
          {EARLY_BONUS.label} needs the booking by {BF.earlyLabel} at 11:59pm Pacific; all other pricing and perks need
          it by {BF.endsLabel} at 11:59pm Pacific. Referral rewards are paid once the referred client&rsquo;s deposit clears. The
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
