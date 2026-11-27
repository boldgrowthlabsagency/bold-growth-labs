import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import { PLAN } from '@/lib/billing';
import { PHONE, PHONE_DISPLAY } from '@/lib/data';

/* Where Stripe sends the client back to. Deliberately plain: confirm what
   just happened, say what comes next, and give a way to reach a person. */

export const metadata: Metadata = {
  title: 'Care Plan set up | BOLD Growth Labs',
  robots: { index: false, follow: false, nocache: true },
};

export default function BillingThanksPage() {
  return (
    <main id="main" className="min-h-screen bg-navy py-14 md:py-20">
      <div className="shell">
        <div className="mx-auto max-w-[640px]">
          <a href="/" aria-label="BOLD Growth Labs home" className="inline-block">
            <Logo variant="full" />
          </a>
          <p className="eyebrow mb-5 mt-11">All set</p>
          <h1 className="display max-w-[14ch]">
            You&rsquo;re on the <span className="text-orange">Care Plan.</span>
          </h1>
          <p className="lede mt-6">
            Stripe has your card and will email you a receipt. The first ${PLAN.price} is taken on{' '}
            {PLAN.firstCharge}, then the same amount on the same date each {PLAN.interval}.
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-white/70">
            Nothing else to do. If you want to change the card, cancel, or ask what is covered,
            text or call{' '}
            <a href={`tel:${PHONE}`} className="font-semibold text-orange">
              {PHONE_DISPLAY}
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
