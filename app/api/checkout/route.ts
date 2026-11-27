import { NextResponse } from 'next/server';
import { FIRST_CHARGE_UNIX } from '@/lib/billing';

/* ============================================================
   CARE PLAN → STRIPE CHECKOUT

   Creates a Checkout Session in subscription mode and redirects
   the client to Stripe's own hosted page. That is the whole
   point of this route: the card number is typed on stripe.com,
   not here, so this site never sees, transmits or stores it and
   stays out of PCI scope entirely.

   ⚠ NEVER ACCEPT CARD DATA, A PRICE, OR AN AMOUNT FROM THE
   REQUEST. The price is read from the environment, server-side.
   A price passed in by the browser is a price anyone can edit,
   and a $70 plan becomes a $0.50 plan the first time someone
   opens dev tools.

   The secret key lives only in the Vercel environment. It is
   never imported into a client component, never logged, and
   never echoed in a response — not even in an error.

   Stripe's own snippet uses the node SDK; this uses fetch
   against their REST API instead. Same call, one less
   dependency, and it runs on the edge like the other routes
   here.
   ============================================================ */

export const runtime = 'edge';

const SITE = 'https://boldgrowthlabs.io';

export async function POST() {
  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;

  /* Same contract as the other routes: say "not configured" rather than
     throw, so the page can show an honest state instead of a 500. */
  if (!key || !price) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  const body = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': price,
    'line_items[0][quantity]': '1',
    /* Collect the card now even though the first charge is later — without
       this, a trialling subscription can start with no payment method and
       quietly fail on the first invoice. */
    payment_method_collection: 'always',
    billing_address_collection: 'auto',
    success_url: `${SITE}/billing/thanks`,
    cancel_url: `${SITE}/billing`,
  });

  /* The promised first-charge date, as a trial that ends on it. Skipped once
     that date has passed, because Stripe rejects a trial end in the past —
     then billing simply starts on signup. */
  if (FIRST_CHARGE_UNIX * 1000 > Date.now()) {
    body.set('subscription_data[trial_end]', String(FIRST_CHARGE_UNIX));
  }

  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = (await res.json()) as { url?: string; error?: { message?: string } };

    if (!res.ok || !data.url) {
      /* Stripe's message is logged for us and withheld from the visitor: it
         can name the account, the price and the mode, and none of that is
         theirs to read. */
      console.error('stripe checkout failed:', data.error?.message ?? res.status);
      return NextResponse.json({ ok: false, reason: 'upstream' }, { status: 502 });
    }

    /* 303 so the browser follows with GET — a POST replayed onto Stripe's
       page is how people end up with two subscriptions. */
    return NextResponse.redirect(data.url, 303);
  } catch {
    return NextResponse.json({ ok: false, reason: 'network' }, { status: 502 });
  }
}
