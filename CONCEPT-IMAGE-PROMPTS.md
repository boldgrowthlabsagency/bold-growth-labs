# Concept build — photography prompt sheet

The four concepts are built and working. Each has a real layout, its own type
system and its own interaction. What they don't have is photography, because I
have no image-generation tool available.

Every image slot below already exists in the markup with the right aspect ratio
and composition. Generate the shot, drop it in at the noted path, and the layout
won't move.

Append to **every** prompt: `no text, no letters, no logos, no watermark`.
Generators reliably invent garbled type, and garbled type inside a portfolio
piece is worse than no image at all.

---

## Sunline Pools & Patios — `public/concepts/sunline/`

Warm, editorial, Southern California. Late-afternoon light, never midday.

| File | Ratio | Prompt |
|---|---|---|
| `before.jpg` | 4:3 | Empty suburban backyard, dry patchy lawn, plain fence line, flat overcast light, real-estate documentary style, unremarkable |
| `after.jpg` | 4:3 | Luxury modern infinity pool at golden hour, dark plaster interior, limestone coping, mature olive trees, low California modern house behind, architectural digest photography |
| `g1.jpg` | 3:2 | Overhead drone shot of a rectangular dark-bottom pool with sun loungers and long shadows, warm evening light |
| `g2.jpg` | 1:1 | Close detail of water meeting travertine coping, caustic light patterns, shallow depth of field |
| `g3.jpg` | 1:1 | Outdoor living area at dusk, built-in fire feature, warm lighting, pool reflection |

The before/after slider is the signature interaction — those two shots need the
**same camera position and framing** so the wipe reads as one place transformed.

---

## Ridgeline Roofing — `public/concepts/ridgeline/`

Rugged, documentary, honest. Overcast or hard low sun. No glossy retouching.

| File | Ratio | Prompt |
|---|---|---|
| `hero.jpg` | 16:9 | Roofing crew installing architectural asphalt shingles on a steep residential roof, overcast sky, safety harnesses, documentary photography, authentic work in progress |
| `damage.jpg` | 4:3 | Close-up of storm-damaged roof shingles, lifted and cracked, exposed underlayment, grey daylight, insurance-documentation style |
| `repaired.jpg` | 4:3 | Same roof section cleanly re-shingled, crisp ridge line, tidy flashing, matched framing to the damage shot |
| `crew.jpg` | 3:2 | Two roofers on a residential roof reviewing an inspection tablet, natural light, mid-shot, no faces to camera |

---

## Norhaven Aesthetics — `public/concepts/norhaven/`

Editorial luxury. Bone, clay, warm neutral. Soft directional daylight. Calm.

| File | Ratio | Prompt |
|---|---|---|
| `portrait.jpg` | 3:4 | Editorial beauty portrait, natural skin texture visible, minimal makeup, soft window light, neutral bone background, calm expression, fashion-editorial styling |
| `clinic.jpg` | 16:9 | Minimal aesthetic clinic interior, warm oak and plaster, single treatment chair, no clutter, soft daylight, architectural interior photography |
| `detail.jpg` | 1:1 | Skincare product flatlay on textured bone plaster, single stem of dried botanical, raking light, muted clay palette |

Keep skin real. Over-retouched imagery undermines a consult-first clinic.

---

## Meridian Cabinetry — `public/concepts/meridian/`

Architectural, material-led, near-monochrome with walnut and brass.

| File | Ratio | Prompt |
|---|---|---|
| `kitchen.jpg` | 16:9 | Custom black walnut kitchen, full-height slab cabinetry, integrated brass hardware, honed stone counter, dramatic side light, architectural interior photography |
| `detail.jpg` | 1:1 | Macro of a mitred walnut drawer front, visible grain, brass edge pull, raking light |
| `shop.jpg` | 3:2 | Cabinet maker's workshop, hand plane on a walnut panel, sawdust in a shaft of light, muted colour |
| `swatch-*.jpg` | 1:1 | Four flat material swatches, top-down, even light: black walnut, quarter-sawn white oak, fumed ash, bone lacquer |

The material explorer currently uses CSS gradients for the four finishes.
Swapping in real swatch photography is the single highest-impact upgrade in
this concept — material is the whole pitch.

---

## After you generate them

1. Save into the folders above.
2. Convert to WebP at ~82 quality — roughly a third the size of JPEG at the same
   perceived quality. `cwebp -q 82 in.jpg -o out.webp`
3. Keep every file under ~250 KB. These sit inside preview frames a few hundred
   pixels wide; there is no reason to ship 2 MB originals.
4. Tell me when they're in and I'll wire them into the slots and re-test.
