'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CONCEPT_BRANDS, type ConceptSlug } from '@/lib/concepts';
import { projects, PHONE } from '@/lib/data';
import MagneticButton from './MagneticButton';
import { pauseSmoothScroll, resumeSmoothScroll } from './SmoothScroll';

/* ============================================================
   THE TAKEOVER

   Previously this framed each concept in a panel with a permanent
   330px art-direction sidebar. That sidebar was working against
   the whole point: you cannot feel like you have stepped into
   another company's website while a studio's commentary sits
   alongside it the entire time.

   So the build now fills the viewport edge to edge, and the
   commentary moved into a drawer that is closed by default. The
   only persistent chrome is a slim bar — brand name, the concept
   marker, navigation, close — and it fades back once you start
   scrolling so the build has the screen to itself.
   ============================================================ */

type Props = {
  slug: ConceptSlug | null;
  onClose: () => void;
  onNavigate: (slug: ConceptSlug) => void;
  render: (slug: ConceptSlug) => JSX.Element | null;
};

export default function ConceptModal({ slug, onClose, onNavigate, render }: Props) {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState(false);
  const [dim, setDim] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  const order = Object.keys(CONCEPT_BRANDS) as ConceptSlug[];
  const idx = slug ? order.indexOf(slug) : -1;
  const brand = slug ? CONCEPT_BRANDS[slug] : null;
  const meta = slug ? projects.find((p) => p.slug === slug) : null;

  const go = useCallback(
    (step: number) => {
      if (idx < 0) return;
      setNotes(false);
      onNavigate(order[(idx + step + order.length) % order.length]);
    },
    [idx, onNavigate, order],
  );

  /* Reset the stage on every change of build — otherwise concept two opens
     halfway down because concept one was left scrolled. */
  useLayoutEffect(() => {
    if (stage.current) stage.current.scrollTop = 0;
    setDim(false);
  }, [slug]);

  /* Scroll lock, focus, keyboard. The body keeps its position via a fixed
     offset rather than overflow:hidden, which on iOS silently jumps the page
     to the top when the modal closes. */
  useEffect(() => {
    if (!slug) return;
    /* Park page smooth-scrolling for the duration. The page behind is locked
       anyway, and a live instance competes with the stage's own scroller. */
    pauseSmoothScroll();
    restoreTo.current = document.activeElement as HTMLElement;
    const y = window.scrollY;
    const body = document.body;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width };
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.width = '100%';

    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (notes) { setNotes(false); return; }
        onClose();
        return;
      }
      if (e.key === 'ArrowRight' && !notes) { go(1); return; }
      if (e.key === 'ArrowLeft' && !notes) { go(-1); return; }
      if (e.key !== 'Tab') return;
      const f = panel.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!f || !f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, y);
      restoreTo.current?.focus?.();
      resumeSmoothScroll();
    };
  }, [slug, onClose, go, notes]);

  /* Once the visitor is into the build, the studio chrome recedes. */
  const onStageScroll = () => {
    const t = stage.current?.scrollTop ?? 0;
    setDim(t > 120);
  };

  const toContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClose();
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      ),
    );
  };

  if (!mounted || !slug || !brand) return null;

  return createPortal(
    <div
      className={`cmod${dim ? ' is-dim' : ''}${notes ? ' is-notes' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${brand.name} ${brand.descriptor} — concept build`}
    >
      <div className="cmod__panel" ref={panel}>
        {/* data-lenis-prevent: page smooth-scroll hijacks wheel and touch across
            the whole document, so without this the stage silently refuses to
            scroll at all. */}
        <div className="cmod__stage" ref={stage} onScroll={onStageScroll} data-lenis-prevent>
          {/* Real scale, full bleed. The builds are responsive full-screen
              experiences — the panel is a viewport onto the site, nothing more. */}
          {render(slug)}
        </div>

        <header className="cmod__bar">
          <div className="cmod__id">
            <b>{brand.name}</b>
            <span className="cmod__badge">Concept build</span>
          </div>
          <div className="cmod__tools">
            <button type="button" onClick={() => setNotes((v) => !v)} className="cmod__about" aria-expanded={notes}>
              About this build
            </button>
            <button type="button" onClick={() => go(-1)} aria-label="Previous concept">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="cmod__count">{idx + 1} / {order.length}</span>
            <button type="button" onClick={() => go(1)} aria-label="Next concept">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" ref={closeBtn} className="cmod__x" onClick={onClose} aria-label="Close concept">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        </header>

        <aside className="cmod__notes" aria-hidden={!notes}>
          <p className="cmod__eyebrow">Art direction</p>
          <p className="cmod__dir">{brand.direction}</p>

          <p className="cmod__eyebrow">What this build demonstrates</p>
          <ul className="cmod__list">
            {brand.demonstrates.map((d) => <li key={d}>{d}</li>)}
          </ul>

          <p className="cmod__eyebrow">Palette</p>
          <div className="cmod__pal">
            {brand.palette.map((s) => (
              <span key={s.hex} title={`${s.name} ${s.hex}`}>
                <i style={{ background: s.hex }} />
                <em>{s.name}</em>
              </span>
            ))}
          </div>

          {meta && (
            <>
              <p className="cmod__eyebrow">Scope</p>
              <div className="cmod__tags">{meta.tags.map((t) => <span key={t}>{t}</span>)}</div>
            </>
          )}

          <div className="cmod__act">
            <MagneticButton href="#contact" onClick={toContact}>Build mine like this</MagneticButton>
            <MagneticButton href={`tel:${PHONE}`} variant="ghost" arrow={false}>Call BOLD</MagneticButton>
          </div>

          <p className="cmod__fine">
            {brand.name} is a fictional business created to demonstrate our work. It is
            not a client and does not exist.
          </p>
        </aside>
      </div>
    </div>,
    document.body,
  );
}
