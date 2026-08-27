# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev            # next dev — http://localhost:3000
npm run build          # next build (tsc runs as part of it)
npm start              # serve the production build
```

There is no test suite and no ESLint config in the repo, so `npm run lint`
prompts to set ESLint up rather than linting. Type errors surface through
`npm run build`.

`.claude/launch.json` defines the `bgl-dev` preview configuration — start the
dev server through the preview tooling rather than backgrounding `npm run dev`.

Deployment is Vercel (`npx vercel --prod --yes`), live at **boldgrowthlabs.io**
(apex, with `www` redirecting to it). The one required environment variable is
`SHEETS_WEBHOOK_URL`; see `docs/GOOGLE-SHEET-SETUP.md`.

## Architecture

Next.js 14 App Router, TypeScript, Tailwind, GSAP, Lenis. No WebGL — every
effect is a CSS transform / opacity / clip-path so it stays cheap on mobile.

### One page, content-driven

`app/page.tsx` is the entire public site: a fixed sequence of section
components rendered once. Every string, price, plan, add-on, FAQ, project and
nav item lives in `lib/data.ts` — components read from those arrays and render
whatever is there. Copy and pricing changes belong in `lib/data.ts`, not in
components.

`app/layout.tsx` owns metadata, JSON-LD `ProfessionalService` schema (which
duplicates the plan prices from `lib/data.ts` — keep the two in sync), the skip
link, and the async webfont load (`media="print"` swapped to `all` by an inline
script, so fonts never block first paint).

Counts in prose go stale when a build is removed — Norhaven was, and left
"four businesses" behind in three places. Grep for the number before changing
the set.

### The concept builds

`Portfolio` → `ConceptModal` → `components/concepts/{Sunline,Ridgeline,Meridian}.tsx`
is a second, self-contained layer: each concept is a *full-viewport takeover*
that impersonates a different company's website. The rules that hold it
together:

- **Mechanism can be shared. Appearance never is.** `components/concepts/kit.tsx`
  holds a responsive `<img>`, three hooks (`useProgress`, `useSeen`,
  `usePointer`), the `clamp01`/`range`/`mix` math, and `diagonalWipe` — which
  returns nothing but two clip-path strings. No layout, no chrome, no type, no
  colour. Each build's entire appearance lives in its own component and its own
  stylesheet (`app/concepts/<slug>.css`, imported globally in `app/layout.tsx`,
  every selector namespaced `sun-` / `rdg-` / `mrd-`). Pulling a shared nav,
  footer or gallery back up into `kit.tsx` is what previously made the three
  read as one template in three colourways — don't.
- **The wipe is shared geometry, not a shared section.** All three builds now
  reveal one plate over another along a raked edge, but what is being compared
  differs and that is where the signature lives: Sunline drives its own wipe
  over one backyard before/after; Ridgeline stages it inside an inspection
  report with a numbered point index over the roof; Meridian runs it as the
  *hero*, drawing → built, pixel-registered because the linework in `drawing`
  was traced from the `interior` photograph so both plates share one camera.
  Stage height, frame, labels, seam colour and travel speed stay in the brand
  files.
- `lib/concepts.ts` is the registry — palette, mark geometry, art-direction
  line, and what each build demonstrates. It is metadata for the modal's notes
  drawer, *not* the image contract.

### The concept forms send nothing

`components/concepts/DemoForm.tsx` is shared because validation, field state
and the submitted state are mechanism. Every class name is composed from the
brand prefix (`` `${p}-form-field` ``) so the three builds lay it out
completely differently.

**It has no endpoint, no fetch and no storage, on purpose.** These are
fictional businesses; a form that looks real on a page that isn't would collect
a real address from someone who believed it. The submitted state says
"Nothing was sent." rather than thanking anyone, and a note under the button
says so before they type. Don't wire it up.

The real contact form is `ContactForm` on the main site — see below.

### Image contract

The real contract is `ASSETS` in `components/concepts/kit.tsx`: exact widths on
disk per image, per slug (plus `ASSET_EXT` for the non-webp exceptions and
`PORTRAIT` for images that get 9:16 crops). Requesting a width that was never
generated is a silent 404 and a broken image.

Derivatives are produced by `./scripts/make-concept-assets.sh <src> <slug> <name> [--portrait]`
(needs `cwebp` and `ffmpeg`; `MAXW=1280 ...` caps the ladder for small boxes).
Adding or changing an image means updating the `ASSETS` entry and running the
script so the two agree. The script skips widths the source cannot fill rather
than upscaling.

Always generate every width **from the master**. Deriving 640 and 1280 from an
already-upscaled 1920 round-trips the loss and is what read as pixelation in
Sunline.

`tall` on `<Img>` opts an image into the portrait crop — only for images that
actually render tall on a phone, where a 16:9 master would otherwise be
cover-scaled to roughly 0.25x. A wide box is made worse by a portrait source.

### Contact flow

`ContactForm` → `POST /api/contact` (edge runtime) → Google Apps Script → Sheet.
The route proxies on purpose: the Apps Script URL is an unauthenticated write
endpoint, so it must stay server-side, and the proxy also avoids Apps Script's
lack of CORS preflight. The route validates name/email, honours a honeypot
(`botcheck` — answers 200 so bots don't retry), caps fields at 2000 chars, and
returns `{ok:false, reason:'not_configured'}` with 503 when the env var is
absent so the form can fall back to a `mailto:`.

Adding a field means adding it to `FIELDS` here *and* to `COLUMNS` in
`docs/google-sheet-script.gs`, or it is dropped before it reaches Google. Apps
Script changes only take effect after **Deploy ▸ Manage deployments ▸ New
version** — editing the script alone does nothing.

### Styling

Design tokens are CSS custom properties in `app/globals.css` — colour, a clamp
type scale (`--step--1`…`--step-5`), spacing, radii, shadows, easings.
`tailwind.config.ts` maps `navy`/`slate`/`orange`/`muted` and the `expo`/`power`
easings onto those variables. The palette is locked (see README) — do not add
colours. Orange is treated as a light source (`.lightsource`, hinge glow,
cursor-tracked orb), never as a flat fill.

#### Two traps in the concept stylesheets

**The reset outranks your rule.** Each concept stylesheet opens with a reset of
the shape `.sun-root h1, .sun-root p, .sun-root li, .sun-root figure, .sun-root button { margin:0; padding:0 }`.
That is specificity **(0,1,1)**; a bare `.sun-cap--margin { padding-inline: … }`
is **(0,1,0)** and silently loses. This has cost real time on four separate
occasions, always presenting as "an element ignores its spacing and sits
flush". Scope the rule under the root — `.sun-root .sun-cap--margin` — rather
than reaching for `!important`.

**Never run automated dead-CSS removal on these files.** `DemoForm` composes
every class name at runtime from the brand prefix, so no `.mrd-form-field`
string exists anywhere in the source for a scanner to find. A sweep once
deleted all 35 `.mrd-form*` rules and shipped Meridian's form completely
unstyled. `meridian.css` carries a ⚠ warning above that block; the same hazard
applies to any prefix-composed name. Remove CSS by hand, after checking the
rendered page.

### Motion

`SmoothScroll` lazy-loads Lenis and exports `pauseSmoothScroll` /
`resumeSmoothScroll`. Lenis drives the document and kills any nested scroller,
so a full-viewport panel with its own scrolling needs **both**
`data-lenis-prevent` on the scroller and a `pauseSmoothScroll()` while it is
open — `ConceptModal` does both.

Every animated surface must honour `prefers-reduced-motion: reduce`: the
rotator, laptop scroll, smooth scroll and custom cursor all disable themselves
and render a static first state. The site is fully usable with zero animation.

Component-level gotchas worth carrying forward:

- `CinematicPunchlineRotator` needs a unique GSAP timeline label per cycle (a
  shared label collapses every transition onto one instant and the rotator goes
  blank). Its liquid-goo morph is a blur on the inner element plus an SVG
  alpha-threshold on the *wrapper* — collapse both onto one element and it
  degrades silently to an ordinary blur. Beat lengths are the constants at the
  top of the file.
- `LaptopReveal` reads scroll position on `scroll` but applies it in a
  `requestAnimationFrame` lerp so it never thrashes layout.
- `ConceptModal` must `stopPropagation()` on arrow keys, or its own
  prev/next handler steals keyboard control from any slider inside a build.

## Concept work is labelled as concept

Projects in `lib/data.ts` carry `status: 'concept'` and fictional business
names. That is deliberate — a real company's name never goes on work they did
not commission. Replace them with real case studies as they land.

A build's own copy has to stay internally consistent too: Ridgeline was
quoting three different storm response times on one page. Grep the whole
component when changing a claim, not just the headline.
