'use client';

import { useEffect, useRef, useState } from 'react';
import { Img, useProgress, useSeen, range, mix, clamp01 } from './kit';
import DemoForm from './DemoForm';

/* ============================================================
   SUNLINE POOLS — concept build

   Not a pool company website. An architectural monograph that
   happens to be about water: enormous pictures, almost no words,
   a serif at magazine scale, and motion that moves the way water
   does — long, weighted, never snappy.

   The spine of the page is a single idea: the same ground, before
   and after. Section 04 holds a 100vh sticky stage where a matched
   pair (identical camera, identical crop) is wiped one over the
   other by scroll position. Everything above it is setup and
   everything below it is proof.

   All motion is transform / opacity / clip-path only, and every
   drift is neutralised under prefers-reduced-motion — in the hooks
   below and again in sunline.css.
   ============================================================ */

/* ---------- local motion hooks ------------------------------
   The concept renders inside a scrolling panel rather than the
   document, so anything that reads scroll has to find the real
   scroller first — the same move the kit's useProgress makes. */

function findScroller(el: HTMLElement): HTMLElement | Window {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const o = getComputedStyle(node).overflowY;
    if (o === 'auto' || o === 'scroll') return node;
    node = node.parentElement;
  }
  return window;
}

/** 0→1 as the element crosses the viewport bottom to top.
 *  Parked at 0.5 (= zero drift) under reduced motion. */
function useTravel<T extends HTMLElement>(ref: React.RefObject<T>) {
  const [t, setT] = useState(0.5);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = window.innerHeight + r.height;
      setT(clamp01((window.innerHeight - r.top) / span));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    const scroller = findScroller(el);
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    read();
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);

  return t;
}

/** True once the marker has travelled up past the top edge. */
function usePast<T extends HTMLElement>(ref: React.RefObject<T>) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setPast(!e.isIntersecting && e.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return past;
}

/* ---------- a photograph that drifts ------------------------ */

function Drift({
  name,
  alt,
  sizes,
  className = '',
  amount = 3,
}: {
  name: string;
  alt: string;
  sizes: string;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTravel(ref);
  const y = mix(-amount, amount, t);

  return (
    <div ref={ref} className={`sun-drift ${className}`}>
      <Img
        slug="sunline"
        name={name}
        tall
        alt={alt}
        sizes={sizes}
        className="sun-drift-img"
        style={{ transform: `translate3d(0, ${y.toFixed(2)}%, 0)` }}
      />
    </div>
  );
}

/* ---------- the build --------------------------------------- */

/* Five scopes, written the way the studio talks: what gets built, not what the
   client will "experience". The register here is quiet and declarative — this
   build's whole personality is restraint, and a benefits list would shout. */
const SCOPES: Array<{ n: string; title: string; body: string }> = [
  { n: '01', title: 'Pools & spas', body: 'Gunite shells, dark plaster, vanishing edges and raised spas — engineered for the grade the garden actually sits on.' },
  { n: '02', title: 'Terraces & decking', body: 'Travertine, limestone and ipe, laid on a proper base so the surface is still level in ten summers.' },
  { n: '03', title: 'Outdoor kitchens', body: 'Built-in grill runs, stone counters and shaded seating, plumbed and wired as part of the build rather than added after.' },
  { n: '04', title: 'Planting & shade', body: 'Mature olive, citrus and native grasses, with pergolas and screens placed for the light the garden gets in August.' },
  { n: '05', title: 'Lighting & water', body: 'Low-voltage schemes, fire features and water walls, designed for the hour everyone actually uses the garden.' },
];

const ASKED: Array<{ q: string; a: string }> = [
  { q: 'How long does a backyard take?', a: 'Design and permits run eight to twelve weeks before anything is dug. Construction is another twelve to twenty, depending on the pool and the grade. We will not start a dig we cannot finish.' },
  { q: 'Do you handle permits and engineering?', a: 'Yes, all of it — soils report, structural calcs, city submittal and inspections. You sign; we file.' },
  { q: 'Can you work with my existing pool?', a: 'Often. Re-plaster, new coping, new decking and new equipment can change a garden completely without touching the shell.' },
  { q: 'What does a design cost?', a: 'A full design package — survey, plan, elevations, materials and a fixed construction quote — is $4,800, credited against the build if you go ahead with us.' },
  { q: 'Do you build outside San Diego and LA?', a: 'We build between Santa Barbara and the border. Further than that and we cannot supervise the site properly, so we say no rather than do it badly.' },
];

/* SUNLINE HOUSE — Palm Springs.

   Six camera positions generated off one fixed description of a single place,
   which is why they hang together as a project rather than as six pool photos.

   No before/after here on purpose. The transformation section higher up the
   page already runs a matched pair, and its finished frame reads as the same
   property as this one — flat roof, rectangular pool, travertine, olives, same
   sun. Two before/afters that look like one house is worse than one. */
const HOUSE_PLATES: Array<{ name: string; title: string; optic: string; alt: string }> = [
  { name: 'hsskim', title: 'Along the water', optic: '50mm · f/5.6 · 0.35 m',
    alt: 'Looking down the length of the pool toward the raised spa, camera just above the water' },
  { name: 'hsspa', title: 'The weir', optic: '85mm · f/4 · 0.65 m',
    alt: 'The spa spillover: honed travertine lip, sheet of water, dark plaster below' },
  { name: 'hspavilion', title: 'Pavilion terrace', optic: '35mm · f/5.6 · 1.6 m',
    alt: 'Travertine terrace and pool seen past the pavilion, olive trees and low hills beyond' },
  { name: 'hsgrove', title: 'Olive court', optic: '35mm · f/5.6 · 1.6 m',
    alt: 'A single mature olive in a gravel court between plaster wall and timber soffit' },
];

export default function Sunline() {
  /* nav */
  const sentinel = useRef<HTMLDivElement>(null);
  const scrolled = usePast(sentinel);

  /* hero */
  const heroRef = useRef<HTMLDivElement>(null);
  const heroT = useTravel(heroRef);
  const heroY = mix(0, 7, heroT);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setLit(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  /* quiet type moment */
  const quietRef = useRef<HTMLDivElement>(null);
  const quietSeen = useSeen(quietRef);

  /* the transformation — the tall outer section owns the progress */
  const tfRef = useRef<HTMLDivElement>(null);
  const p = useProgress(tfRef);

  const reveal = range(p, 0.14, 0.76);
  const edge = mix(-8, 108, reveal);   // leading edge, % of the stage width
  const edgeTop = edge + 3.2;          // the wipe leans, so the two images
  const edgeBot = edge - 3.2;          // meet on a slow diagonal, not a bar

  const afterClip =
    `polygon(0% 0%, ${edgeTop.toFixed(2)}% 0%, ${edgeBot.toFixed(2)}% 100%, 0% 100%)`;
  const seamClip =
    `polygon(calc(${edgeTop.toFixed(2)}% - 1px) 0%, calc(${edgeTop.toFixed(2)}% + 1px) 0%, ` +
    `calc(${edgeBot.toFixed(2)}% + 1px) 100%, calc(${edgeBot.toFixed(2)}% - 1px) 100%)`;

  const seamOn = Math.min(range(p, 0.14, 0.21), 1 - range(p, 0.72, 0.79));
  const beforeOn = 1 - range(p, 0.30, 0.46);
  const afterOn = range(p, 0.48, 0.64);
  const lineOn = Math.min(range(p, 0.34, 0.47), 1 - range(p, 0.60, 0.73));
  const specOn = range(p, 0.80, 0.93);
  const frameScale = mix(1.05, 1, range(p, 0, 0.4));
  const frameY = mix(-1.4, 1.4, p);

  /* close */
  const scopeRef = useRef<HTMLDivElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);
  const askRef = useRef<HTMLDivElement>(null);
  const [openQ, setOpenQ] = useState<number | null>(0);
  const closeRef = useRef<HTMLDivElement>(null);
  const scopeSeen = useSeen(scopeRef);
  const houseSeen = useSeen(houseRef);
  const askSeen = useSeen(askRef);
  const closeSeen = useSeen(closeRef);

  return (
    <div className="sun-root">
      {/* ---------- 01 · nav ---------- */}
      <header className={`sun-nav${scrolled ? ' sun-nav--solid' : ''}`}>
        <a className="sun-mark" href="#sun-top" aria-label="Sunline Pools, top of page">
          <svg className="sun-mark-glyph" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="25" r="10.5" />
            <path d="M3 45h58" />
            <path d="M15 54h34" />
          </svg>
          <span className="sun-mark-word">SUNLINE</span>
        </a>

        <nav className="sun-nav-links" aria-label="Sunline sections">
          <a href="#sun-scope">WHAT WE BUILD</a>
          <a href="#sun-projects">PROJECTS</a>
          <a href="#sun-house">SUNLINE HOUSE</a>
          <a href="#sun-process">PROCESS</a>
          <a href="#sun-studio">STUDIO</a>
          <a href="#sun-contact">CONTACT</a>
        </nav>

        <a className="sun-navcta" href="#sun-enquire">
          <span>DESIGN YOUR BACKYARD</span>
          <i className="sun-arrow" aria-hidden="true">→</i>
        </a>
      </header>

      {/* ---------- 02 · hero ---------- */}
      <section className="sun-hero" id="sun-top" ref={heroRef}>
        <div className="sun-hero-media">
          <Img
            slug="sunline"
            name="hero"
            tall
            alt="Infinity-edge pool at golden hour beside a low California-modern house, ocean beyond"
            sizes="100vw"
            priority
            className="sun-hero-img"
            style={{ transform: `translate3d(0, ${heroY.toFixed(2)}%, 0)` }}
          />
        </div>
        <div className="sun-hero-veil" aria-hidden="true" />

        <div className={`sun-hero-type${lit ? ' sun-lit' : ''}`}>
          <p className="sun-kicker">Sunline Pools — Southern California</p>
          <h1 className="sun-display sun-hero-h">
            <span className="sun-mask"><span>YOUR BACKYARD.</span></span>
            <span className="sun-mask"><span>REIMAGINED.</span></span>
          </h1>

          <div className="sun-hero-acts">
            <a className="sun-btn sun-hero-btn" href="#sun-enquire">
              <span>BOOK A SITE WALK</span>
              <i className="sun-arrow" aria-hidden="true">→</i>
            </a>
            <a className="sun-hero-link" href="#sun-house">
              <span>See a project</span>
              <i className="sun-arrow" aria-hidden="true">→</i>
            </a>
          </div>
          <p className="sun-hero-re">Free, on your ground, nothing to sign.</p>
        </div>

        <div className={`sun-cue${lit ? ' sun-lit' : ''}`} aria-hidden="true">
          <span className="sun-cue-word">Scroll</span>
          <span className="sun-cue-rail"><i /></span>
        </div>

        <div className="sun-sentinel" ref={sentinel} aria-hidden="true" />
      </section>

      {/* ---------- 03 · a quiet type moment ---------- */}
      <section className="sun-quiet" id="sun-studio" ref={quietRef}>
        <p className={`sun-index sun-fade${quietSeen ? ' sun-in' : ''}`}>01 — Philosophy</p>

        <h2
          className={`sun-display sun-quiet-h sun-fade${quietSeen ? ' sun-in' : ''}`}
          style={{ transitionDelay: '140ms' }}
        >
          BUILT AROUND
          <br />
          <em>THE WAY YOU LIVE.</em>
        </h2>

        <div
          className={`sun-quiet-note sun-fade${quietSeen ? ' sun-in' : ''}`}
          style={{ transitionDelay: '380ms' }}
        >
          <p>
            Most pool companies begin by drawing a pool. We begin by asking how you want to
            live in the garden, then design the water around your answer.
          </p>
        </div>

        <p
          className={`sun-quiet-meta sun-fade${quietSeen ? ' sun-in' : ''}`}
          style={{ transitionDelay: '520ms' }}
        >
          Sunline Studio · Del Mar &amp; Los Angeles · design–build since 2009
        </p>
      </section>

      {/* ---------- 04 · the transformation ---------- */}
      <section className="sun-transform" ref={tfRef} aria-label="One backyard, before and after">
        <div className="sun-tf-stage">
          <div
            className="sun-tf-frame"
            style={{
              transform: `translate3d(0, ${frameY.toFixed(2)}%, 0) scale(${frameScale.toFixed(4)})`,
            }}
          >
            {/* the two plates are stacked at identical size — only the clip moves */}
            <div className="sun-tf-layer">
              <Img
                slug="sunline"
                name="before"
                tall
                alt="The Portola Residence backyard before work: dry lawn, bare concrete slab, flat overcast light"
                sizes="100vw"
                className="sun-tf-img"
              />
            </div>

            <div
              className="sun-tf-layer sun-tf-after"
              style={{ clipPath: afterClip, WebkitClipPath: afterClip }}
            >
              <Img
                slug="sunline"
                name="after"
                tall
                alt="The same backyard completed: dark-plaster pool at golden hour, travertine deck, olive trees"
                sizes="100vw"
                className="sun-tf-img"
              />
            </div>

            <div
              className="sun-tf-seam"
              aria-hidden="true"
              style={{ clipPath: seamClip, WebkitClipPath: seamClip, opacity: seamOn }}
            />
          </div>

          <div className="sun-tf-veil" aria-hidden="true" />

          <div className="sun-tf-ui">
            <div className="sun-tf-top">
              <div className="sun-tf-swap" aria-hidden="true">
                <span
                  className="sun-tf-word"
                  style={{
                    opacity: beforeOn,
                    transform: `translate3d(0, ${mix(-16, 0, beforeOn).toFixed(1)}px, 0)`,
                  }}
                >
                  BEFORE
                </span>
                <span
                  className="sun-tf-word"
                  style={{
                    opacity: afterOn,
                    transform: `translate3d(0, ${mix(16, 0, afterOn).toFixed(1)}px, 0)`,
                  }}
                >
                  AFTER
                </span>
              </div>

              <p className="sun-tf-place">
                Portola Residence
                <span>Rancho Santa Fe · 2024</span>
              </p>
            </div>

            <p
              className="sun-display sun-tf-line"
              style={{
                opacity: lineOn,
                transform: `translate3d(0, ${mix(18, 0, lineOn).toFixed(1)}px, 0)`,
                filter: `blur(${mix(9, 0, lineOn).toFixed(2)}px)`,
              }}
            >
              The same ground, <em>one season later.</em>
            </p>

            <div className="sun-tf-bottom">
              <div className="sun-tf-rule">
                <span className="sun-tf-fill" style={{ transform: `scaleX(${reveal.toFixed(4)})` }} />
              </div>
              <div className="sun-tf-ends">
                <span style={{ opacity: mix(1, 0.4, reveal) }}>Existing grade</span>
                <span style={{ opacity: mix(0.4, 1, reveal) }}>Completed</span>
              </div>
              <p
                className="sun-tf-spec"
                style={{
                  opacity: specOn,
                  transform: `translate3d(0, ${mix(10, 0, specOn).toFixed(1)}px, 0)`,
                }}
              >
                42 × 16 ft · dark plaster · limestone coping · zero-edge spillway · eleven months
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="sun-prompt">
        <p className="sun-prompt-p">Your garden has a version of this in it. We start by coming to look at it.</p>
        <a className="sun-prompt-a" href="#sun-enquire">
          <span>Book a site walk</span><i className="sun-arrow" aria-hidden="true">→</i>
        </a>
      </div>

      {/* ---------- 04b · what we build ---------- */}
      <section className="sun-scope" id="sun-scope" ref={scopeRef}>
        <div className={`sun-scope-head sun-fade${scopeSeen ? ' sun-in' : ''}`}>
          <span className="sun-kicker">Start here</span>
          <h2 className="sun-display sun-scope-h">
            BEGIN WITH THE VIEW
            <br />
            <em>YOU ALREADY HAVE.</em>
          </h2>
          <p className="sun-scope-intro">
            Every project starts the same way: we stand in your garden and talk about what it
            could be. No renderings, no pressure, no charge.
          </p>
        </div>

        <ul className="sun-scope-list">
          {SCOPES.map((sc, i2) => (
            <li
              key={sc.n}
              className={`sun-scope-row sun-fade${scopeSeen ? ' sun-in' : ''}`}
              style={{ transitionDelay: `${120 + i2 * 90}ms` }}
            >
              <span className="sun-scope-n">{sc.n}</span>
              <div className="sun-scope-body">
                <h3 className="sun-scope-t">{sc.title}</h3>
                <p className="sun-scope-p">{sc.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <a className={`sun-btn sun-scope-cta sun-fade${scopeSeen ? ' sun-in' : ''}`} href="#sun-contact">
          <span>DESIGN YOUR BACKYARD</span>
          <i className="sun-arrow" aria-hidden="true">→</i>
        </a>
      </section>

      {/* ---------- 05 · SUNLINE HOUSE — lead project, in full ---------- */}
      <section className="sun-house" id="sun-house" ref={houseRef}>
        <div className={`sun-house-head sun-fade${houseSeen ? ' sun-in' : ''}`}>
          <span className="sun-kicker">Project 01 — in full</span>
          <h2 className="sun-display sun-house-h">SUNLINE HOUSE</h2>
          <p className="sun-house-meta">Palm Springs · 2026</p>
          <p className="sun-house-spec">
            Dark plaster 12 × 5 m · Navona travertine coping · ipe promenade · clear-grain cedar
            boundary · three mature olive
          </p>
          <p className="sun-house-lede">
            A 1970s ranch on a dry lot, taken back to the ground. The house that replaced it is
            single-storey and flat-roofed, and everything in the garden runs parallel to it — pool,
            deck, fence line, planting — so the whole site reads as one long horizontal.
          </p>
        </div>

        <figure className={`sun-house-hero sun-fade${houseSeen ? ' sun-in' : ''}`} style={{ transitionDelay: '140ms' }}>
          <Drift
            className="sun-house-frame sun-house-frame--wide"
            name="hswide"
            alt="Wide establishing view of Sunline House: pale plaster house left, long dark pool, olive trees right, low sun"
            sizes="100vw"
            amount={3.2}
          />
          <figcaption className="sun-house-cap"><b>Wide establishing</b><span>35mm · f/5.6 · eye level</span></figcaption>
        </figure>

        <div className="sun-house-grid">
          {HOUSE_PLATES.map((pl, i) => (
            <figure
              key={pl.name}
              className={`sun-house-plate sun-fade${houseSeen ? ' sun-in' : ''}`}
              style={{ transitionDelay: `${200 + i * 80}ms` }}
            >
              <Drift name={pl.name} alt={pl.alt} sizes="(max-width: 900px) 100vw, 46vw" className="sun-house-frame" amount={2.2} />
              <figcaption className="sun-house-cap">
                <b>{pl.title}</b>
                <span>{pl.optic}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <figure className={`sun-house-plan sun-fade${houseSeen ? ' sun-in' : ''}`} style={{ transitionDelay: '300ms' }}>
          <Drift
            className="sun-house-frame sun-house-frame--wide"
            name="hsdrone"
            alt="Overhead drone view square to the pool, showing deck, spa, planting and boundary on all sides"
            sizes="(max-width: 900px) 100vw, 84vw"
            amount={2}
          />
          <figcaption className="sun-house-cap"><b>Nadir</b><span>28mm · f/8 · 18 m</span></figcaption>
        </figure>

      <div className="sun-prompt">
        <p className="sun-prompt-p">Palm Springs started as a dry lot and a phone call.</p>
        <a className="sun-prompt-a" href="#sun-enquire">
          <span>Start yours</span><i className="sun-arrow" aria-hidden="true">→</i>
        </a>
      </div>
      </section>

      {/* ---------- 05b · further projects ---------- */}
      <section className="sun-plate sun-plate--bleed" id="sun-projects">
        <Drift
          className="sun-bleed-frame"
          name="aerial"
          alt="Overhead view of a rectangular dark-bottom pool with loungers and long afternoon shadows"
          sizes="100vw"
          amount={3.6}
        />
        <div className="sun-plate-veil" aria-hidden="true" />
        <figure className="sun-cap sun-cap--over">
          <span className="sun-cap-num">02</span>
          <h3 className="sun-display sun-cap-name">Cortina House</h3>
          <figcaption className="sun-cap-meta">Rancho Mirage · 2023</figcaption>
          <p className="sun-cap-spec">Dark plaster · sandblasted limestone · 48 ft lap</p>
        </figure>
      </section>

      <section className="sun-plate sun-plate--inset">
        <figure className="sun-cap sun-cap--rail">
          <span className="sun-cap-num">03</span>
          <h3 className="sun-display sun-cap-name">Alcorn House</h3>
          <figcaption className="sun-cap-meta">Montecito · 2024</figcaption>
          <p className="sun-cap-spec">Board-formed concrete · linear fire trough · 38 ft</p>
        </figure>
        <Drift
          className="sun-inset-frame"
          name="firepit"
          alt="Outdoor living room at dusk with a linear fire feature reflected in the pool"
          sizes="(max-width: 760px) 100vw, 60vw"
          amount={2.6}
        />
      </section>

      <section className="sun-plate sun-plate--offset">
        <Drift
          className="sun-offset-frame"
          name="terrace"
          alt="Shaded pergola terrace in white oak with linen furnishings at the pool edge"
          sizes="(max-width: 760px) 100vw, 76vw"
          amount={3}
        />
        <figure className="sun-cap sun-cap--margin">
          <span className="sun-cap-num">04</span>
          <h3 className="sun-display sun-cap-name">Cardiff Terrace</h3>
          <figcaption className="sun-cap-meta">Cardiff-by-the-Sea · 2025</figcaption>
          <p className="sun-cap-spec">White oak pergola · honed travertine · 34 ft</p>
        </figure>
      </section>

      {/* ---------- 06 · close ---------- */}
      {/* This was a headline, two buttons and 290px of empty bone. The words
          were doing all the work and there was nothing for a visitor who had
          decided to actually answer the question. It now carries the three
          steps and the three facts people ask for before they call — which is
          also why it no longer needs half a screen of padding to feel
          composed. */}
      <section className="sun-close" id="sun-contact" ref={closeRef}>
        <div className={`sun-close-body sun-fade${closeSeen ? ' sun-in' : ''}`}>
          <span className="sun-kicker">What happens next</span>
          <h2 className="sun-display sun-close-h">
            THREE STEPS,
            <br />
            <em>THEN A NUMBER.</em>
          </h2>
          <p className="sun-close-lede">
            Nothing is guessed at and nothing moves once you have the quote. Here is the whole
            of it, start to handover.
          </p>
        </div>

        <ol id="sun-process" className={`sun-close-steps sun-fade${closeSeen ? ' sun-in' : ''}`} style={{ transitionDelay: '180ms' }}>
          <li>
            <span className="sun-close-n">01</span>
            <h3>Walk the site</h3>
            <p>Ninety minutes on your ground. We look at grade, sun, drainage and the view you
              already have, and tell you what we would do with it.</p>
          </li>
          <li>
            <span className="sun-close-n">02</span>
            <h3>Design package</h3>
            <p>Survey, plan, elevations, materials and a fixed construction quote. Yours to build
              with anyone — though most people stay.</p>
          </li>
          <li>
            <span className="sun-close-n">03</span>
            <h3>Build</h3>
            <p>One studio, one crew, one contract. We engineer it, permit it and build it, and the
              number does not move once you have it.</p>
          </li>
        </ol>

        <div className={`sun-actions sun-fade${closeSeen ? ' sun-in' : ''}`} style={{ transitionDelay: '300ms' }}>
          <a className="sun-btn" href="#sun-enquire">
            <span>DESIGN YOUR BACKYARD</span>
            <i className="sun-arrow" aria-hidden="true">→</i>
          </a>
          <a className="sun-link" href="#sun-projects">
            <span>VIEW OUR PROJECTS</span>
            <i className="sun-arrow" aria-hidden="true">→</i>
          </a>
        </div>


        <div className={`sun-enquire sun-fade${closeSeen ? ' sun-in' : ''}`} id="sun-enquire" style={{ transitionDelay: '480ms' }}>
          <div className="sun-enquire-head">
            <span className="sun-kicker">Book the walk</span>
            <h3 className="sun-enquire-h">Tell us where the garden is.</h3>
            <p className="sun-enquire-p">
              We reply within a working day, usually with two or three times we could come out.
            </p>
          </div>
          <DemoForm
            prefix="sun"
            options={['Pools & spas', 'Terraces & decking', 'Outdoor kitchens', 'Planting & shade', 'Lighting & water', 'A whole garden']}
            labels={{ interest: 'What are you thinking about', message: 'Add a note', submit: 'Book my site walk' }}
            messageHint="Rough size, what is there now, and what you would like to be able to do out there."
            interestAs="chips"
            layout="stacked"
            collapseMessage
            reassure="We reply within one working day with two or three times we could come out. The walk is free and there is nothing to sign."
          />
        </div>
      </section>

      {/* ---------- 07 · asked ---------- */}
      <section className="sun-ask" id="sun-ask" ref={askRef}>
        <div className={`sun-ask-head sun-fade${askSeen ? ' sun-in' : ''}`}>
          <span className="sun-kicker">BEFORE YOU ASK</span>
          <h2 className="sun-display sun-ask-h">THE FIVE<br /><em>WE ALWAYS GET.</em></h2>
        </div>

        <div className={`sun-ask-list sun-fade${askSeen ? ' sun-in' : ''}`} style={{ transitionDelay: '160ms' }}>
          {ASKED.map((f, i2) => {
            const isOpen = openQ === i2;
            return (
              <div key={f.q} className={`sun-ask-row${isOpen ? ' sun-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    className="sun-ask-q"
                    aria-expanded={isOpen}
                    aria-controls={`sun-ask-a-${i2}`}
                    onClick={() => setOpenQ(isOpen ? null : i2)}
                  >
                    <span>{f.q}</span>
                    <i className="sun-ask-ico" aria-hidden>{isOpen ? '–' : '+'}</i>
                  </button>
                </h3>
                <div className="sun-ask-a" id={`sun-ask-a-${i2}`} hidden={!isOpen}>
                  <p>{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>

      <div className="sun-prompt">
        <p className="sun-prompt-p">Still deciding? The site walk is free and there is nothing to sign.</p>
        <a className="sun-prompt-a" href="#sun-enquire">
          <span>Book a site walk</span><i className="sun-arrow" aria-hidden="true">→</i>
        </a>
      </div>
      </section>

      <footer className="sun-foot">
        <div className="sun-foot-top">
          <div className="sun-foot-brand">
            <span className="sun-foot-mark">SUNLINE POOLS</span>
            <p className="sun-foot-line">
              Sunline Studio · Del Mar &amp; Los Angeles · design–build since 2009
            </p>
            <a className="sun-foot-cta" href="#sun-enquire">
              <span>Book a site walk</span>
              <i className="sun-arrow" aria-hidden="true">→</i>
            </a>
          </div>

          <nav className="sun-foot-cols" aria-label="Sunline footer">
            {/* The five scopes come from SCOPES rather than being retyped, so a
                service added upstairs cannot go missing down here. */}
            <div className="sun-foot-col">
              <h3 className="sun-foot-h">What we build</h3>
              <ul>
                {SCOPES.map((sc) => (
                  <li key={sc.n}><a href="#sun-scope">{sc.title}</a></li>
                ))}
              </ul>
            </div>

            <div className="sun-foot-col">
              <h3 className="sun-foot-h">Studio</h3>
              <ul>
                <li><a href="#sun-projects">Projects</a></li>
                <li><a href="#sun-house">Sunline House</a></li>
                <li><a href="#sun-process">Process</a></li>
                <li><a href="#sun-studio">The studio</a></li>
                <li><a href="#sun-ask">Common questions</a></li>
              </ul>
            </div>

            <div className="sun-foot-col">
              <h3 className="sun-foot-h">Service area</h3>
              <ul>
                <li>San Diego</li>
                <li>Orange County</li>
                <li>Los Angeles</li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="sun-foot-base">
          <span className="sun-foot-copy">&copy; {new Date().getFullYear()} Sunline Pools</span>
          <p className="sun-foot-note">
            <b className="sun-badge">CONCEPT BUILD</b>
            Sunline Pools is a fictional business created to demonstrate the studio&rsquo;s
            work. It is not a client and does not exist — project names, locations and
            dimensions are invented.
          </p>
        </div>
      </footer>
    </div>
  );
}
