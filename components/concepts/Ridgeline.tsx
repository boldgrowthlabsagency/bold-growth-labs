'use client';
import { useEffect, useRef, useState } from 'react';
import { Img, useProgress, useSeen, usePointer, diagonalWipe, range, mix } from './kit';
import DemoForm from './DemoForm';

/* ============================================================
   RIDGELINE ROOFING — concept build

   Premise: a roofing company that sells like an engineering firm.
   The page is built as an instrument, not a brochure — a ruled
   chassis of hairlines and monospace data with one genuinely
   interactive diagnostic at its centre.

   Copy discipline: the chassis carries the authority, so the
   prose stays blunt. One finding per point at rest, the scope
   behind a disclosure, everything else cut. Where words came
   out, whitespace went in.

   House rules, enforced in ridgeline.css:
   · zero border-radius, anywhere, on anything
   · display type is heavy condensed uppercase; EVERY figure,
     label, spec and caption is monospace
   · safety orange is an action colour only — CTAs, the active
     inspection point, the active toggle, focus rings. Never trim.
   · durations 0.12–0.28s on cubic-bezier(.2,0,0,1). Things snap,
     rules draw, counters tick. Nothing drifts, fades slowly or
     blurs — that is a different brand's language.
   · only transform / opacity / clip-path ever animate

   Every selector is namespaced `rdg-`.
   ============================================================ */

/* ---------- inspection data --------------------------------------------- */

type Point = {
  id: string;
  title: string;
  zone: string;
  x: number;              // % across the roofline plate
  y: number;              // % down the roofline plate
  side: 'l' | 'r';        // which way the hover label unfolds
  severity: number;       // 1–5, drives the segment meter
  sevLabel: string;
  finding: string;        // the headline, visible at rest
  spec: string;           // monospace numbers, visible at rest
  scope: string;          // behind the disclosure
};

/* Coordinates sit inside 22–78% x / 30–65% y so every marker lands on roof
   plane rather than sky or tree line. */
/* What the company actually sells. Written as scope lines rather than
   marketing copy — this build's whole voice is "here is what we found and
   what we did about it", and a services list in any other register would
   sound like a different company wrote it. */
const SERVICES: Array<{ n: string; title: string; body: string; scope: string; shot: string; alt: string }> = [
  { n: '01', title: 'RE-ROOF', body: 'Full tear-off to deck, new underlayment, ice-and-water at every valley and eave. Architectural or standing seam.', scope: 'TEAR-OFF · DECK REPAIR · 25-YR', shot: 'svcreroof', alt: 'A crew laying fresh architectural shingle across a stripped roof deck' },
  { n: '02', title: 'STORM RESPONSE', body: 'Tarped same day, documented for the adjuster, then repaired. We photograph before anything is touched.', scope: 'EMERGENCY · CLAIM PACK', shot: 'svcstorm', alt: 'Lifted and torn shingles across a storm-hit roof slope' },
  { n: '03', title: 'REPAIR & LEAK TRACING', body: 'Water rarely enters where it shows. We trace it to the penetration rather than patching the stain.', scope: 'FLASHING · BOOTS · VALLEYS', shot: 'svcrepair', alt: 'Close detail of step flashing woven into shingle courses against siding' },
  { n: '04', title: 'GUTTER & FLASHING', body: 'Seamless aluminium run on site, step flashing woven into the courses instead of caulked over them.', scope: 'SEAMLESS · STEP · APRON', shot: 'svcgutter', alt: 'Seamless gutter and fascia detail along a gable end' },
  { n: '05', title: 'INSPECTION', body: 'Forty-point survey with a photographed findings sheet. Yours to keep whether or not you hire us.', scope: '40 POINT · PHOTO SHEET', shot: 'svcinspect', alt: 'A roofer kneeling at a stone chimney during a survey' },
];

const FAQS: Array<{ q: string; a: string }> = [
  { q: 'Do you handle the insurance claim?', a: 'We document it and meet your adjuster on the roof. We do not file on your behalf, and we will not tell you a claim is covered when it is not — the photographs decide that, not us.' },
  { q: 'How long does a re-roof take?', a: 'A typical 30-square house is two to three days: tear-off and dry-in on day one, courses and detail work after. Weather moves it; nothing else does.' },
  { q: 'What happens if it rains mid-job?', a: 'The deck is never left open overnight. Everything torn off in a day is dried-in the same day, which is why we tear off in sections rather than all at once.' },
  { q: 'What is actually covered by the warranty?', a: '25 years on workmanship, plus whatever the manufacturer carries on the material. Workmanship is the one that matters — most failures are installation, not shingle.' },
  { q: 'Do you charge for the inspection?', a: 'No, and the findings sheet is yours regardless. If the roof has five good years left we will say so.' },
];

const POINTS: Point[] = [
  {
    id: '01',
    title: 'ROOF VENTILATION',
    zone: 'RIDGE / NET FREE AREA',
    x: 46, y: 32, side: 'r',
    severity: 3, sevLabel: 'ELEVATED',
    finding: 'Ridge slot under-cut, four soffit bays blocked. Attic ran 34°F over ambient.',
    spec: 'TARGET 1:150 NFA · SLOT 1.5 IN/SIDE · RIDGE 40 LF',
    scope: 'Open the slot to 1.5 in per side, fit 40 lf of baffled vent, clear the bays.',
  },
  {
    id: '02',
    title: 'FLASHING',
    zone: 'CHIMNEY / STEP + COUNTER',
    x: 29, y: 45, side: 'r',
    severity: 4, sevLabel: 'HIGH',
    finding: 'Step flashing caulked, not woven. Counter-flashing face-mounted. South bead split.',
    spec: 'STEP 5 X 7 IN · REGLET 1.0 IN · SADDLE 26 GA GALV',
    scope: 'Strip four courses each side, weave new step flashing, cut a reglet, re-form the saddle.',
  },
  {
    id: '03',
    title: 'SHINGLE CONDITION',
    zone: 'SOUTH FIELD / COURSES 14–22',
    x: 62, y: 51, side: 'r',
    severity: 4, sevLabel: 'HIGH',
    finding: 'Mat showing on nine tabs. Courses 18–22 lifted and no longer bond.',
    spec: 'REMAINING LIFE 2–4 YR · EXPOSURE 5 5/8 IN · 22 SQ',
    scope: 'Tear off to bare deck, replace any sheathing over 12% moisture, re-lay six-nail.',
  },
  {
    id: '04',
    title: 'DRAINAGE',
    zone: 'WEST VALLEY / GUTTER',
    x: 74, y: 61, side: 'l',
    severity: 3, sevLabel: 'ELEVATED',
    finding: 'Valley cut open with no metal beneath. Fascia meters 19% moisture.',
    spec: 'VALLEY 24 IN W-PROFILE · FALL 1/16 IN/FT · 2 DOWNSPOUTS',
    scope: 'Fit 24 in valley metal, re-hang 22 lf of gutter, replace 8 lf of fascia.',
  },
  {
    id: '05',
    title: 'STORM DAMAGE',
    zone: 'NORTH-WEST SLOPE / HAIL',
    x: 37, y: 58, side: 'r',
    severity: 5, sevLabel: 'CRITICAL',
    finding: 'Nine bruises in a chalked 10 ft square. Mat fracture, 1.25 in hail.',
    spec: 'TEST SQUARE 10 X 10 FT · STRIKES 9 · CLAIM ELIGIBLE',
    scope: 'Chalk four squares, log strike density, file the report. We meet your adjuster.',
  },
];

/* No body copy here by design — five stage names and the numbers that prove
   them. The spec line is the sentence. */
const PROCESS = [
  { n: '01', t: 'INSPECT', spec: '60–90 MIN · 40+ FRAMES · SAME-DAY REPORT' },
  { n: '02', t: 'SPECIFY', spec: 'FIXED PRICE · ITEMISED · NO CHANGE ORDERS' },
  { n: '03', t: 'TEAR-OFF & DECK', spec: 'BARE DECK · 7/16 IN OSB MIN · 8D RING SHANK' },
  { n: '04', t: 'DRY-IN & INSTALL', spec: 'ICE & WATER 2 COURSES · 6 NAILS/SHINGLE' },
  { n: '05', t: 'AUDIT & HAND-OVER', spec: '25-YR WORKMANSHIP · MFR REG. WITHIN 48 HRS' },
];

/* ---------- local helpers ------------------------------------------------ */

/** Integer counter that ticks up once, quickly, when its section is seen. */
function useTick(target: number, run: boolean, ms = 480) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [target, run, ms]);
  return v;
}

/** Manual thousands grouping — Intl would vary by locale between server and client. */
function group(s: string) {
  const [int, frac] = s.split('.');
  const g = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return frac ? `${g}.${frac}` : g;
}

function Figure({
  value, decimals = 0, unit, label, run,
}: { value: number; decimals?: number; unit: string; label: string; run: boolean }) {
  const pow = Math.pow(10, decimals);
  const ticked = useTick(Math.round(value * pow), run);
  const shown = group((ticked / pow).toFixed(decimals));
  return (
    <div className="rdg-fig">
      <div className="rdg-fig-v">
        <span className="rdg-fig-n">{shown}</span>
        <span className="rdg-fig-u">{unit}</span>
      </div>
      <p className="rdg-fig-l">{label}</p>
    </div>
  );
}

function Mark() {
  return (
    <span className="rdg-mark">
      <svg viewBox="0 0 40 28" aria-hidden focusable="false" className="rdg-mark-glyph">
        <path d="M2 20 20 4l18 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M2 26h36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      </svg>
      <span className="rdg-mark-word">
        <b>RIDGELINE</b>
        <i>ROOFING CO.</i>
      </span>
    </span>
  );
}

function Arrow() {
  return <span className="rdg-arw" aria-hidden>→</span>;
}

/* ---------- build -------------------------------------------------------- */

export default function Ridgeline() {
  const root = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const figRef = useRef<HTMLDivElement>(null);
  const inspRef = useRef<HTMLElement>(null);
  const evRef = useRef<HTMLElement>(null);
  const procRef = useRef<HTMLElement>(null);
  const fileRef = useRef<HTMLElement>(null);
  const svcRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);

  const scroll = useProgress(root);
  const heroSeen = useSeen(heroRef);
  const figSeen = useSeen(figRef);
  const inspSeen = useSeen(inspRef);
  const evSeen = useSeen(evRef);
  const procSeen = useSeen(procRef);
  const fileSeen = useSeen(fileRef);
  const svcSeen = useSeen(svcRef);
  const faqSeen = useSeen(faqRef);
  const closeSeen = useSeen(closeRef);
  const pt = usePointer(plateRef);

  const [active, setActive] = useState(1);   // opens on 02 FLASHING — the sharpest finding
  const [scopeOpen, setScopeOpen] = useState(false);
  /* The evidence wipe. Scroll drives it, exactly as Sunline's does — but the
     FOUND/FIXED buttons stay, pinning it to either end. Without them the only
     way to compare the two frames is to scroll precisely, which is no way to
     ask a keyboard or screen-reader user to inspect a repair. */
  const [pinned, setPinned] = useState<0 | 1 | null>(null);
  const [openQ, setOpenQ] = useState<number | null>(0);
  const p = POINTS[active];

  /* Evidence wipe geometry. The section is tall and its stage sticks, so the
     section's own progress is the wipe's clock. A pin overrides it outright. */
  const evScroll = useProgress(evRef);
  const evReveal = pinned !== null ? pinned : range(evScroll, 0.14, 0.76);
  const { afterClip: evAfterClip, seamClip: evSeamClip } = diagonalWipe(evReveal, 2.4);
  /* A hard handoff rather than a long dissolve. The two words share one box, so
     any overlap just stacks them illegibly — they swap at the midpoint instead. */
  const foundOn = 1 - range(evReveal, 0.42, 0.50);
  const fixedOn = range(evReveal, 0.50, 0.58);
  const fixed = evReveal >= 0.5;   // which frame the readout is describing

  const on = (seen: boolean) => (seen ? ' rdg-in' : '');

  return (
    <div className="rdg-root" ref={root}>
      {/* ---------- 1. credential strip ---------------------------------- */}
      <div className="rdg-strip">
        <span>LIC #1042871</span>
        <span>BONDED &amp; INSURED</span>
        <span>25-YR WORKMANSHIP</span>
        <span>EST. 1998</span>
      </div>

      {/* ---------- 2. nav ------------------------------------------------ */}
      <header className="rdg-nav">
        <div className="rdg-nav-in">
          <a className="rdg-nav-mark" href="#rdg-top"><Mark /></a>
          <nav className="rdg-nav-links" aria-label="Ridgeline primary">
            <a href="#rdg-inspection">ROOFING</a>
            <a href="#rdg-evidence">STORM</a>
            <a href="#rdg-process">PROCESS</a>
            <a href="#rdg-file">WORK</a>
            <a href="#rdg-close">CONTACT</a>
          </nav>
          <div className="rdg-nav-act">
            <span className="rdg-nav-tel">24/7 EMERGENCY</span>
            <a className="rdg-btn rdg-btn--solid rdg-btn--sm" href="#rdg-close">
              FREE ESTIMATE <Arrow />
            </a>
          </div>
        </div>
        <div className="rdg-scan" aria-hidden>
          <i style={{ transform: `scaleX(${scroll})` }} />
        </div>
      </header>

      {/* ---------- 3. hero ----------------------------------------------- */}
      <section className={`rdg-hero${on(heroSeen)}`} id="rdg-top" ref={heroRef}>
        <div className="rdg-hero-media">
          <Img
            slug="ridgeline"
            name="hero"
            tall
            alt="Dark shingled residential home with cedar detailing under an overcast sky"
            sizes="100vw"
            className="rdg-hero-img"
            priority
          />
          <div className="rdg-hero-veil" aria-hidden />
          <div className="rdg-tech" aria-hidden>
            <span className="rdg-tech-cross" style={{ left: '18%', top: '24%' }} />
            <span className="rdg-tech-cross" style={{ left: '68%', top: '18%' }} />
            <span className="rdg-tech-cross" style={{ left: '84%', top: '62%' }} />
            <span className="rdg-corner rdg-corner--tl" />
            <span className="rdg-corner rdg-corner--tr" />
            <span className="rdg-corner rdg-corner--bl" />
            <span className="rdg-corner rdg-corner--br" />
          </div>
        </div>

        <div className="rdg-hero-type">
          <p className="rdg-eyebrow">
            <i className="rdg-dot" aria-hidden />
            SEC 01 — RE-ROOF &amp; STORM RESPONSE
          </p>
          <h1 className="rdg-d rdg-h1">
            <span>PROTECT WHAT</span>
            <span>MATTERS MOST.</span>
          </h1>
          <div className="rdg-rule rdg-draw" aria-hidden />
          <p className="rdg-hero-sub">TEAR-OFFS · STORM CLAIMS · 60-MILE RADIUS</p>
          <div className="rdg-btns">
            <a className="rdg-btn rdg-btn--solid" href="#rdg-enquire">FREE ESTIMATE <Arrow /></a>
            <a className="rdg-btn rdg-btn--line" href="#rdg-inspection">BOOK AN INSPECTION <Arrow /></a>
          </div>
        </div>
      </section>

      {/* ---------- hero data band ---------------------------------------- */}
      <div className={`rdg-figs${on(figSeen)}`} ref={figRef}>
        <Figure run={figSeen} value={45} unit="MIN" label="STORM RESPONSE" />
        <Figure run={figSeen} value={4180} unit="RF" label="ROOFS SINCE 1998" />
        <Figure run={figSeen} value={25} unit="YR" label="WORKMANSHIP WARRANTY" />
        <Figure run={figSeen} value={60} unit="MI" label="SERVICE RADIUS" />
      </div>

      {/* ---------- 4. the inspection ------------------------------------- */}
      <section className={`rdg-insp${on(inspSeen)}`} id="rdg-inspection" ref={inspRef}>
        <div className="rdg-shead">
          <span className="rdg-shead-n">SEC 02</span>
          <div className="rdg-shead-b">
            <h2 className="rdg-d rdg-h2">EVERY ROOF TELLS YOU<br />WHERE IT WILL FAIL.</h2>
            <p className="rdg-shead-p">Five points from a real survey. Select one.</p>
          </div>
          <div className="rdg-shead-m">
            <span>FILE</span><b>RR-2417</b>
            <span>SURVEY</span><b>2024-03-11</b>
            <span>SLOPES</span><b>06</b>
            <span>PITCH</span><b>7:12</b>
          </div>
        </div>

        <div className="rdg-insp-grid">
          {/* --- plate with hotspots --- */}
          <div className="rdg-plate" ref={plateRef}>
            <Img
              slug="ridgeline"
              name="roofline"
              alt="Elevated three-quarter view of a dark shingled roof with clean ridge geometry"
              sizes="(max-width: 980px) 100vw, 58vw"
              className="rdg-plate-img"
            />
            <div className="rdg-plate-veil" aria-hidden />
            <div className="rdg-tech rdg-tech--tight" aria-hidden>
              <span className="rdg-corner rdg-corner--tl" />
              <span className="rdg-corner rdg-corner--tr" />
              <span className="rdg-corner rdg-corner--bl" />
              <span className="rdg-corner rdg-corner--br" />
            </div>

            {/* pointer crosshair — instrument feel, transform only */}
            {pt && (
              <div className="rdg-xhair" aria-hidden>
                <i className="rdg-xhair-v" style={{ transform: `translateX(${pt.x * 100}%)` }} />
                <i className="rdg-xhair-h" style={{ transform: `translateY(${pt.y * 100}%)` }} />
                <span className="rdg-xhair-read">
                  X {pt.x.toFixed(3)} &nbsp;/&nbsp; Y {pt.y.toFixed(3)}
                </span>
              </div>
            )}

            <p className="rdg-plate-tag" aria-hidden>N-W ELEVATION / 24 MM</p>

            {POINTS.map((q, i) => (
              <button
                key={q.id}
                type="button"
                className={`rdg-hot rdg-hot--${q.side}${i === active ? ' rdg-act' : ''}`}
                style={{ left: `${q.x}%`, top: `${q.y}%` }}
                aria-pressed={i === active}
                aria-label={`Inspection point ${q.id}, ${q.title}, severity ${q.severity} of 5`}
                onClick={() => setActive(i)}
              >
                <span className="rdg-hot-ring" aria-hidden />
                <span className="rdg-hot-box" aria-hidden>
                  <b>{q.id}</b>
                </span>
                <span className="rdg-hot-tag" aria-hidden>
                  <i>{q.id}</i>{q.title}
                </span>
              </button>
            ))}
          </div>

          {/* --- readout --- */}
          <div className="rdg-read">
            <div className="rdg-read-top">
              <span className="rdg-read-ttl">INSPECTION READOUT</span>
              <span className="rdg-read-pos">POINT {p.id} / 05</span>
            </div>

            <div className="rdg-read-sev">
              <span>SEVERITY</span>
              <span className="rdg-meter" aria-hidden>
                {[1, 2, 3, 4, 5].map((s) => (
                  <i key={s} className={s <= p.severity ? 'rdg-on' : ''} />
                ))}
              </span>
              <b>{p.sevLabel}</b>
            </div>

            <div className="rdg-read-body" key={p.id} aria-live="polite">
              <div className="rdg-read-hd">
                <span className="rdg-read-id">{p.id}</span>
                <h3 className="rdg-d rdg-read-h">{p.title}</h3>
                <p className="rdg-read-zone">{p.zone}</p>
              </div>

              <dl className="rdg-rows">
                <div className="rdg-row">
                  <dt>FINDING</dt>
                  <dd>{p.finding}</dd>
                </div>
              </dl>

              <p className="rdg-spec">{p.spec}</p>

              {scopeOpen && (
                <div className="rdg-scope">
                  <span>SCOPE</span>
                  <p>{p.scope}</p>
                </div>
              )}

              <button
                type="button"
                className="rdg-more"
                aria-expanded={scopeOpen}
                onClick={() => setScopeOpen((v) => !v)}
              >
                <span>{scopeOpen ? 'HIDE SCOPE' : 'SCOPE OF WORK'}</span>
                <i aria-hidden>{scopeOpen ? '–' : '+'}</i>
              </button>
            </div>

            <div className="rdg-read-foot">
              <a className="rdg-btn rdg-btn--line rdg-btn--wide" href="#rdg-close">
                BOOK AN INSPECTION <Arrow />
              </a>
              <p className="rdg-read-fine">SAME-DAY REPORT · NO OBLIGATION</p>
            </div>
          </div>
        </div>

        {/* --- point index: the touch-first control, and a second keyboard path --- */}
        <div className="rdg-index" role="group" aria-label="Inspection point index">
          <span className="rdg-index-l">POINT INDEX</span>
          {POINTS.map((q, i) => (
            <button
              key={q.id}
              type="button"
              className={`rdg-index-b${i === active ? ' rdg-act' : ''}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <i aria-hidden />
              <b>{q.id}</b>
              <em>{q.title}</em>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- 5. found / fixed -------------------------------------- */}
      {/* The same device Sunline uses, in Ridgeline's voice: no soft frame, no
          golden seam — a hard orange edge raking across a survey photograph,
          with the frame data updating underneath as it crosses. */}
      <section className={`rdg-ev${on(evSeen)}`} id="rdg-evidence" ref={evRef}>
        <div className="rdg-ev-sticky">
          <div className="rdg-shead rdg-shead--tight">
            <span className="rdg-shead-n">SEC 03</span>
            <div className="rdg-shead-b">
              <h2 className="rdg-d rdg-h2">FOUND. FIXED.<br />SAME CAMERA POSITION.</h2>
              <p className="rdg-shead-p">Tripod left in place between visits. Nothing re-framed.</p>
            </div>
            <div className="rdg-ev-ctrl" role="group" aria-label="Evidence frame">
              <button
                type="button"
                className={`rdg-swap${pinned === 0 ? ' rdg-act' : ''}`}
                aria-pressed={pinned === 0}
                onClick={() => setPinned(pinned === 0 ? null : 0)}
              >
                FOUND
              </button>
              <button
                type="button"
                className={`rdg-swap${pinned === 1 ? ' rdg-act' : ''}`}
                aria-pressed={pinned === 1}
                onClick={() => setPinned(pinned === 1 ? null : 1)}
              >
                FIXED
              </button>
            </div>
          </div>

          <div className="rdg-ev-stage">
            {/* both plates fill the same box — only the clip moves */}
            <div className="rdg-ev-layer">
              <Img
                slug="ridgeline"
                name="beforeproject"
                tall
                alt="A tired hillside house before work: worn, patchy roof and faded ridge line"
                sizes="100vw"
                className="rdg-ev-img"
              />
            </div>
            <div
              className="rdg-ev-layer rdg-ev-after"
              style={{ clipPath: evAfterClip, WebkitClipPath: evAfterClip }}
            >
              <Img
                slug="ridgeline"
                name="afterproject"
                tall
                alt="The same house from the same position, completely re-roofed in dark architectural shingle"
                sizes="100vw"
                className="rdg-ev-img"
              />
            </div>
            <div
              className="rdg-ev-seam"
              aria-hidden
              style={{ clipPath: evSeamClip, WebkitClipPath: evSeamClip }}
            />

            <div className="rdg-tech rdg-tech--tight" aria-hidden>
              <span className="rdg-corner rdg-corner--tl" />
              <span className="rdg-corner rdg-corner--tr" />
              <span className="rdg-corner rdg-corner--bl" />
              <span className="rdg-corner rdg-corner--br" />
            </div>

            <div className="rdg-ev-badge" aria-hidden>
              <span className="rdg-ev-word" style={{ opacity: foundOn, transform: `translate3d(0,${mix(-14, 0, foundOn).toFixed(1)}px,0)` }}>
                <b>FOUND</b><span>FRAME A</span>
              </span>
              <span className="rdg-ev-word" style={{ opacity: fixedOn, transform: `translate3d(0,${mix(14, 0, fixedOn).toFixed(1)}px,0)` }}>
                <b>FIXED</b><span>FRAME B</span>
              </span>
            </div>
          </div>

          <div className="rdg-ev-data">
            <div><span>FRAME</span><b>{fixed ? 'B — POST-REPAIR' : 'A — SURVEY'}</b></div>
            <div><span>DATE</span><b>{fixed ? '2024-03-19' : '2024-03-11'}</b></div>
            <div><span>CAMERA</span><b>TRIPOD / 24 MM / 1.6 M</b></div>
            <div><span>SHIFT</span><b>0.0 PX</b></div>
            <div><span>SCOPE</span><b>FULL TEAR-OFF · 34 SQ · RIDGE VENT</b></div>
          </div>
        </div>
      </section>


      <div className="rdg-prompt">
        <p>SAME ROOF, TWELVE DAYS APART. YOURS COULD BE THE NEXT ONE.</p>
        <a className="rdg-btn rdg-btn--solid rdg-btn--sm" href="#rdg-enquire">FREE ESTIMATE <Arrow /></a>
      </div>
      {/* ---------- 5b. services ------------------------------------------ */}
      <section className={`rdg-svc${on(svcSeen)}`} id="rdg-services" ref={svcRef}>
        <div className="rdg-shead">
          <span className="rdg-shead-n">SEC 04</span>
          <div className="rdg-shead-b">
            <h2 className="rdg-d rdg-h2">WHAT WE DO</h2>
            <p className="rdg-shead-p">Five scopes. Fixed crews. No subcontracted roofs.</p>
          </div>
          <a href="#rdg-enquire" className="rdg-btn rdg-btn--solid rdg-btn--sm">
            FREE ESTIMATE <span className="rdg-arw">→</span>
          </a>
        </div>

        <ul className="rdg-svc-list">
          {SERVICES.map((sv) => (
            <li key={sv.n} className="rdg-svc-row">
              <span className="rdg-svc-n">{sv.n}</span>
              <span className="rdg-svc-shot">
                <Img
                  slug="ridgeline"
                  name={sv.shot}
                  alt={sv.alt}
                  sizes="(max-width: 720px) 100vw, 190px"
                  className="rdg-svc-img"
                />
              </span>
              <div className="rdg-svc-main">
                <h3 className="rdg-svc-t">{sv.title}</h3>
                <p className="rdg-svc-b">{sv.body}</p>
              </div>
              <span className="rdg-svc-scope">{sv.scope}</span>
            </li>
          ))}
        </ul>
      </section>


      <div className="rdg-prompt">
        <p>FIVE SCOPES, ONE CREW, NO SUBCONTRACTED ROOFS.</p>
        <a className="rdg-btn rdg-btn--solid rdg-btn--sm" href="#rdg-enquire">GET A NUMBER <Arrow /></a>
      </div>
      {/* ---------- 6. process ------------------------------------------- */}
      <section className={`rdg-proc${on(procSeen)}`} id="rdg-process" ref={procRef}>
        <div className="rdg-proc-top">
          <div className="rdg-proc-intro">
            <span className="rdg-shead-n">SEC 04</span>
            <h2 className="rdg-d rdg-h2">FIVE STAGES.<br />NOTHING SKIPPED.</h2>
            <p className="rdg-shead-p">Same sequence on a flashing repair as on a full tear-off.</p>
            <div className="rdg-rule rdg-draw" aria-hidden />
          </div>
          <figure className="rdg-proc-fig">
            <Img
              slug="ridgeline"
              name="crew"
              alt="Two roofers in harnesses and hi-vis reviewing an inspection report on a roof"
              sizes="(max-width: 980px) 100vw, 46vw"
              className="rdg-proc-img"
            />
            <figcaption>CREW 04 · TWO-PERSON MINIMUM · OSHA 30</figcaption>
          </figure>
        </div>

        <ol className="rdg-steps">
          {PROCESS.map((s) => (
            <li className="rdg-step" key={s.n}>
              <span className="rdg-step-n">{s.n}</span>
              <h3 className="rdg-d rdg-step-t">{s.t}</h3>
              <p className="rdg-step-s">{s.spec}</p>
            </li>
          ))}
        </ol>

        <div className="rdg-mat">
          <figure className="rdg-mat-fig">
            <Img
              slug="ridgeline"
              name="shingle"
              alt="Macro of architectural shingle courses meeting a folded metal drip edge"
              sizes="100vw"
              className="rdg-mat-img"
            />
            <figcaption>ARCHITECTURAL LAMINATE · 130 MPH · CLASS 4 · 26 GA DRIP EDGE</figcaption>
          </figure>
        </div>
      </section>

      {/* ---------- 7. job file plate ------------------------------------- */}
      <section className={`rdg-file${on(fileSeen)}`} id="rdg-file" ref={fileRef}>
        <div className="rdg-file-media">
          <Img
            slug="ridgeline"
            name="project"
            alt="Completed re-roof in graphite shingles with a new metal valley"
            sizes="100vw"
            className="rdg-file-img"
          />
          <div className="rdg-file-veil" aria-hidden />
          <span className="rdg-file-id" aria-hidden>JOB FILE RR-2291</span>
        </div>
        <div className="rdg-file-cap">
          <h3 className="rdg-d rdg-file-h">FULL TEAR-OFF,<br />TWO STOREY, 7:12.</h3>
          <div className="rdg-file-tbl">
            <div><span>SCOPE</span><b>TO DECK · 8 SHEETS REPLACED</b></div>
            <div><span>AREA</span><b>34 SQ / 3,400 SQ FT</b></div>
            <div><span>DURATION</span><b>2 WORKING DAYS</b></div>
            <div><span>WARRANTY</span><b>25-YR, TRANSFERABLE</b></div>
          </div>
        </div>
      </section>


      <div className="rdg-prompt">
        <p>EVERY ESTIMATE IS ITEMISED AND FIXED BEFORE WE START.</p>
        <a className="rdg-btn rdg-btn--solid rdg-btn--sm" href="#rdg-enquire">FREE ESTIMATE <Arrow /></a>
      </div>
      {/* ---------- 7b. questions ----------------------------------------- */}
      <section className={`rdg-faq${on(faqSeen)}`} id="rdg-faq" ref={faqRef}>
        <div className="rdg-shead">
          <span className="rdg-shead-n">SEC 07</span>
          <div className="rdg-shead-b">
            <h2 className="rdg-d rdg-h2">STRAIGHT ANSWERS</h2>
            <p className="rdg-shead-p">The five we get asked on every driveway.</p>
          </div>
        </div>

        <div className="rdg-faq-list">
          {FAQS.map((f, i2) => {
            const isOpen = openQ === i2;
            return (
              <div key={f.q} className={`rdg-faq-row${isOpen ? ' rdg-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    className="rdg-faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`rdg-faq-a-${i2}`}
                    onClick={() => setOpenQ(isOpen ? null : i2)}
                  >
                    <span className="rdg-faq-n">{String(i2 + 1).padStart(2, '0')}</span>
                    <span className="rdg-faq-qt">{f.q}</span>
                    <span className="rdg-faq-ico" aria-hidden>{isOpen ? '−' : '+'}</span>
                  </button>
                </h3>
                <div className="rdg-faq-a" id={`rdg-faq-a-${i2}`} hidden={!isOpen}>
                  <p>{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      <div className="rdg-prompt">
        <p>STILL DECIDING? THE INSPECTION IS FREE EITHER WAY.</p>
        <a className="rdg-btn rdg-btn--solid rdg-btn--sm" href="#rdg-enquire">BOOK AN INSPECTION <Arrow /></a>
      </div>
      {/* ---------- 8. close ---------------------------------------------- */}
      <section className={`rdg-close${on(closeSeen)}`} id="rdg-close" ref={closeRef}>
        <div className="rdg-close-in">
          <p className="rdg-eyebrow"><i className="rdg-dot" aria-hidden />SEC 05 — NEXT STEP</p>
          <h2 className="rdg-d rdg-h2 rdg-close-h">READY WHEN<br />THE WEATHER ISN&rsquo;T.</h2>
          <div className="rdg-rule rdg-draw" aria-hidden />
          <p className="rdg-close-p">FREE, FIXED, ITEMISED. STORM RESPONSE IN 45 MINUTES OR LESS.</p>
          <div className="rdg-btns">
            <a className="rdg-btn rdg-btn--solid" href="#rdg-close">FREE ESTIMATE <Arrow /></a>
            <a className="rdg-btn rdg-btn--line" href="#rdg-inspection">BOOK AN INSPECTION <Arrow /></a>
          </div>
        </div>

        <div className="rdg-enquire" id="rdg-enquire">
          <div className="rdg-enquire-head">
            <span className="rdg-shead-n">SEC 06</span>
            <div>
              <h3 className="rdg-d rdg-enquire-h">GET AN ESTIMATE</h3>
              <p className="rdg-enquire-p">
                Itemised, fixed, and yours to keep. Storm damage gets a response in 45 minutes or less.
              </p>
            </div>
          </div>
          <DemoForm
            prefix="rdg"
            options={['Re-roof', 'Storm response', 'Repair & leak tracing', 'Gutter & flashing', 'Inspection only', 'Not sure yet']}
            labels={{ interest: 'What do you need', message: 'What is happening', submit: 'Request estimate' }}
            messageHint="Roof age if you know it, where the leak shows, and whether an adjuster is already involved."
          />
        </div>

        <div className="rdg-foot">
          <div className="rdg-foot-a">
            <Mark />
            <p>LIC #1042871 · BONDED &amp; INSURED · EST. 1998</p>
          </div>
          <div className="rdg-foot-b">
            <span className="rdg-badge">CONCEPT BUILD</span>
          </div>
          <p className="rdg-foot-c">
            Ridgeline Roofing is a fictional business built to demonstrate this
            studio&rsquo;s work. Figures and job files are illustrative.
          </p>
        </div>
      </section>
    </div>
  );
}
