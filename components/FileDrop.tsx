'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { UPLOAD } from '@/lib/intake';
import { INBOX } from '@/lib/data';

/* ============================================================
   FILE DROP — the questionnaire's upload mechanism, as a piece
   any form can hold (used on /btc).

   Files go straight from the browser to the private Blob store
   through /api/intake/upload (which only signs a token — Vercel
   caps a request body at 4.5MB, a phone photo is routinely more).
   The parent gets the finished uploads back and submits them with
   its answers; the server turns each into a signed link.

   Same two guards as IntakeForm: drops outside the zone are
   swallowed at the window, or the browser navigates to the file
   and everything typed is lost; and the route is probed first, so
   a store that isn't attached says "email them" instead of failing.
   ============================================================ */

export type DroppedFile = { name: string; size: number; url?: string; pathname?: string; error?: string; pending?: boolean };

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function FileDrop({ files, setFiles, blurb }: {
  files: DroppedFile[];
  setFiles: React.Dispatch<React.SetStateAction<DroppedFile[]>>;
  blurb: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [off, setOff] = useState(false);

  useEffect(() => {
    const swallow = (e: DragEvent) => e.preventDefault();
    const clear = (e: DragEvent) => { e.preventDefault(); setDragging(false); };
    window.addEventListener('dragover', swallow);
    window.addEventListener('drop', clear);
    window.addEventListener('dragend', clear);
    fetch('/api/intake/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then((r) => setOff(r.status === 503))
      .catch(() => setOff(true));
    return () => {
      window.removeEventListener('dragover', swallow);
      window.removeEventListener('drop', clear);
      window.removeEventListener('dragend', clear);
    };
  }, []);

  const upload = useCallback(async (list: FileList | File[]) => {
    const incoming = Array.from(list);
    setFiles((cur) => {
      const room = UPLOAD.maxFiles - cur.length;
      return [...cur, ...incoming.slice(0, Math.max(0, room)).map((f) => ({ name: f.name, size: f.size, pending: true }))];
    });
    const { upload: put } = await import('@vercel/blob/client');
    for (const file of incoming.slice(0, UPLOAD.maxFiles)) {
      const mark = (patch: Partial<DroppedFile>) =>
        setFiles((cur) => cur.map((u) => (u.name === file.name && u.size === file.size ? { ...u, ...patch } : u)));
      if (file.size > UPLOAD.maxBytes) { mark({ pending: false, error: `Too big (${kb(file.size)}), 25 MB max` }); continue; }
      try {
        const blob = await put(file.name, file, { access: 'private', handleUploadUrl: '/api/intake/upload' });
        mark({ pending: false, url: blob.url, pathname: blob.pathname });
      } catch {
        mark({ pending: false, error: 'Upload failed' });
      }
    }
  }, [setFiles]);

  if (off) {
    return (
      <p className="rounded-xl border border-orange/40 bg-orange/10 p-4 text-[13.5px] leading-relaxed">
        File uploads aren&rsquo;t switched on right now. Book your spot, then email your files to{' '}
        <a className="underline" href={`mailto:${INBOX}`}>{INBOX}</a>.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-3 text-[12.5px] leading-relaxed text-white/50">{blurb}</p>
      <div
        role="button" tabIndex={0}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.length) upload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        className={`cursor-pointer rounded-2xl border border-dashed p-8 text-center transition-colors ${
          dragging ? 'border-orange bg-orange/10' : 'border-white/20 bg-white/[0.02] hover:border-white/40'
        }`}
      >
        <p className="text-[15px] font-semibold">Drop files here</p>
        <p className="mt-1.5 text-[12.5px] text-white/50">or tap to choose · up to {UPLOAD.maxFiles} files, 25 MB each</p>
        <input ref={inputRef} type="file" multiple hidden accept={UPLOAD.accept.join(',')}
          onChange={(e) => { if (e.target.files) upload(e.target.files); e.target.value = ''; }} />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 grid gap-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[13px]">
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className={`shrink-0 text-[11px] uppercase tracking-[0.14em] ${f.error ? 'text-orange' : 'text-white/40'}`}>
                {f.pending ? 'Uploading…' : f.error ? f.error : kb(f.size)}
              </span>
              <button type="button" aria-label={`Remove ${f.name}`}
                onClick={() => setFiles((c) => c.filter((_, j) => j !== i))}
                className="shrink-0 text-white/40 transition-colors hover:text-white">✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
