'use client';

import { useEffect, useRef, useState } from 'react';
import { Img, useProgress, useSeen, range, mix, diagonalWipe, ASSETS } from './kit';
import DemoForm from './DemoForm';

/* ============================================================
   MERIDIAN CABINETRY — concept build

   Not a joinery website. An architecture monograph about a
   millwork atelier, translated to screen.

   House rules, enforced again in meridian.css:
   · the grid is DECLARED, not felt. Measure marks, plate
     numbers, dimension annotations and monospace specification
     tables are visible furniture, not decoration.
   · display type is set modestly — clamp(1.9rem, 4.4vw, 4.2rem)
     wide-tracked uppercase — because the photography and the
     annotation carry the page.
   · a permanent right-hand rail runs the length of the document
     carrying the running section label and the plate count, the
     way a printed monograph carries a running head.
   · motion is measured: a plate wipes a precise distance and
     stops, a rule extends to an exact length, a caption steps
     in. 0.4–0.7s on cubic-bezier(.65,0,.35,1) — symmetrical, so
     movements arrive as deliberately as they leave. Nothing
     drifts, nothing snaps, nothing dissolves.
   · brass is reserved for actions and active states. Walnut,
     oak and ink carry everything else.

   Signature interaction: the drawn/built wipe (section 03). The
   elevation is traced from the very photograph it wipes into, so
   the two plates share one camera exactly and the linework lines
   up with the cabinetry as the edge crosses.

   Every selector is namespaced `mrd-`.
   ============================================================ */

/* Read live rather than only in CSS, so pointer-driven tactility can be
   switched off at source. */
function useReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}


type SpecRow = { k: string; v: string };



const PROCESS = [
  {
    n: '01',
    t: 'MEASURE',
    d: 'Recorded to ±1 mm by the maker who will build it.',
    w: 'WK 01',
    dim: '±1 mm',
  },
  {
    n: '02',
    t: 'DRAWING',
    d: 'Full-size elevations, signed off in the room they describe.',
    w: 'WK 02–04',
    dim: '1:1',
  },
  {
    n: '03',
    t: 'SELECTION',
    d: 'One log per commission, laid up in sequence. Grain runs continuously.',
    w: 'WK 04–06',
    dim: '1 LOG',
  },
  {
    n: '04',
    t: 'BENCH',
    d: 'Every run dry-fitted whole on the shop floor before finishing.',
    w: 'WK 06–12',
    dim: '±0.4 mm',
  },
  {
    n: '05',
    t: 'INSTALL',
    d: 'Scribed on site over four to six days. Brass fitted last.',
    w: 'WK 13–14',
    dim: '4–6 DAYS',
  },
];

/* The commission types the atelier actually takes. Kept to five, described by
   what is made rather than by benefit — this build is a monograph, and a
   bulleted value proposition would break its voice on contact. */
const COMMISSIONS: Array<{ n: string; title: string; body: string; note: string }> = [
  { n: 'I', title: 'Kitchens', body: 'Full rooms: carcases, island, tall runs and the stone that sits on them. Drawn around how the room is actually cooked in.', note: '14–20 weeks' },
  { n: 'II', title: 'Libraries & studies', body: 'Floor-to-ceiling shelving scribed to the wall, ladder rails, concealed doors and desks built into the run.', note: '10–16 weeks' },
  { n: 'III', title: 'Dressing rooms', body: 'Wardrobes, island drawers and interior fittings in solid timber — no melamine liners behind a hardwood face.', note: '9–14 weeks' },
  { n: 'IV', title: 'Bath & vanity', body: 'Wet-area cabinetry built to survive it: solid frames, marine-grade substrate, hand-applied finish.', note: '7–11 weeks' },
  { n: 'V', title: 'Architectural millwork', body: 'Panelling, staircases, doors and the trim that ties them together, matched to the house rather than to a catalogue.', note: 'By survey' },
];

const QUESTIONS: Array<{ q: string; a: string }> = [
  { q: 'How is a commission priced?', a: 'By drawing, not by linear metre. We survey, draw the room at full size, and quote the actual panels — which is why the number does not move once you have it.' },
  { q: 'Why does it take four months?', a: 'The timber is bought as a log and cut for your room, then it has to dry, settle and be worked by eleven people who are also finishing someone else\u2019s. Nine commissions a year is the honest capacity.' },
  { q: 'Can you match existing joinery?', a: 'Usually. We take a sample from the room, match species, cut and finish in the workshop, and show you the panel before anything is built.' },
  { q: 'Do you install, or is that separate?', a: 'Our own fitters, always. The people who made the carcases hang the doors — nothing is handed to a site crew who have never seen the drawing.' },
  { q: 'What happens years later?', a: 'Solid timber moves. We come back and adjust hinges and runners at no charge for the first two years, and at cost after that, for as long as the work stands.' },
];

/* Five items and a CTA. Seven plus a button overflowed the bar and clipped
   the call to action, which is the one thing in the header that has a job. */
/* SELECTED KITCHENS — the "see our work" section.

   Four rooms that share a workshop and almost nothing else. The section only
   works if the four are unmistakably different, so each entry carries a style
   line as well as a materials line — the argument being that Meridian is not a
   look, it is a way of building, and the timber is chosen from the house
   rather than from a house style.

   Entries render only when their asset is registered in ASSETS.meridian, so a
   fifth can be added by dropping in a file and one line. */
const KITCHENS: Array<{
  name: string; title: string; place: string; style: string;
  timber: string; stone: string; note: string; alt: string;
}> = [
  {
    name: 'kitchenwalnut',
    title: 'Arbour Lane',
    place: 'Alder Point · 2023',
    style: 'Warm modern',
    timber: 'American black walnut, book-matched',
    stone: 'Honed grey limestone',
    note: 'Full-height slab doors with no frame and no bead — the figure is the only ornament, so the run is set out from the centre of the tall bank and the grain carries across every door. Solid brass bar pulls, left unlacquered.',
    alt: 'A warm modern walnut kitchen: full-height slab doors, brass bar pulls, honed grey stone island and lime plaster walls in raking afternoon light',
  },
  {
    name: 'kitchencherry',
    title: 'Marlow House',
    place: 'Buckinghamshire · 2024',
    style: 'Traditional English',
    timber: 'American cherry, inset and framed',
    stone: 'Honed black soapstone',
    note: 'Inset doors hung inside a face frame with an even reveal all round — the slowest way to build a kitchen and the only one that suits a house this old. The dresser is scribed in but detailed to read as free-standing.',
    alt: 'A traditional English cherry kitchen: inset framed doors, an open dresser, black soapstone counters, bronze hardware and wide reclaimed oak boards',
  },
  {
    name: 'kitchenwenge',
    title: 'Ashcombe Mews',
    place: 'London · 2025',
    style: 'Contemporary, sculptural',
    timber: 'Fumed oak, horizontal figure',
    stone: 'Book-matched marble, mitred',
    note: 'The most architectural of the four. A brass reveal runs the full length of the island and returns into a lit alcove, so the joinery reads as one continuous object rather than a row of cabinets.',
    alt: 'A dark contemporary kitchen in fumed oak with brass inlay reveals, a lit brass alcove, book-matched marble island and polished concrete floor',
  },
  {
    name: 'kitchenmaple',
    title: 'Fenwick Row',
    place: 'Chilterns · 2025',
    style: 'Nordic minimal',
    timber: 'Pale maple, slab front',
    stone: 'Carrara, with matching upstand',
    note: 'Almost no contrast anywhere: pale maple, pale marble, pale terrazzo, and a skylight doing the work a light fitting would usually do. Slim stainless pulls are the only hard edge in the room.',
    alt: 'A pale Nordic minimal kitchen in maple with slim steel bar pulls, Carrara marble counters and upstand, terrazzo floor and a skylight above',
  },
];

const NAV: Array<{ label: string; href: string }> = [
  { label: 'COMMISSIONS', href: '#mrd-commissions' },
  { label: 'WORK', href: '#mrd-plate' },
  { label: 'PROCESS', href: '#mrd-process' },
  { label: 'CONTACT', href: '#mrd-close' },
];

/* A drawn dimension annotation: end ticks, a rule, a monospace figure. */
function Dim({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span className={`mrd-dim ${className}`}>
      <i className="mrd-dim-cap" aria-hidden="true" />
      <i className="mrd-dim-line" aria-hidden="true" />
      <em className="mrd-dim-fig">{label}</em>
      <i className="mrd-dim-line" aria-hidden="true" />
      <i className="mrd-dim-cap" aria-hidden="true" />
    </span>
  );
}

export default function Meridian() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const stmtRef = useRef<HTMLElement>(null);
  /* ── drawn → built ──────────────────────────────────────
     The linework is traced from the very photograph it wipes into, so the two
     plates share one camera and the edge crosses a fixed frame rather than
     cutting between two different rooms. */
  const commRef = useRef<HTMLElement>(null);
  const qRef = useRef<HTMLElement>(null);
  const [openQ, setOpenQ] = useState<number | null>(0);
  const builtP = useProgress(heroRef);
  const builtReveal = range(builtP, 0.16, 0.78);
  const { afterClip: builtClip, seamClip: builtSeam } = diagonalWipe(builtReveal, 2.8);
  const drawnOn = 1 - range(builtReveal, 0.44, 0.52);
  const builtOn = range(builtReveal, 0.52, 0.60);

  const processRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLElement>(null);

  const reduced = useReduced();

  const heroSeen = useSeen(heroRef, '-4%');
  const stmtSeen = useSeen(stmtRef);
  const processSeen = useSeen(processRef);
  const plateSeen = useSeen(plateRef);
  const closeSeen = useSeen(closeRef);

  /* Whole-document progress drives the rail's plate track — the screen
     equivalent of a thumb index cut into the fore-edge of a book. */
  const docProgress = useProgress(rootRef);
  const railFill = range(docProgress, 0.015, 0.985);


  /* Running head. Whichever section crosses the middle of the viewport owns
     the rail, the way a running head owns a spread. */
  const [head, setHead] = useState({ label: 'FRONTISPIECE', plate: '01' });
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-mrd-label]'));
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          setHead({
            label: el.dataset.mrdLabel ?? 'MERIDIAN',
            plate: el.dataset.mrdPlate ?? '01',
          });
        }
      },
      { rootMargin: '-46% 0px -46% 0px', threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);



  return (
    <div ref={rootRef} className="mrd-root">
      {/* ── running rail ─────────────────────────────────────── */}
      <div className="mrd-rail" aria-hidden="true">
        <div className="mrd-rail-in">
          <span className="mrd-rail-head">MERIDIAN CABINETRY — MONOGRAPH №1</span>
          <span className="mrd-rail-mid">{head.label}</span>
          <span className="mrd-rail-track">
            <i style={{ transform: `scaleY(${railFill})` }} />
          </span>
          <span className="mrd-rail-foot">PL. {head.plate} / 06</span>
        </div>
      </div>

      {/* ── nav ──────────────────────────────────────────────── */}
      <header className="mrd-nav">
        <div className="mrd-nav-mark">
          <span className="mrd-mark-name">MERIDIAN</span>
          <i className="mrd-mark-rule" aria-hidden="true" />
          <span className="mrd-mark-sub">
            CABINETRY
            <em>Atelier of custom millwork · est. 2011</em>
          </span>
        </div>

        <nav className="mrd-nav-links" aria-label="Meridian sections">
          {NAV.map((l) => (
            <a key={l.label} href={l.href} className="mrd-nav-link">
              {l.label}
            </a>
          ))}
        </nav>

        <a href="#mrd-enquire" className="mrd-btn mrd-btn--brass mrd-nav-cta">
          START YOUR PROJECT <span className="mrd-arrow">→</span>
        </a>
      </header>

      {/* ── 01 · frontispiece — the drawing becoming the room ─────
          The hero IS the drawn/built wipe. A static photograph of a finished
          kitchen says nothing an ordinary showroom could not; an elevation
          resolving into the room it became is the whole proposition of the
          atelier, stated before a word of copy. It works here because the
          linework was traced from this very photograph, so the two plates
          share one camera and the lines land on the cabinetry exactly. */}
      <section
        ref={heroRef}
        id="mrd-hero"
        data-mrd-label="FRONTISPIECE"
        data-mrd-plate="01"
        className={`mrd-hero ${heroSeen ? 'mrd-in' : ''}`}
      >
        <div className="mrd-hero-sticky">
          <div className="mrd-hero-stage">
            {/* the drawing is the base; the built room is clipped over it */}
            <div className="mrd-hero-layer mrd-hero-plan">
              <Img
                slug="meridian"
                name="drawing"
                tall
                alt="Full-size elevation drawing of the Clarendon Row kitchen: cabinet runs, island and shelf line in ink"
                sizes="100vw"
                priority
                className="mrd-hero-img mrd-hero-ink"
              />
            </div>

            <div
              className="mrd-hero-layer mrd-hero-real"
              style={{ clipPath: builtClip, WebkitClipPath: builtClip }}
            >
              <Img
                slug="meridian"
                name="interior"
                tall
                alt="The same kitchen as built: white oak cabinetry, stone island, morning light"
                sizes="100vw"
                priority
                className="mrd-hero-img"
              />
            </div>

            <div
              className="mrd-hero-seam"
              aria-hidden="true"
              style={{ clipPath: builtSeam, WebkitClipPath: builtSeam }}
            />

            {/* the scrim only covers the type column, so the wipe stays legible */}
            <span className="mrd-hero-scrim" aria-hidden="true" />

            <div className="mrd-hero-type">
              <span className="mrd-eyebrow mrd-eyebrow--inv">Monograph №1 — drawn, then built</span>
              <h1 className="mrd-display mrd-display--inv">
                <span className="mrd-line">MERIDIAN</span>
                <span className="mrd-line">CABINETRY</span>
              </h1>
              <i className="mrd-hero-rule" aria-hidden="true" />
              <p className="mrd-hero-stmt">
                An atelier of eleven, cutting one commission from one log. Every
                panel is drawn at full size first — scroll, and this one becomes
                the room.
              </p>
              <a href="#mrd-enquire" className="mrd-btn mrd-btn--brass mrd-hero-cta">
                START YOUR PROJECT <span className="mrd-arrow">→</span>
              </a>

              <p className="mrd-hero-cap">
                <span className="mrd-cap-pl">PL. 01</span>
                <span className="mrd-cap-body">
                  Clarendon Row Residence — kitchen, south elevation
                  <em>Hawthorn Hill · 2024 · drawn 1:1 on paper</em>
                </span>
              </p>
            </div>

            <div className="mrd-hero-swap" aria-hidden="true">
              <span className="mrd-hero-word" style={{ opacity: drawnOn, transform: `translate3d(0,${mix(-12, 0, drawnOn).toFixed(1)}px,0)` }}>
                DRAWN
              </span>
              <span className="mrd-hero-word" style={{ opacity: builtOn, transform: `translate3d(0,${mix(12, 0, builtOn).toFixed(1)}px,0)` }}>
                BUILT
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ── 02 · statement ───────────────────────────────────── */}
      <section
        ref={stmtRef}
        id="mrd-statement"
        data-mrd-label="STATEMENT"
        data-mrd-plate="02"
        className={`mrd-stmt ${stmtSeen ? 'mrd-in' : ''}`}
      >
        <div className="mrd-stmt-side">
          <span className="mrd-sectno">§ 02</span>
          <i className="mrd-ticks mrd-ticks--v" aria-hidden="true" />
          <span className="mrd-vfig">COLUMN 440 mm</span>
        </div>

        <div className="mrd-stmt-body">
          <span className="mrd-eyebrow">Opening statement</span>
          <p className="mrd-lede">
            We measure the room, draw every panel at full size, and buy the log before we
            cut it.
          </p>
          <i className="mrd-rule mrd-rule--ext" aria-hidden="true" />
          <p className="mrd-stmt-sub">
            Eleven makers. Nine commissions a year. No subcontracted carcases, no veneer over
            particle board, and no finish we have not applied ourselves.
          </p>
          <Dim label="MEASURE — 62 CHARACTERS" className="mrd-dim--body" />
        </div>

        <dl className="mrd-stmt-meta">
          <div>
            <dt>ESTABLISHED</dt>
            <dd>2011</dd>
          </div>
          <div>
            <dt>ATELIER</dt>
            <dd>Fenwick Yard · 640 m²</dd>
          </div>
          <div>
            <dt>MAKERS</dt>
            <dd>11</dd>
          </div>
          <div>
            <dt>COMMISSIONS</dt>
            <dd>9 per year</dd>
          </div>
          <div>
            <dt>DRAWN AT</dt>
            <dd>1:1, on paper</dd>
          </div>
        </dl>
      </section>

      <div className="mrd-prompt">
        <p>Every commission begins as a full-size drawing of your own room.</p>
        <a className="mrd-btn mrd-btn--brass" href="#mrd-enquire">START YOUR PROJECT <span className="mrd-arrow">→</span></a>
      </div>
      {/* ── 03 · commissions ─────────────────────────────────── */}
      <section
        ref={commRef}
        id="mrd-commissions"
        data-mrd-label="COMMISSIONS"
        data-mrd-plate="03"
        className="mrd-comm"
      >
        <div className="mrd-comm-head">
          <span className="mrd-sectno">§ 03</span>
          <h2 className="mrd-display mrd-display--sm">WHAT WE TAKE ON</h2>
          <p className="mrd-comm-intro">
            Nine commissions a year, in five kinds of room. Everything is drawn before it is
            quoted, and quoted before a board is bought.
          </p>
          <a href="#mrd-enquire" className="mrd-btn mrd-btn--brass mrd-comm-cta">
            START YOUR PROJECT <span className="mrd-arrow">→</span>
          </a>
        </div>

        <ol className="mrd-comm-list">
          {COMMISSIONS.map((c) => (
            <li key={c.n} className="mrd-comm-row">
              <span className="mrd-comm-n">{c.n}</span>
              <div className="mrd-comm-body">
                <h3 className="mrd-comm-t">{c.title}</h3>
                <p className="mrd-comm-p">{c.body}</p>
              </div>
              <span className="mrd-comm-note">{c.note}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 04 · selected kitchens (see our work) ───────────── */}
      <section
        ref={plateRef}
        id="mrd-plate"
        data-mrd-label="WORK"
        data-mrd-plate="04"
        className={`mrd-work ${plateSeen ? 'mrd-in' : ''}`}
      >
        <div className="mrd-work-head">
          <span className="mrd-sectno">§ 04</span>
          <h2 className="mrd-display mrd-display--sm">SELECTED KITCHENS</h2>
          <p className="mrd-work-intro">
            Four rooms that share a workshop and almost nothing else. We are not a look — the
            timber, the edge and the hardware are argued from the house each time.
          </p>
        </div>

        <div className="mrd-work-list">
          {KITCHENS.filter((k) => ASSETS.meridian[k.name]).map((k, i) => (
            <figure key={k.name} className="mrd-work-item">
              <div className="mrd-work-frame">
                <Img
                  slug="meridian"
                  name={k.name}
                  alt={k.alt}
                  sizes="(max-width: 900px) 92vw, 54vw"
                  className="mrd-work-img"
                />
              </div>
              <figcaption className="mrd-work-cap">
                <span className="mrd-cap-pl">PL. {String(i + 1).padStart(2, '0')}</span>
                <h3 className="mrd-work-t">{k.title}</h3>
                <p className="mrd-work-place">{k.place}</p>
                <p className="mrd-work-style">{k.style}</p>
                <p className="mrd-work-note">{k.note}</p>
                <dl className="mrd-work-spec">
                  <div><dt>Timber</dt><dd>{k.timber}</dd></div>
                  <div><dt>Stone</dt><dd>{k.stone}</dd></div>
                </dl>
              </figcaption>
            </figure>
          ))}
        </div>

        <a href="#mrd-enquire" className="mrd-btn mrd-btn--brass mrd-work-cta">
          START YOUR PROJECT <span className="mrd-arrow">→</span>
        </a>
      </section>


      <div className="mrd-prompt">
        <p>Nine commissions a year. Survey and sample board come first.</p>
        <a className="mrd-btn mrd-btn--brass" href="#mrd-enquire">START YOUR PROJECT <span className="mrd-arrow">→</span></a>
      </div>
      {/* ── 05 · the atelier ─────────────────────────────────── */}
      <section
        ref={processRef}
        id="mrd-process"
        data-mrd-label="THE ATELIER"
        data-mrd-plate="05"
        className={`mrd-proc ${processSeen ? 'mrd-in' : ''}`}
      >
        <figure className="mrd-proc-fig">
          <div className="mrd-proc-vdim" aria-hidden="true">
            <i />
            <span>1,140 mm</span>
            <i />
          </div>
          <div className="mrd-proc-frame">
            <Img
              slug="meridian"
              name="craft"
              alt="A cabinetmaker dry-fitting a walnut carcase at the bench, a hand plane laid beside the panel"
              sizes="(max-width: 760px) 88vw, 34vw"
              className="mrd-proc-img"
            />
          </div>
          <figcaption className="mrd-proc-cap">
            <span className="mrd-cap-pl">PL. 04</span>
            <span className="mrd-cap-body">
              Dry fit — carcase for Clarendon Row
              <em>Fenwick Yard atelier · 2025</em>
              <em>Photograph M. Oyelaran</em>
            </span>
          </figcaption>
        </figure>

        <div className="mrd-proc-body">
          <span className="mrd-sectno">§ 05</span>
          <h2 className="mrd-display mrd-display--sm">FROM MEASURE TO INSTALL</h2>
          <p className="mrd-proc-intro">Fourteen weeks, five stages, one team.</p>

          <ol className="mrd-steps">
            <li className="mrd-step mrd-step--head" style={{ '--mrd-i': 0 } as React.CSSProperties}>
              <span className="mrd-step-n">№</span>
              <span className="mrd-step-t">STAGE</span>
              <span className="mrd-step-d">DESCRIPTION</span>
              <span className="mrd-step-dim">TOLERANCE</span>
              <span className="mrd-step-w">WEEK</span>
            </li>
            {PROCESS.map((s, i) => (
              <li className="mrd-step" key={s.n} style={{ '--mrd-i': i + 1 } as React.CSSProperties}>
                <span className="mrd-step-n">{s.n}</span>
                <span className="mrd-step-t">{s.t}</span>
                <span className="mrd-step-d">{s.d}</span>
                <span className="mrd-step-dim">{s.dim}</span>
                <span className="mrd-step-w">{s.w}</span>
              </li>
            ))}
          </ol>

          <a href="#mrd-plate" className="mrd-btn mrd-btn--text">
            VIEW OUR WORK <span className="mrd-arrow">→</span>
          </a>
        </div>
      </section>

      {/* ── 06 · questions ───────────────────────────── */}
      <section
        ref={qRef}
        id="mrd-questions"
        data-mrd-label="QUESTIONS"
        data-mrd-plate="06"
        className="mrd-q"
      >
        <div className="mrd-q-head">
          <span className="mrd-sectno">§ 06</span>
          <h2 className="mrd-display mrd-display--sm">QUESTIONS, ANSWERED PLAINLY</h2>
        </div>

        <div className="mrd-q-list">
          {QUESTIONS.map((f, i2) => {
            const isOpen = openQ === i2;
            return (
              <div key={f.q} className={`mrd-q-row${isOpen ? ' mrd-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    className="mrd-q-btn"
                    aria-expanded={isOpen}
                    aria-controls={`mrd-q-a-${i2}`}
                    onClick={() => setOpenQ(isOpen ? null : i2)}
                  >
                    <span className="mrd-q-t">{f.q}</span>
                    <span className="mrd-q-ico" aria-hidden>{isOpen ? '–' : '+'}</span>
                  </button>
                </h3>
                <div className="mrd-q-a" id={`mrd-q-a-${i2}`} hidden={!isOpen}>
                  <p>{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 07 · colophon + close ────────────────────────────── */}
      <section
        ref={closeRef}
        id="mrd-close"
        data-mrd-label="COLOPHON"
        data-mrd-plate="07"
        className={`mrd-close ${closeSeen ? 'mrd-in' : ''}`}
      >
        <div className="mrd-close-in">
          <span className="mrd-eyebrow mrd-eyebrow--inv">§ 06 — Commissions</span>
          <h2 className="mrd-display mrd-display--inv">
            <span className="mrd-line">ONE ROOM.</span>
            <span className="mrd-line">ONE LOG.</span>
            <span className="mrd-line">ONE TEAM.</span>
          </h2>
          <i className="mrd-rule mrd-rule--ext mrd-rule--inv" aria-hidden="true" />
          <p className="mrd-close-copy">
            Commissions open twice a year. A survey, a full-size drawing and a sample board cut from
            your own log, before anything at all is committed.
          </p>

          <div className="mrd-close-acts">
            <a href="#mrd-enquire" className="mrd-btn mrd-btn--brass mrd-btn--lg">
              START YOUR PROJECT <span className="mrd-arrow">→</span>
            </a>
            <a href="#mrd-plate" className="mrd-btn mrd-btn--text mrd-btn--text-inv">
              VIEW OUR WORK <span className="mrd-arrow">→</span>
            </a>
          </div>

          <div className="mrd-enquire" id="mrd-enquire">
            <div className="mrd-enquire-head">
              <span className="mrd-eyebrow mrd-eyebrow--inv">Open a commission</span>
              <h3 className="mrd-enquire-h">Tell us about the room.</h3>
              <p className="mrd-enquire-p">
                We take nine commissions a year. If the book is full we will say so in the reply
                rather than keep you waiting.
              </p>
            </div>
            <DemoForm
              prefix="mrd"
              options={['Kitchen', 'Library or study', 'Dressing room', 'Bath & vanity', 'Architectural millwork', 'Something else']}
              labels={{ interest: 'Kind of commission', message: 'About the room', submit: 'Open a commission' }}
              messageHint="Rough dimensions, the house it sits in, and any timber you already have in mind."
            />
          </div>

          <dl className="mrd-colophon">
            <div>
              <dt>EDITION</dt>
              <dd>Monograph №1 · 06 plates</dd>
            </div>
            <div>
              <dt>PHOTOGRAPHY</dt>
              <dd>H. Marsden · M. Oyelaran</dd>
            </div>
            <div>
              <dt>TYPESET</dt>
              <dd>Wide-tracked capitals, monospace appendix</dd>
            </div>
            <div>
              <dt>ATELIER</dt>
              <dd>Fenwick Yard · by appointment</dd>
            </div>
          </dl>

          <div className="mrd-fiction">
            <span className="mrd-fiction-mark">CONCEPT BUILD</span>
            <p>
              Meridian Cabinetry is a fictional business created to demonstrate the studio&rsquo;s
              work. It is not a client. The projects, plates, addresses and photographic credits on
              this page are invented, and no real company or person is implied.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
