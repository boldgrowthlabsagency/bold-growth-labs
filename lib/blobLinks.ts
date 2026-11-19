import { issueSignedToken, presignUrl } from '@vercel/blob';

/* ============================================================
   SIGNED LINKS FOR UPLOADED FILES

   Shared by every form that takes files (/start, /btc). Uploads
   arrive as URLs, not bytes — the browser already sent them
   straight to Blob storage.

   The store is PRIVATE, so a raw blob URL answers 403. Each file
   therefore gets a signed link generated here, server-side, with
   the read-write token that never leaves the server.

   Vercel caps a signature at SEVEN DAYS and there is no way around
   it, so the pathname is written alongside the link — an expired
   link is reissued with `npm run blob:link <pathname>` without the
   file being lost or the store being made public.
   ============================================================ */

export type Upload = { name?: string; url?: string; pathname?: string };

export async function signedFileLines(files: Upload[]): Promise<string> {
  const until = Date.now() + 7 * 24 * 60 * 60 * 1000 - 120_000;   // just inside the ceiling
  const expires = new Date(until).toISOString().slice(0, 10);

  const lines: string[] = [];
  try {
    /* One wildcard-scoped token signs every file in the submission — a token
       per file would be twenty round-trips on a twenty-file upload. */
    const token = files.length
      ? await issueSignedToken({ operations: ['get'], validUntil: until })
      : null;

    for (const f of files) {
      if (!f?.pathname) { lines.push(`${f?.name ?? 'file'} — ${f?.url ?? 'no link'}`); continue; }
      try {
        const { presignedUrl } = await presignUrl(token!, {
          operation: 'get', pathname: f.pathname, validUntil: until, access: 'private',
        });
        lines.push(`${f.name ?? f.pathname}\n  link (expires ${expires}): ${presignedUrl}\n  path: ${f.pathname}`);
      } catch {
        /* Signing failed — keep the pathname so the file is still retrievable
           by hand. Losing the record is far worse than losing the link. */
        lines.push(`${f.name ?? 'file'} — signing failed — path: ${f.pathname}`);
      }
    }
  } catch {
    for (const f of files) lines.push(`${f?.name ?? 'file'} — path: ${f?.pathname ?? 'unknown'}`);
  }
  return lines.join('\n').slice(0, 4000);
}

export const readUploads = (v: unknown): Upload[] =>
  (Array.isArray(v) ? (v as Upload[]) : []).slice(0, 20);
