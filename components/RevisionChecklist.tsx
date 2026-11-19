'use client';
import { useEffect, useState } from 'react';
import { CHECKLIST } from '@/lib/revisions';

/* ============================================================
   THE PRE-LAUNCH CHECK

   Nine things a client would otherwise only notice after the site
   is live — a mistyped phone number, a service they stopped
   offering, a form nobody ever tested. Ticking is for them, not
   for us: nothing here is submitted, and the ticks live in their
   own browser so closing the tab halfway does not lose the place.

   localStorage can throw outright (private window, blocked site
   data), so every read and write is wrapped and the list simply
   renders unticked when it fails.
   ============================================================ */

const KEY = 'bgl-revisions-check-v1';

export default function RevisionChecklist() {
  const [done, setDone] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      /* no store, no ticks — the list still works as a list */
    }
    setReady(true);
  }, []);

  const toggle = (id: string) => {
    setDone((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const n = done.length;

  return (
    <section className="rv-guide">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[length:var(--step-1)] font-extrabold">
          Check these <span className="text-orange">first</span>
        </h2>
        <span className="rv-count" aria-live="polite">
          {ready ? `${n} / ${CHECKLIST.length}` : `${CHECKLIST.length} things`}
        </span>
      </div>
      <p className="rv-hint mt-2 max-w-[62ch]">
        Five minutes here catches the things that are embarrassing to find later. Tick as you
        go — this is just for you, it is not sent anywhere.
      </p>

      <ul className="mt-5 grid gap-2">
        {CHECKLIST.map((c) => {
          const on = done.includes(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => toggle(c.id)}
                aria-pressed={on}
                className={`rv-check${on ? ' is-on' : ''}`}
              >
                <span className="rv-check__box" aria-hidden>{on ? '✓' : ''}</span>
                <span>{c.t}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
