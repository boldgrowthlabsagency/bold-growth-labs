import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import { PLAN, STRIPE_PORTAL } from '@/lib/billing';
import { PHONE, PHONE_DISPLAY } from '@/lib/data';

/* ============================================================
   /billing — the care plan, and the button that starts it.

   Unlisted like /start and /revisions: noindex, not in the nav,
   not in the sitemap. A link you send to one client.

   ⚠ NO CARD FIELD ON THIS PAGE, EVER. The button goes to a
   Stripe-hosted page; the card number travels from the client's
   browser to Stripe and never passes through this site, our
   server, an inbox or the spreadsheet. Putting a card field
   here — or posting card data to /api/site, which ends in Gmail
   and a Google Sheet — would be a PCI DSS violation and a
   reportable breach the first time that sheet was shared with
   the wrong person. If someone cannot pay by card, the answer
   is an invoice, not a form.

   The page's whole job is to make the charge legible before it
   happens: what it is, what it costs, when it starts, what it
   covers, what it does not, and how to stop it. A recurring
   charge a client does not fully understand is a chargeback in
   three months.
   ============================================================ */

export const metadata: Metadata = {
  title: 'Website Care Plan | BOLD Growth Labs',
  description: 'Set up the monthly care plan for your website.',
  openGraph: {
    title: 'Website Care Plan',
    description: 'Hosting, changes and monthly checks for your website — $70 a month.',
    url: 'https://boldgrowthlabs.io/billing',
    siteName: 'BOLD Growth Labs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Care Plan',
    description: 'Hosting, changes and monthly checks for your website — $70 a month.',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function BillingPage() {
  /* Server component: reading the environment here is safe and never reaches
     the browser. The button only appears once Stripe is actually wired. */
  const ready = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);

  return (
    <main id="main" className="min-h-screen bg-navy py-14 md:py-20">
      <div className="shell">
        <header className="mx-auto max-w-[760px]">
          <a href="/" aria-label="BOLD Growth Labs home" className="inline-block">
            <Logo variant="full" />
          </a>
          <p className="eyebrow mb-5 mt-11">Your website, looked after</p>
          <h1 className="display max-w-[16ch]">
            The <span className="text-orange">Care Plan.</span>
          </h1>
          <p className="lede mt-6">
            Your site stays online, stays current, and stays someone&rsquo;s job rather than
            yours. Here is exactly what it costs and what it covers, before you set anything up.
          </p>
        </header>

        {/* ---- the number, the date, and nothing buried ---- */}
        <section className="mx-auto mt-12 max-w-[760px] rounded-2xl border border-white/12 bg-white/[0.04] p-7 md:p-9">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <span className="display text-[length:var(--step-4)] leading-none">${PLAN.price}</span>
            <span className="pb-1 text-[15px] text-white/70">per {PLAN.interval}</span>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-white/80">
            First charge <strong className="text-white">{PLAN.firstCharge}</strong>, then the same
            amount on the same date each {PLAN.interval}. No setup fee, no contract, and the price
            does not change without us telling you first.
          </p>
        </section>

        {/* ---- what it is, and what it is not, side by side ---- */}
        <section className="mx-auto mt-10 grid max-w-[760px] gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-[length:var(--step-0)] font-extrabold">What it covers</h2>
            <ul className="mt-4 space-y-3">
              {PLAN.includes.map((item) => (
                <li key={item} className="flex gap-3 text-[14.5px] leading-relaxed text-white/80">
                  <span aria-hidden="true" className="mt-[2px] text-orange">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-[length:var(--step-0)] font-extrabold">What it does not</h2>
            <ul className="mt-4 space-y-3">
              {PLAN.excludes.map((item) => (
                <li key={item} className="flex gap-3 text-[14.5px] leading-relaxed text-white/60">
                  <span aria-hidden="true" className="mt-[2px] text-white/30">
                    +
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13.5px] leading-relaxed text-white/50">
              Ask for any of it anyway — we price it and tell you before anything is built.
            </p>
          </div>
        </section>

        {/* ---- the hand-off ----

            A form POST, not a link: the session is created server-side by
            /api/checkout, which then 303s to Stripe. A GET link would let a
            crawler or a prefetch create sessions, and this page is sent by
            text message, where previews fetch what they find. */}
        <section className="mx-auto mt-12 max-w-[760px] rounded-2xl border border-white/12 p-7 md:p-9">
          {ready ? (
            <>
              <h2 className="text-[length:var(--step-1)] font-extrabold">Set it up</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/80">
                The button opens Stripe, who handle the payment. Your card details go straight to
                them — they never touch this website, and we never see or store the number.
              </p>
              {/* Styled here, explicitly. An earlier version used `btn
                  btn--primary` — classes from the Torres build, which do not
                  exist in this stylesheet — so the only control on a payment
                  page rendered as plain text and nobody could tell it was a
                  button. If a class is not defined in globals.css, style it
                  inline rather than hoping. */}
              <form action="/api/checkout" method="post">
                <button
                  type="submit"
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl px-8 text-[17px] font-extrabold tracking-tight text-white transition-transform hover:-translate-y-[1px] sm:w-auto"
                  style={{
                    minHeight: 60,
                    background: 'var(--bold-orange)',
                    boxShadow: '0 10px 30px -8px rgba(232, 82, 10, 0.55)',
                  }}
                >
                  Start the plan — ${PLAN.price}/{PLAN.interval}
                  <span aria-hidden="true">→</span>
                </button>
              </form>
              <p className="mt-4 text-[13px] text-white/50">
                Secured by Stripe. Your card is saved today and the first ${PLAN.price} is taken on{' '}
                {PLAN.firstCharge}. A receipt comes by email every month.
              </p>
            </>
          ) : (
            /* Not configured yet. Say so rather than render a button that
               goes nowhere — a dead payment button on a page a client was
               invited to reads as a broken business. */
            <>
              <h2 className="text-[length:var(--step-1)] font-extrabold">Nearly ready</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/80">
                The payment link for this plan is being set up. Call or text{' '}
                <a href={`tel:${PHONE}`} className="font-semibold text-orange">
                  {PHONE_DISPLAY}
                </a>{' '}
                and we will send it straight over.
              </p>
            </>
          )}
        </section>

        {/* ---- the exit, stated as plainly as the price ---- */}
        <section className="mx-auto mt-10 max-w-[760px] border-t border-white/10 pt-8">
          <h2 className="text-[length:var(--step-0)] font-extrabold">Stopping or changing it</h2>
          <ul className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-white/70">
            <li>
              <strong className="text-white/90">Cancel any time.</strong> Text {PHONE_DISPLAY} or
              reply to any receipt. The plan stops at the end of the month you have already paid
              for, and nothing is charged again.
            </li>
            <li>
              <strong className="text-white/90">Changing the card.</strong>{' '}
              {STRIPE_PORTAL ? (
                <>
                  Update it yourself in{' '}
                  <a
                    href={STRIPE_PORTAL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-orange"
                  >
                    the billing portal
                  </a>
                  .
                </>
              ) : (
                <>Tell us and we will send you a secure Stripe link to update it.</>
              )}
            </li>
            <li>
              <strong className="text-white/90">If a payment fails.</strong> Stripe retries and
              emails you. Nothing is taken down over a declined card — we will call you first.
            </li>
            <li>
              <strong className="text-white/90">The site is yours.</strong> Cancelling the plan
              does not take your website, your domain or your photos away from you.
            </li>
          </ul>
          <p className="mt-6 text-[13.5px] text-white/50">
            Questions about any of this: {PHONE_DISPLAY}.
          </p>
        </section>
      </div>
    </main>
  );
}
