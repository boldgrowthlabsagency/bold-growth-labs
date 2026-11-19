import { NextResponse } from 'next/server';
import { AREAS, AUDIT_FIELDS, OPTIONAL, recommend } from '@/lib/audit';

/* ============================================================
   GROWTH AUDITS → GOOGLE SHEET

   Same proxy as the other forms: the Apps Script URL is an
   unauthenticated write endpoint, so it stays server-side. Posts
   with `form: 'audit'`, which doPost routes to its own tab.

   Same bot defences as /api/apply (honeypot + time trap, both
   answered with a fake success). The three areas the answers point
   at are worked out here too and sent as `pointsAt`, so the sheet
   row and the thank-you screen always agree.
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
  for (const f of AUDIT_FIELDS) {
    if (!OPTIONAL.has(f) && !val(f)) {
      return NextResponse.json({ ok: false, reason: 'validation', field: f }, { status: 422 });
    }
  }

  const payload: Record<string, string> = {
    form: 'audit',
    receivedAt: new Date().toISOString(),
    source: val('source', 60) || 'direct',
  };
  for (const f of AUDIT_FIELDS) payload[f] = val(f, f === 'fix' ? 300 : 200);
  payload.pointsAt = recommend(payload).map((id) => AREAS[id].title).join(', ');

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
