import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { UPLOAD } from '@/lib/intake';

/* ============================================================
   ASSET UPLOAD — signs the browser's direct upload to Blob.

   The file never passes through this function. Vercel caps a
   request body at 4.5MB, and a single photo off a phone is
   routinely 3–8MB, so routing uploads through the server would
   fail on exactly the files that matter — a contractor's job
   photos. `handleUpload` instead hands the browser a short-lived
   signed token and the browser PUTs straight to Blob storage.

   That token is the thing to be careful with: it authorises a
   write to your store. `onBeforeGenerateUpload` is where the
   limits get enforced, and it runs server-side, so a client
   cannot widen them by editing the request.
   ============================================================ */

export const runtime = 'edge';

export async function POST(req: Request): Promise<NextResponse> {
  /* No store attached yet — say so plainly rather than throwing a 500, so the
     form can tell the visitor to email files instead of silently losing them. */
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  const body = (await req.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
          'image/heic', 'image/heif', 'application/pdf', 'application/zip',
          'application/postscript', 'application/octet-stream',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain', 'text/rtf',
        ],
        maximumSizeInBytes: UPLOAD.maxBytes,
        /* Random suffix on by default: two visitors both uploading "logo.png"
           must not overwrite each other. */
        addRandomSuffix: true,
      }),
      /* Fires after the browser finishes. Nothing to do here — the URLs come
         back to the client, which submits them with the answers, so the sheet
         row and its files arrive together rather than as two half-records. */
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { ok: false, reason: 'upload_failed', detail: (err as Error).message },
      { status: 400 },
    );
  }
}
