/* ============================================================
   THE CARE PLAN — /billing

   Everything a client is told about the recurring charge lives
   here, in one object, because the page is a commitment and the
   commitment should be readable in one place.

   ⚠ CARD DETAILS NEVER TOUCH THIS SITE. The button hands off to
   a Stripe-hosted payment page; the number goes from the
   customer's browser to Stripe and nowhere else. Do not, under
   any pressure, add a card field to this page or route card
   data through /api/site — that path ends in an email inbox and
   a Google Sheet, which is a PCI violation and a breach waiting
   to be reported. If a client cannot use Stripe, the answer is
   an invoice, not a form.

   ⚠ TERMS, NOT COPY. The price, the date, the cancellation rule
   and the included work are things Aldo owes a client, not
   wording to be improved. Change them when the offer changes,
   and never to make the page read better.
   ============================================================ */

export const PLAN = {
  name: 'Website Care Plan',
  price: 70,
  currency: 'USD',
  interval: 'month',
  /* The first charge. Stripe bills on this date and then monthly on the
     same day. Written out here because "starts December 1" is the thing a
     client remembers, and a mismatch with the Stripe schedule is the sort
     of error that gets noticed on a bank statement. */
  firstCharge: 'December 1, 2026',

  /* Taken word for word from what the Stripe product actually says — the
     thing the client is agreeing to pay for:

       "Keeps your website maintained, monitored, and backed up after
        launch. Update requests to website included. New pages, features,
        and systems not included."

     An earlier draft of this list promised hosting, the domain renewal and
     Google-listing upkeep. None of that is in the product description, so
     none of it is sold. If the plan is meant to cover them, change the
     Stripe product first and this list second — never the other way round,
     or the page promises something the subscription does not. */
  includes: [
    'Your website maintained after launch',
    'Monitored, so a problem is found before you hear about it',
    'Backed up, and fixed if something breaks',
    'Update requests — photos, prices, hours, wording — included',
  ],

  /* His words again: new pages, features and systems are out of scope. */
  excludes: [
    'New pages',
    'New features or systems — booking, payments, logins, a shop',
    'A redesign, rebrand, photography or copywriting from scratch',
  ],
} as const;

/* ============================================================
   HOW THE CHARGE IS SET UP

   Stripe Checkout in subscription mode, created server-side by
   /api/checkout and redirected to. The client lands on Stripe's
   own page, types the card there, and comes back here. Nothing
   about the card passes through this site.

   TWO ENVIRONMENT VARIABLES, BOTH SET IN VERCEL, NEVER IN CODE:
     STRIPE_SECRET_KEY   sk_live_… (or sk_test_… while testing)
     STRIPE_PRICE_ID     price_… for Website Care Plan, $70/month

   The secret key is the keys-to-the-account credential: it must
   never appear in this repo, in the client bundle, in a chat
   message or in a screenshot. If it is ever pasted somewhere it
   should not be, roll it in the Stripe dashboard immediately.
   ============================================================ */

/* The first charge, as a unix timestamp: 1 December 2026, 00:00 Pacific.
   Passed to Stripe as the trial end, so the card is collected today and the
   first $70 lands on the date this page promises. Without it Stripe charges
   the moment the client subscribes and the page becomes a lie.

   ⚠ A DATE IN THE PAST MAKES STRIPE CHARGE IMMEDIATELY. After 1 Dec 2026,
   either remove this and let billing start on signup, or move it forward —
   and move PLAN.firstCharge with it. The two are read by a customer side
   by side. */
export const FIRST_CHARGE_UNIX = 1796112000;

/* Stripe's customer portal link, if one is turned on (Settings → Billing →
   Customer portal). With it, a client changes their own card; without it the
   page tells them to ask and we send a one-off Stripe link. Either is fine —
   what is not fine is asking a client to email a card number. */
export const STRIPE_PORTAL = '';
