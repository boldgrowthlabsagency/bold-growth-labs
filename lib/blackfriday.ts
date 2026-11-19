/* ============================================================
   BLACK FRIDAY SPECIAL — November 2026

   Every number in the sale lives here, the same way the regular
   prices live in lib/data.ts. /black-friday, the homepage banner
   and the strike-through prices in Pricing all read from this file,
   so the sale is switched off by setting `active: false` (or simply
   by the deadline passing — every surface checks `saleLive()`).

   The urgency is real on purpose: the deadline is the deadline, and
   SLOTS is how many $499 redesigns can actually be delivered before
   the BTC site launches. Never show a "spots left" counter that
   isn't tied to real bookings — a fake one is the first thing a
   sharp owner notices, and it costs the whole offer its credibility.
   ============================================================ */

export const BF = {
  active: true,
  /* Cyber Monday, 11:59pm Pacific (PST is UTC−8). */
  endsAt: '2026-12-01T07:59:00Z',
  endsLabel: 'Cyber Monday, Nov 30',
  /* Early-bird bonus: a reason to book this week rather than on the 29th.
     Friday the 13th, 11:59pm Pacific. */
  earlyEndsAt: '2026-11-14T07:59:00Z',
  earlyLabel: 'Friday, Nov 13',
  /* How many $499 redesigns can really be delivered. Set to your real capacity. */
  slots: 10,
  /* Black Friday bookings only — regular builds stay 50/50. */
  depositPct: 70,
  /* Hours a booking holds the price before the deposit is due. */
  holdHours: 48,
  /* Paste a Stripe / Square payment link here and the confirmation screen
     shows a "Pay deposit now" button. Empty = we send an invoice instead. */
  depositUrl: '',
};

export type SalePlan = {
  id: string; name: string; was: number; now: number; note: string;
};

/* Order matters: the redesign is the offer, so it is listed first and pre-selected. */
export const SALE_PLANS: SalePlan[] = [
  { id: 'redesign',  name: 'Website Redesign',          was: 699,  now: 499,  note: 'Up to 3 pages + bonuses' },
  { id: 'landing',   name: 'Landing Page',              was: 400,  now: 299,  note: 'One focused page' },
  { id: 'custom5',   name: 'Custom Build — 5 pages',    was: 999,  now: 799,  note: 'Custom functionality' },
  { id: 'custom8',   name: 'Custom Build — 8 pages',    was: 1299, now: 1049, note: '+ one custom feature' },
  { id: 'custom12',  name: 'Custom Build — 12 pages',   was: 1599, now: 1299, note: 'Larger sites' },
];

/* Strike-through prices on the homepage cards, keyed by plan id in lib/data.ts. */
export const SALE_BY_PLAN: Record<string, { now: number; tiers?: string[] }> = {
  landing:  { now: 299 },
  redesign: { now: 499 },
  custom:   { now: 799, tiers: ['$799 — up to 5 pages', '$1,049 — up to 8 pages + custom feature', '$1,299 — up to 12 pages'] },
};

/* What the $499 redesign comes with. Values are the regular prices in lib/data.ts. */
export const REDESIGN_BONUSES = [
  { label: 'First month of the Care Plan',  value: 95 },
];

/* BTC committee members only, booked with the code by the early-bird cutoff.
   The public page no longer offers it — it is what makes the member offer
   plainly better than the public one. */
export const EARLY_BONUS = {
  label: 'Local Search Launch',
  detail: 'Google Maps and local SEO set up so nearby customers find you',
  value: 299,
};

/* ------------------------------------------------------------
   BTC MEMBER CODE

   For Border Transportation Council committee members, ahead of
   the BTC site launch. Their page is /btc, which applies the code
   on its own; it also works typed into /black-friday.
   Until earlyEndsAt it guarantees the free Local Search Launch;
   after that it still gives the other member perks. It is checked on the server too, and the
   bonuses it unlocks are written into the sheet row and into the
   confirmation email the member receives — that email is the
   written record of what they were promised.

   Never promise a listing or spot on the BTC website here: that
   is BTC's site and the board's decision, not ours.
   ------------------------------------------------------------ */
export const BTC = {
  code: 'BTCEB26',
  name: 'BTC committee member',
  /* Care Plan months free in total (replaces the redesign's single month). */
  careMonths: 1,
  logo: { label: 'Logo refresh', value: 199 },
  priority: 'Priority scheduling: your site goes live at the same time the BTC website launches',
  /* On top of the $100 per referral everyone gets. Counted once each referred
     client's deposit clears; tiers are cumulative. Services, not cash, on
     purpose: they cost time rather than money. */
  referralTiers: [
    { at: 1, when: '1 referral',  reward: 'A free page or a page of copywriting added to your site', value: 99 },
    { at: 2, when: '2 referrals', reward: 'Google Business Profile setup', value: 199 },
    { at: 3, when: '3 referrals', reward: 'SEO Tune-Up', value: 299 },
  ],
};
export const isBtcCode = (c?: string) => (c || '').trim().toUpperCase() === BTC.code;

export type Bonus = { label: string; value: number };

/* The single source of what a booking is owed. The form, the confirmation
   screen, the sheet and the email all read this, so they cannot disagree. */
export function bonusesFor(planId: string, code?: string, now = Date.now()): Bonus[] {
  const btc = isBtcCode(code);
  const out: Bonus[] = [];
  const care = btc ? BTC.careMonths : planId === 'redesign' ? 1 : 0;
  if (care) out.push({ label: care === 1 ? 'First month of the Care Plan' : `First ${care} months of the Care Plan`, value: 95 * care });
  if (btc && earlyLive(now)) out.push({ label: `${EARLY_BONUS.label} (booked by ${BF.earlyLabel})`, value: EARLY_BONUS.value });
  if (btc) {
    out.push(BTC.logo);
    out.push({ label: BTC.priority, value: 0 });
  }
  return out;
}

/* Black Friday price of every one-time charge in lib/data.ts, by id. One-time
   add-ons are 25% off (rounded); recurring setup fees are waived or halved.
   Monthly rates never change — a discounted monthly rate is a discount forever. */
export const SALE_ONCE: Record<string, number> = {
  page: 75, logo: 149, copy: 75, gbp: 149, localsl: 225, booking: 109,
  store: 299, brandkit: 299, seotune: 225,
  reviews: 0, growth: 0,
  recept: 249, aibooking: 149, aichat: 50, workflow: 199,
};

export const ADDON_DEALS = [
  '25% off every one-time add-on — logo, extra pages, copywriting, booking, store, brand kit, SEO',
  'Setup fee waived on Reviews & Reputation and the Local Growth Bundle (save $299)',
  'AI receptionist, booking, chat and automation setup fees 50% off',
];

/* The referral programme. The friend's credit comes off REGULAR pricing only —
   never Black Friday prices — so share links open the homepage, which shows
   regular prices with the credit applied. The referrer's reward is paid once
   the friend's deposit clears. */
export const REFERRAL = {
  give: 100,
  get: 100,
};

export const deposit = (price: number) => Math.round((price * BF.depositPct) / 100);

export const money = (n: number) => `$${n.toLocaleString('en-US')}`;

/* Live = switched on AND before the deadline. Pass `now` so the server render
   and the client agree; client components re-check after mount. */
export function saleLive(now = Date.now()) {
  return BF.active && now < Date.parse(BF.endsAt);
}
export function earlyLive(now = Date.now()) {
  return saleLive(now) && now < Date.parse(BF.earlyEndsAt);
}

/* The referral code is just a cleaned-up name — readable in the sheet, easy to
   say out loud ("tell them Maria sent you"), no database needed. */
export const refCode = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

export const refLink = (name: string) => `https://boldgrowthlabs.io/?ref=${refCode(name)}`;

export const BF_FIELDS = ['name', 'business', 'email', 'phone', 'website', 'plan', 'code', 'referredBy', 'notes'] as const;
