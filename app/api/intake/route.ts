import { NextResponse } from 'next/server';
import { readUploads, signedFileLines } from '@/lib/blobLinks';
import { INTAKE_FIELDS } from '@/lib/intake';

/* ============================================================
   QUESTIONNAIRE → GOOGLE SHEET

   Same shape and the same reasoning as /api/contact: the Apps
   Script URL is an unauthenticated write endpoint, so it stays
   server-side and never reaches the browser.

   It posts to the SAME Apps Script with `form: 'intake'` set, so
   one deployment handles both. The script routes on that field
   and writes to its own tab — a nineteen-column questionnaire
   would otherwise wreck the enquiry sheet's shape.
   ============================================================ */

export const runtime = 'edge';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUIRED = ['org', 'name', 'email', 'what', 'serve', 'services'] as const;

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

  /* Honeypot, same as the contact route: answer 200 so the bot believes it
     worked and does not come back with something cleverer. */
  if (typeof body.botcheck === 'string' && body.botcheck.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const val = (k: string) => {
    const v = body[k];
    return (Array.isArray(v) ? v.join(', ') : String(v ?? '')).trim();
  };

  for (const k of REQUIRED) {
    if (!val(k)) return NextResponse.json({ ok: false, reason: 'validation', field: k }, { status: 422 });
  }
  if (!EMAIL.test(val('email'))) {
    return NextResponse.json({ ok: false, reason: 'validation', field: 'email' }, { status: 422 });
  }

  const payload: Record<string, string> = {
    form: 'intake',
    receivedAt: new Date().toISOString(),
    source: String(body.source ?? 'boldgrowthlabs.io/start'),
  };
  /* 4000 rather than the contact route's 2000: "what do people always ask"
     and "your main services" are meant to be long, and a truncated answer is
     worse than a wide cell. */
  for (const f of INTAKE_FIELDS) payload[f] = val(f).slice(0, 4000);

  /* Files arrive as URLs; lib/blobLinks.ts turns each into a 7-day signed link
     plus its pathname (the store is private — see that file). */
  const files = readUploads(body.files);
  payload.files = await signedFileLines(files);
  payload.fileCount = String(files.length);

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
