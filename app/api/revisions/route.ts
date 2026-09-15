import { NextResponse } from 'next/server';
import { issueSignedToken, presignUrl } from '@vercel/blob';

/* ============================================================
   REVISIONS → GOOGLE SHEET

   Same shape and the same reasoning as /api/contact and
   /api/intake: the Apps Script URL is an unauthenticated write
   endpoint, so it stays server-side and never reaches the
   browser.

   Posts to the SAME Apps Script with `form: 'revisions'`, which
   `doPost` routes to its own tab. One submission becomes ONE ROW
   PER REQUEST, so the sheet is a list that can be sorted, filtered
   and ticked off rather than a paragraph in a single cell.
   ============================================================ */

export const runtime = 'edge';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_REQUESTS = 40;

type Req = {
  page?: string; section?: string; device?: string; priority?: string;
  detail?: string; shotUrl?: string; shotPath?: string; shotName?: string;
};
type Asset = { name?: string; url?: string; pathname?: string };

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

  /* Honeypot: answer 200 so the bot believes it worked and does not retry. */
  if (typeof body.botcheck === 'string' && body.botcheck.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const str = (k: string, cap = 2000) => String(body[k] ?? '').trim().slice(0, cap);
  const client = str('client');
  const name = str('name');
  const email = str('email');
  const decision = str('decision');

  if (!client || !name || !decision || !EMAIL.test(email)) {
    return NextResponse.json({ ok: false, reason: 'validation' }, { status: 422 });
  }

  const incoming: Req[] = Array.isArray(body.requests) ? (body.requests as Req[]) : [];
  const requests = incoming.slice(0, MAX_REQUESTS);
  const assets: Asset[] = (Array.isArray(body.assets) ? (body.assets as Asset[]) : []).slice(0, 20);

  /* Screenshots live in the private Blob store, so a raw URL answers 403. Each
     one is signed here, server-side, and the blob `path:` is written alongside
     it — Vercel caps a signature at seven days and there is no longer option,
     so an expired link is reissued with `npm run blob:link <pathname>` rather
     than lost. Same contract as the questionnaire's uploads. */
  const until = Date.now() + 7 * 24 * 60 * 60 * 1000 - 120_000;
  const expires = new Date(until).toISOString().slice(0, 10);

  let token: Awaited<ReturnType<typeof issueSignedToken>> | null = null;
  const needsSigning = requests.some((r) => r?.shotPath) || assets.some((a) => a?.pathname);
  if (needsSigning) {
    try {
      /* One wildcard-scoped token signs every screenshot in the submission
         rather than one round trip per file. */
      token = await issueSignedToken({ operations: ['get'], validUntil: until });
    } catch {
      token = null;
    }
  }

  const rows = [];
  for (const r of requests) {
    let shot = '';
    if (r?.shotPath) {
      if (token) {
        try {
          const { presignedUrl } = await presignUrl(token, {
            operation: 'get', pathname: r.shotPath, validUntil: until, access: 'private',
          });
          shot = `${r.shotName ?? 'screenshot'} — expires ${expires}\n${presignedUrl}\npath: ${r.shotPath}`;
        } catch {
          shot = `${r.shotName ?? 'screenshot'} — signing failed — path: ${r.shotPath}`;
        }
      } else {
        shot = `${r.shotName ?? 'screenshot'} — path: ${r.shotPath}`;
      }
    }
    rows.push({
      page: String(r?.page ?? '').slice(0, 500),
      section: String(r?.section ?? '').slice(0, 120),
      device: String(r?.device ?? '').slice(0, 60),
      priority: String(r?.priority ?? '').slice(0, 60),
      detail: String(r?.detail ?? '').slice(0, 4000),
      shot,
    });
  }

  /* New material the client wants ON the site, as opposed to a screenshot
     showing a problem with it. Signed the same way and written to its own
     column, so it is obvious at a glance which submissions carry files that
     still need doing something with. */
  const assetLines: string[] = [];
  for (const a of assets) {
    if (!a?.pathname) continue;
    if (token) {
      try {
        const { presignedUrl } = await presignUrl(token, {
          operation: 'get', pathname: a.pathname, validUntil: until, access: 'private',
        });
        assetLines.push(`${a.name ?? 'file'} — expires ${expires}\n${presignedUrl}\npath: ${a.pathname}`);
      } catch {
        assetLines.push(`${a.name ?? 'file'} — signing failed — path: ${a.pathname}`);
      }
    } else {
      assetLines.push(`${a.name ?? 'file'} — path: ${a.pathname}`);
    }
  }

  const payload = {
    form: 'revisions',
    receivedAt: new Date().toISOString(),
    client, name, email, decision,
    round: str('round', 60),
    notes: str('notes', 4000),
    count: String(rows.length),
    rows,
    assets: assetLines.join('\n\n').slice(0, 4000),
    assetCount: String(assetLines.length),
    source: String(body.source ?? 'boldgrowthlabs.io/revisions'),
  };

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
