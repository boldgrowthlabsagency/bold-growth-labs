import { NextResponse } from 'next/server';
import { readUploads, signedFileLines } from '@/lib/blobLinks';
import { BF, BF_FIELDS, BTC, REFERRAL, SALE_PLANS, bonusesFor, deposit, isBtcCode, money, refCode, refLink, saleLive } from '@/lib/blackfriday';

/* ============================================================
   BLACK FRIDAY BOOKINGS → GOOGLE SHEET

   Same proxy as the other forms: the Apps Script URL is an
   unauthenticated write endpoint, so it stays server-side. Posts
   with `form: 'blackfriday'`, which doPost routes to its own tab.

   The price and deposit are looked up here from the plan id, never
   taken from the browser, so the sheet always shows what the sale
   actually charges. Bookings after the deadline are refused rather
   than silently accepted at a price that no longer exists.

   Bonuses are worked out here too (bonusesFor), never trusted from
   the browser. They go to the sheet AND into the confirmation email
   the Apps Script sends the booker — their promise in writing.
   ============================================================ */

export const runtime = 'edge';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_HUMAN_MS = 3000;

export async function POST(req: Request) {
  const endpoint = process.env.SHEETS_WEBHOOK_URL;
  if (!endpoint) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }
  if (!saleLive()) {
    return NextResponse.json({ ok: false, reason: 'ended' }, { status: 410 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 });
  }

  if (typeof body.botcheck === 'string' && body.botcheck.trim() !== '') {
    return NextResponse.json({ ok: true });
  }
  const elapsed = Number(body.elapsed);
  if (Number.isFinite(elapsed) && elapsed < MIN_HUMAN_MS) {
    return NextResponse.json({ ok: true });
  }

  const val = (k: string, cap = 200) => String(body[k] ?? '').trim().slice(0, cap);

  const plan = SALE_PLANS.find((p) => p.id === val('plan'));
  if (!plan || !val('name') || !val('business') || !EMAIL.test(val('email')) || val('phone').replace(/\D/g, '').length < 10) {
    return NextResponse.json({ ok: false, reason: 'validation' }, { status: 422 });
  }
  if (val('code') && !isBtcCode(val('code'))) {
    return NextResponse.json({ ok: false, reason: 'validation', field: 'code' }, { status: 422 });
  }
  /* committee bookings must name their current site (or say "none") */
  if (isBtcCode(val('code')) && !val('website')) {
    return NextResponse.json({ ok: false, reason: 'validation', field: 'website' }, { status: 422 });
  }

  const payload: Record<string, string> = {
    form: 'blackfriday',
    receivedAt: new Date().toISOString(),
    source: val('source', 60) || 'direct',
  };
  for (const f of BF_FIELDS) payload[f] = val(f, f === 'notes' ? 600 : 200);
  payload.plan = plan.name;
  /* Black Friday prices never take the referral credit — that is for regular
     pricing only. `referredBy` is still recorded so the referrer is credited. */
  payload.price = money(plan.now);
  payload.deposit = money(deposit(plan.now));
  const now = Date.now();
  payload.code = isBtcCode(val('code')) ? BTC.code : '';
  payload.early = payload.code && now < Date.parse(BF.earlyEndsAt) ? 'Yes' : '';
  payload.member = payload.code ? BTC.name : '';
  payload.bonuses = bonusesFor(plan.id, payload.code, now)
    .map((b) => b.label + (b.value ? ` (${money(b.value)} value)` : ''))
    .join('\n');
  /* /btc uploads — signed 7-day links plus pathnames, see lib/blobLinks.ts */
  const files = readUploads(body.files);
  payload.fileCount = files.length ? String(files.length) : '';
  payload.files = files.length ? await signedFileLines(files) : '';
  payload.depositPct = `${BF.depositPct}%`;
  payload.holdUntil = new Date(now + BF.holdHours * 3600_000).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }) + ' PT';
  payload.endsLabel = BF.endsLabel;
  payload.depositUrl = BF.depositUrl;
  payload.refCode = refCode(payload.name);
  payload.refGive = money(REFERRAL.give);
  payload.refGet = money(REFERRAL.get);
  payload.refLink = refLink(payload.name);
  payload.refTiers = payload.code
    ? BTC.referralTiers.map((t) => `${t.when}: ${t.reward} (${money(t.value)} value)`).join('\n')
    : '';

  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 9000);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: ac.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) return NextResponse.json({ ok: false, reason: 'upstream' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, reason: 'network' }, { status: 502 });
  }
}
