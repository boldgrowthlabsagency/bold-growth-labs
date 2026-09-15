/* ============================================================
   REISSUE A LINK TO AN UPLOADED FILE

     npm run blob:link                     — list everything in the store
     npm run blob:link <pathname>          — fresh 7-day link for one file

   Why this exists: the questionnaire's Blob store is PRIVATE, so a raw
   blob URL answers 403. Links have to be signed, and Vercel caps a
   signature at seven days — there is no longer option. A submission you
   come back to after a fortnight will have a dead link in the sheet.

   The sheet records each file's `path:` next to its link precisely so
   this script can mint a new one. Nothing is lost when a link expires;
   it just needs reissuing.

   Reads the token from .env.local — run `npx vercel env pull .env.local`
   first if that file is missing.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';

const ENV = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(ENV)) {
  console.error('No .env.local found. Run:  npx vercel env pull .env.local');
  process.exit(1);
}
for (const line of fs.readFileSync(ENV, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m) process.env[m[1]] = m[2];
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN missing from .env.local.');
  process.exit(1);
}

const { list, issueSignedToken, presignUrl } = await import('@vercel/blob');
const target = process.argv[2];

if (!target) {
  const { blobs } = await list();
  if (!blobs.length) { console.log('The store is empty.'); process.exit(0); }
  console.log(`${blobs.length} file${blobs.length === 1 ? '' : 's'} in the store:\n`);
  for (const b of blobs) {
    const kb = b.size > 1024 * 1024 ? `${(b.size / 1048576).toFixed(1)} MB` : `${Math.ceil(b.size / 1024)} KB`;
    console.log(`  ${b.pathname}\n    ${kb} · uploaded ${new Date(b.uploadedAt).toISOString().slice(0, 10)}\n`);
  }
  console.log('For a link:  npm run blob:link <pathname>');
  process.exit(0);
}

/* Accept a full URL as well as a bare pathname — it is easier to paste the
   whole thing out of the sheet than to pick the pathname out of it. */
const pathname = target.startsWith('http') ? new URL(target).pathname.replace(/^\//, '') : target;
const until = Date.now() + 7 * 24 * 60 * 60 * 1000 - 120_000;

try {
  const token = await issueSignedToken({ pathname, operations: ['get'], validUntil: until });
  const { presignedUrl } = await presignUrl(token, {
    operation: 'get', pathname, validUntil: until, access: 'private',
  });
  console.log(`\n${pathname}\nexpires ${new Date(until).toISOString().slice(0, 10)}\n\n${presignedUrl}\n`);
} catch (err) {
  console.error(`Could not sign "${pathname}": ${err.message}`);
  console.error('Run `npm run blob:link` with no arguments to see the exact pathnames.');
  process.exit(1);
}
