# BOLD Growth Labs — website

Next.js 14 · TypeScript · Tailwind · GSAP · Lenis. No WebGL — every effect is
GPU-friendly CSS transform / opacity / clip-path, which is why it stays fast on
mobile.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Locked brand palette

Defined once as CSS variables in `app/globals.css`. Do not add colours.

| Token | Value | Role |
|---|---|---|
| `--bold-navy`   | `#00022E` | The world — backgrounds, atmosphere |
| `--bold-slate`  | `#0D1C2A` | The structure — cards, sections, depth |
| `--bold-orange` | `#E8520A` | The energy — accents, light, interaction |
| `--bold-white`  | `#FFFFFF` | The message — headlines |
| `--bold-muted`  | `#8A94A6` | Cool grey body copy (never warm) |

Orange is treated as a light source (`.lightsource`, hinge glow, cursor-tracked
orb) rather than as a flat colour fill.

## Editing content

All copy, pricing, add-ons, FAQs, projects and feature pills live in
`lib/data.ts`. Nothing is hard-coded into components — change the array, the UI
follows.

## Components

`Navbar` · `Logo` · `Hero` · `CinematicPunchlineRotator` · `LaptopReveal` ·
`EssentialsCloud` · `Services` · `Process` · `Portfolio` · `Pricing` ·
`AddOnBuilder` · `FAQ` · `FinalCTA` · `Footer` · `CustomCursor` ·
`MagneticButton` · `SectionReveal` · `SmoothScroll`

### CinematicPunchlineRotator
Cycles **complete compositions** (headline + supporting line) as single units —
never independent sentences. Masked viewport, GSAP timeline, headline leads and
supporting copy follows ~70ms behind, blur-to-sharp on entry, ~3s cycle.

One gotcha worth knowing if you extend it: give every cycle its own timeline
label. Reusing a single shared label collapses every transition onto the same
instant and the whole rotator goes blank.

### LaptopReveal
The lid rotates on the hinge it actually shares with the base
(`transform-origin: bottom center` on the lid), not the whole object spinning.
Scroll drives −92° → +14°, the miniature site lights up around 70°, then the
object eases forward. Scroll position is read on `scroll` and applied in a
`requestAnimationFrame` lerp so nothing thrashes layout.

## Fonts

Archivo + JetBrains Mono load **asynchronously** (`media="print"` then swapped
to `all`), so they never block first paint. The fallback stack is condensed-
leaning to keep the swap from shifting layout. If you have licensed brand
fonts, self-host them and update `--font-sans` / `--font-mono`.

## Hero video

`public/hero.mp4` (1920×1080-derived band, 16s seamless loop),
`hero-mobile.mp4`, `poster.jpg`. The molecule is present in every frame and the
loop end cross-dissolves into the start — a plain `loop` attribute wraps
invisibly, so do not add crossfade machinery. Nothing is ever layered over the
video, so it can never be cropped by text.

## Accessibility & motion

Semantic landmarks, skip link, visible focus rings, `aria-expanded` on the FAQ
and mobile nav. `prefers-reduced-motion: reduce` disables the rotator cycle, the
laptop scroll animation, smooth scroll and the custom cursor, and shows static
first states. The site is fully usable with zero animation.

## The concept work

Projects in `lib/data.ts` are labelled `status: 'concept'` and use fictional
business names. That is deliberate — we do not put a real company's name on
work they did not commission. Replace them with real case studies as they land.
