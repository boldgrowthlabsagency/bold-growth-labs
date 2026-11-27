import { NextResponse } from 'next/server';

/* ============================================================
   CLIENT-SITE ENQUIRY → THE CLIENT'S INBOX, AND OUR SHEET

   A site we built for a client (Torres, and whoever follows)
   posts its estimate form here. This route forwards to the Apps
   Script, which emails the owner — photos attached — and writes
   the enquiry to that client's own tab in the spreadsheet.

   Why it lives on boldgrowthlabs.io rather than on the client's
   own host: the Apps Script URL is an unauthenticated write
   endpoint. In a client bundle it would be scraped and used to
   append rows and send mail forever. Here it stays server-side,
   exactly as /api/contact does, and the client site only ever
   knows this URL.

   Unlike the other routes this one is called CROSS-ORIGIN, from
   the client's domain. Hence the allowlist and the preflight
   below: add a client's origin to ORIGINS and their key to SITES
   when a new build goes out, and add the same key to SITES in
   docs/google-sheet-script.gs or the enquiry lands in the
   "Unrouted site enquiries" tab and mails nobody.

   THE RECIPIENT IS NEVER TAKEN FROM THE REQUEST. The browser
   sends a short site key; the address it maps to is held in the
   Apps Script. A `to` field here would turn this into an open
   relay for anyone who found the URL.
   ============================================================ */

export const runtime = 'edge';

/** Where a client build may post from. Exact origins — no wildcards. */
const ORIGINS = new Set([
  /* ⚠ A CLIENT'S LAUNCH DOMAIN BELONGS HERE THE DAY IT GOES LIVE.
     Torres launched on tcpaintingca.com on 27 Nov 2026 and this list still
     held only the preview URL, so every estimate request from the real site
     came back 403 and the visitor saw "That did not go through." The site
     looked finished and quietly took no enquiries. Moving a build to its own
     domain is not done until this list has the new origin in it.
     www. is here as a belt-and-braces entry: Netlify redirects www to the
     apex, so a page is never actually served from it. */
  'https://tcpaintingca.com',
  'https://www.tcpaintingca.com',
  'https://torres-custom-painting-sd.netlify.app',
  'http://localhost:3011',
  'http://127.0.0.1:3011',
]);

/** Keys the Apps Script knows how to route. Keep the two lists in step. */
const SITES = new Set(['torres']);

const FIELDS = ['name', 'email', 'phone', 'address', 'service', 'details'] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Photos arrive base64-encoded inside the JSON body, already resized by the
   browser. The caps are belt and braces — the page compresses to about 250KB
   a photo, and Vercel stops accepting a request body long before 8 of them
   could add up to trouble. A rejected photo never fails the enquiry: the
   enquiry is the thing that matters, so oversize ones are dropped and counted
   rather than erroring the whole submission. */
const PHOTOS = { max: 8, eachBytes: 600_000, totalBytes: 3_400_000 };
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

type Photo = { name: string; type: string; data: string };

function cors(origin: string | null): Record<string, string> {
  const allowed = origin && ORIGINS.has(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: cors(req.headers.get('origin')) });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const headers = cors(origin);

  /* A browser on an unknown origin cannot read our answer anyway; refusing
     here keeps the Apps Script from being driven by someone else's page. */
  if (!origin || !ORIGINS.has(origin)) {
    return NextResponse.json({ ok: false, reason: 'origin' }, { status: 403, headers });
  }

  const endpoint = process.env.SHEETS_WEBHOOK_URL;
  if (!endpoint) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400, headers });
  }

  /* Honeypot, same as /api/contact: answer 200 so the bot stops trying. */
  if (typeof body.botcheck === 'string' && body.botcheck.trim() !== '') {
    return NextResponse.json({ ok: true }, { headers });
  }

  const site = String(body.site ?? '').toLowerCase().trim();
  if (!SITES.has(site)) {
    return NextResponse.json({ ok: false, reason: 'unknown_site' }, { status: 404, headers });
  }

  /* An estimate request needs a way to answer it. Email is optional on these
     forms — a tradesman's customer often only leaves a phone number — so one
     of the two has to be there, not both. */
  const name = String(body.name ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const email = String(body.email ?? '').trim();
  if (!name || (!phone && !EMAIL.test(email)) || (email && !EMAIL.test(email))) {
    return NextResponse.json({ ok: false, reason: 'validation' }, { status: 422, headers });
  }

  const payload: Record<string, unknown> = {
    form: 'site',
    site,
    receivedAt: new Date().toISOString(),
  };
  for (const f of FIELDS) {
    const v = body[f];
    payload[f] = (Array.isArray(v) ? v.join(', ') : String(v ?? '')).slice(0, 2000);
  }
  payload.source = String(body.source ?? site).slice(0, 120);

  const photos: Photo[] = [];
  let dropped = 0;
  let total = 0;
  if (Array.isArray(body.photos)) {
    for (const raw of body.photos.slice(0, PHOTOS.max)) {
      const p = raw as Partial<Photo>;
      const data = String(p?.data ?? '');
      const type = String(p?.type ?? '');
      const bytes = Math.floor((data.length * 3) / 4);
      if (
        !PHOTO_TYPES.has(type) ||
        !BASE64.test(data) ||
        bytes === 0 ||
        bytes > PHOTOS.eachBytes ||
        total + bytes > PHOTOS.totalBytes
      ) {
        dropped += 1;
        continue;
      }
      total += bytes;
      photos.push({ name: String(p?.name ?? 'photo.jpg').slice(0, 120), type, data });
    }
    dropped += Math.max(0, body.photos.length - PHOTOS.max);
  }
  payload.photos = photos;
  /* Said in the email, so the owner knows to ask for the ones that did not
     make it rather than assuming he has the lot. */
  payload.photosDropped = dropped;

  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 20000);

    const res = await fetch(endpoint, {
      method: 'POST',
      /* text/plain on purpose — Apps Script reads e.postData.contents and
         this avoids a preflight on the hop. */
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: ac.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    /* Apps Script answers 200 even when it refused the work — an unknown site
       key returns {ok:false,reason:'unknown_site'} with a 200. Trusting the
       status alone would tell a customer their enquiry was sent when nobody
       was emailed, which is the exact failure this form was built to avoid. */
    const text = await res.text();
    let upstreamOk = res.ok;
    try {
      const parsed = JSON.parse(text) as { ok?: boolean };
      if (parsed && parsed.ok === false) upstreamOk = false;
    } catch {
      /* Not JSON. Apps Script sometimes answers with an HTML error page; the
         status is all we have to go on then. */
    }

    if (!upstreamOk) {
      return NextResponse.json({ ok: false, reason: 'upstream' }, { status: 502, headers });
    }
    return NextResponse.json({ ok: true, photos: photos.length, dropped }, { headers });
  } catch {
    return NextResponse.json({ ok: false, reason: 'network' }, { status: 502, headers });
  }
}
