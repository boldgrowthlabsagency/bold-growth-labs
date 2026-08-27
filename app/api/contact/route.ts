import { NextResponse } from 'next/server';

/* ============================================================
   CONTACT → GOOGLE SHEET

   The browser posts here, same-origin, and this route forwards to
   the Apps Script bound to the spreadsheet.

   Why a proxy rather than posting to Google straight from the
   page: the Apps Script URL is a write endpoint with no auth on
   it. Anything in the client bundle can be read by anyone, and a
   scraped webhook means someone can append rows to the sheet
   forever. Kept server-side it never reaches the browser.

   It also sidesteps CORS entirely — Apps Script does not answer
   preflight requests, so a browser posting JSON to it directly
   fails unless you downgrade the content type and give up reading
   the response.
   ============================================================ */

export const runtime = 'edge';

const FIELDS = ['name', 'business', 'email', 'phone', 'needs', 'details'] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const endpoint = process.env.SHEETS_WEBHOOK_URL;

  /* Not configured yet — say so explicitly so the form can fall back to the
     visitor's mail client instead of reporting a success that never happened. */
  if (!endpoint) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 });
  }

  /* Honeypot: a field no human sees and no human fills. Answer 200 so the bot
     believes it succeeded and does not retry with something cleverer. */
  if (typeof body.botcheck === 'string' && body.botcheck.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  if (!name || !EMAIL.test(email)) {
    return NextResponse.json({ ok: false, reason: 'validation' }, { status: 422 });
  }

  const payload: Record<string, string> = { receivedAt: new Date().toISOString() };
  for (const f of FIELDS) {
    const v = body[f];
    /* Cap each field: the sheet is the only thing downstream and a megabyte of
       pasted text in one cell helps nobody. */
    payload[f] = (Array.isArray(v) ? v.join(', ') : String(v ?? '')).slice(0, 2000);
  }
  payload.source = String(body.source ?? 'boldgrowthlabs.io');

  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 9000);

    const res = await fetch(endpoint, {
      method: 'POST',
      /* text/plain on purpose: Apps Script reads the raw body via
         e.postData.contents, and this avoids a preflight on the hop. */
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: ac.signal,
      redirect: 'follow',   // Apps Script 302s to script.googleusercontent.com
    });
    clearTimeout(timer);

    if (!res.ok) {
      return NextResponse.json({ ok: false, reason: 'upstream' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, reason: 'network' }, { status: 502 });
  }
}
