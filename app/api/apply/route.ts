import { NextResponse } from 'next/server';
import { APPLY_FIELDS } from '@/lib/hiring';

/* ============================================================
   APPLICATIONS → GOOGLE SHEET

   Same proxy as the other three forms: the Apps Script URL is an
   unauthenticated write endpoint, so it stays server-side. Posts
   with `form: 'hiring'`, which doPost routes to its own tab.

   This is the only form on the site whose link is posted publicly
   (an Instagram story), so it gets one extra defence: a submission
   that arrives faster than a person could read the page is treated
   as a bot and answered with a fake success.
   ============================================================ */

export const runtime = 'edge';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_HUMAN_MS = 3000;

export async function POST(req: Request) {
  const endpoint = process.env.SHEETS_WEBHOOK_URL;
  if (!endpoint) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 });
  }

  /* Honeypot, and the time trap. Both answer 200 so the bot believes it
     worked and does not come back with something cleverer. */
  if (typeof body.botcheck === 'string' && body.botcheck.trim() !== '') {
    return NextResponse.json({ ok: true });
  }
  const elapsed = Number(body.elapsed);
  if (Number.isFinite(elapsed) && elapsed < MIN_HUMAN_MS) {
    return NextResponse.json({ ok: true });
  }

  const val = (k: string, cap = 300) => {
    const v = body[k];
    return (Array.isArray(v) ? v.join(', ') : String(v ?? '')).trim().slice(0, cap);
  };

  const phoneDigits = val('phone').replace(/\D/g, '');
  const email = val('email');
  if (phoneDigits.length < 10 || !EMAIL.test(email)) {
    return NextResponse.json({ ok: false, reason: 'validation' }, { status: 422 });
  }
  /* every question is required — same rule as the form */
  for (const f of APPLY_FIELDS) {
    if (!val(f)) {
      return NextResponse.json({ ok: false, reason: 'validation', field: f }, { status: 422 });
    }
  }

  const payload: Record<string, string> = {
    form: 'hiring',
    receivedAt: new Date().toISOString(),
    source: val('source', 60) || 'direct',
  };
  for (const f of APPLY_FIELDS) payload[f] = val(f, f === 'why' ? 300 : 200);

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
