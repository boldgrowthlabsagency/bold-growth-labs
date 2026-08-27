# Google Imagen — prompt pack for the concept builds

Everything here targets a gap I actually found in the code, not a general
wishlist. Counts and filenames match the `ASSETS` contract in
`components/concepts/kit.tsx`, so generated files can be dropped straight
into the pipeline.

**Generate with:** `scripts/make-concept-assets.sh <src> <slug> <name> [--portrait]`

---

## First: the thing that does not work

> *"Can Imagen generate other angles of the same Sunline project?"*

**No — not reliably, and not from a reference photo.** Text-to-image models
have no 3D model of a scene. Prompt "the same backyard from the other end" and
you get *a different backyard that looks similar*. The pool changes shape, the
coping changes material, the house grows a window. At a glance it passes; in a
gallery of four images of "one project" it falls apart, which is exactly where
you'd use it.

Three things that **do** work, in order of how reliably they hold:

| Technique | What you actually get | Use it for |
|---|---|---|
| **Outpaint / extend** | Genuinely the same frame, widened or heightened | Turning a tight shot into a wide, or a landscape into a portrait crop |
| **Fixed world-block + varying camera** | A set that reads as one place because every descriptor is identical | Building a project gallery from scratch |
| **Style / subject reference** | Consistent *look*, not consistent geometry | Making new images match an existing library |

The second one is the workhorse and it is what the Ridgeline and Norhaven
libraries evidently used — they cohere because their descriptors are identical,
not because they are photographs of a real place.

**So the practical answer:** don't try to extend the existing Sunline photos.
Invent one project, describe it in fixed detail, and shoot it from five angles
in a single session. The `Sunline_Reference_Stills.zip` is still worth having —
use it as a **style reference** so new work matches the existing palette, and
as the source for any outpainting.

---

## House style blocks

Prepend the matching block to every prompt for that brand. This is what keeps a
set coherent.

### SUNLINE — pools & patios

```
Editorial architectural photography, California modernism. Pale travertine and
limestone, dark-plaster water, mature olive trees, low warm sun near golden
hour, long soft shadows, single-storey flat-roofed house with deep eaves,
horizontal timber fencing, restrained drought planting. Muted warm palette:
bone, sand, deep teal water, terracotta. Shot on medium format, 35mm or 50mm
equivalent, f/5.6, natural light only. Calm, unpeopled, no visible branding.
```

### MERIDIAN — custom millwork

```
Architectural interior photography for a cabinetmaking monograph. Quartered
white oak and black walnut, hand-applied matte finish, honed stone, unlacquered
brass hardware. Soft directional daylight from one side, deep quiet shadow,
still air. Muted palette: warm paper, walnut brown, oak, aged brass, ink.
Shot on medium format, 50mm equivalent, f/8, tripod, natural light only.
Composed square to the cabinetry. No people, no styling clutter, no branding.
```

### NORHAVEN — aesthetic medicine

```
Quiet clinical editorial photography, Scandinavian restraint. Warm plaster
walls, pale oak joinery, bone and porcelain surfaces, muted sage and dusty rose
accents, unbranded matte glass vessels. Soft diffused north light, gentle
falloff, no hard shadow. Shot on medium format, 65mm equivalent, f/4, natural
light only. Calm, unhurried, expensive but never showy. No logos, no text,
no medical signage.
```

---

## SUNLINE — 5 service images (the biggest gap)

Sunline's services section has five scopes and **no imagery at all** — Ridgeline
got thumbnails, Sunline never did. These five fill it.

Generate at **3:2 landscape**, then `MAXW=1280 ./scripts/make-concept-assets.sh <src> sunline <name>`

| `<name>` | Prompt (append to the Sunline block) |
|---|---|
| `svcpool` | `A rectangular dark-plaster swimming pool with a raised spa spilling into it, travertine coping flush with the deck, water perfectly still, low sun raking across the surface. Three-quarter view from the deck corner.` |
| `svcterrace` | `A wide travertine terrace laid in large format slabs, tight joints, meeting a strip of ipe decking. Furniture at the edge of frame only. Late afternoon shadow of an olive tree falling across the stone.` |
| `svckitchen` | `An outdoor kitchen run built into a plaster wall: stone counter, built-in grill, open shelving, bar seating. Shaded by a timber pergola, warm light beyond. No food, no people.` |
| `svcplanting` | `Mature olive trees and native grasses against a horizontal timber fence, a low plaster seat wall, gravel and stone underfoot. Late sun through the leaves, dappled shadow on the wall.` |
| `svclighting` | `A backyard at blue hour: low-voltage path lighting, a linear gas fire feature glowing, underwater pool lights, warm windows in the house beyond. Deep blue sky, no sun.` |

## SUNLINE — one coherent project set (the "different angles" answer)

This is how you get four images that read as **one** project. Write the world
block **once** and change only the camera line. Generate all four in one session.

```
[SUNLINE HOUSE STYLE BLOCK]

THE PLACE (identical in every image):
A single-storey flat-roofed house in pale lime plaster with deep eaves and
full-height sliding glass. A 12 x 5 metre rectangular pool with dark plaster
and travertine coping, its long axis parallel to the house. A raised spa at the
far end spilling over a stone lip. Horizontal cedar fencing on the left
boundary. Three mature olive trees on the right, underplanted with grasses.
Ipe deck strip between pool and house. Late afternoon, sun low from the left.

THE CAMERA (change only this line):
1. Wide establishing shot from the far corner of the garden, house and full pool in frame, eye level.
2. From the house looking back down the length of the pool toward the spa, low angle just above the water.
3. Overhead drone view, square to the pool, deck and planting visible on all sides.
4. Tight three-quarter detail of the spa spillover, coping and water surface, shallow depth of field.
```

Name them `proj1`–`proj4` and the set will hang together.

---

## MERIDIAN — break the archive repetition

The material archive has four plates, each with a main image and a macro. It is
currently running eight slots off **five** photographs:

- Plate 02 uses `interior` as *both* its plate and its macro — the same
  photograph shown twice, side by side, one labelled a detail crop.
- `material` carries both Plate 01's macro **and** Plate 04's macro.

Four new images fix it. Generate at **3:2**, `MAXW=1920`.

| `<name>` | Prompt (append to the Meridian block) |
|---|---|
| `oakmacro` | `Extreme close detail of a rift-sawn white oak cabinet door: the grain running vertically, a hand-applied matte finish catching raking light, the shadow line of a flush edge. Fills the frame.` |
| `jointmacro` | `Close detail of a hand-cut mitred corner in black walnut, the joint line almost invisible, unlacquered brass pull entering frame. Raking side light, deep shadow.` |
| `library` | `A floor-to-ceiling library wall in quartered white oak: scribed to the wall, adjustable shelves, a rolling ladder rail, books sparse and unstyled. One window out of frame casting soft light across the run.` |
| `wardrobe` | `An open dressing room in walnut: hanging rails, an island of drawers with a stone top, interior fittings in solid timber. Warm low light, nothing hanging that reads as styling.` |

## MERIDIAN — 5 commission images

Optional, but it would give the commissions list the same visual weight
Ridgeline's services now have. **3:2**, `MAXW=1280`, names
`cmkitchen` `cmlibrary` `cmdressing` `cmbath` `cmmillwork`.

```
1. A finished kitchen: tall oak runs, an island with a thick honed stone top, brass hardware. Morning light from the left.
2. A study with built-in desk and shelving in walnut, a single chair, one lamp.
3. A dressing room island with drawers open just enough to show solid timber interiors.
4. A bathroom vanity in oak with a stone top and undermount basin, brass tapware, marine-grade construction implied by heavy frames.
5. Panelled hallway joinery meeting a staircase, doors flush with the panelling, all one timber.
```

---

## NORHAVEN — stop `detail` appearing three times

The dropper-bottle still life is currently doing three jobs: the Body treatment
card, the aftercare section, and the resolved plate of the clarity study. Two
new still lifes retire two of those.

**1:1 square**, `MAXW=1280`.

| `<name>` | Prompt (append to the Norhaven block) |
|---|---|
| `stillcloth` | `A folded bone-coloured linen cloth and a single unbranded frosted glass jar on warm plaster, shot from directly above. Soft diffused light, long gentle shadow, nothing else in frame.` |
| `stillhands` | `A practitioner's hands at rest on a pale oak surface beside a closed unbranded amber bottle, sleeves of a bone-coloured tunic. Cropped at the forearms, face not in frame. Soft north light.` |

Then reassign in `Norhaven.tsx`: aftercare → `stillcloth`, Body treatment →
`stillhands`, and leave the clarity study on `detail` / `diffused` where the
pair is the whole point.

---

## Settings, and what to reject

- **Aspect ratio** matters more than resolution — generate 16:9 or 3:2 for
  landscape slots, 1:1 for still lifes, 4:5 for portraits. Cropping a square
  into a banner wastes most of the frame.
- **Generate 4 per prompt**, keep one. The hit rate on architectural detail is
  not high.
- **Reject on sight:** warped straight lines (cabinet edges, pool coping, fascia
  are where these models fail first), impossible joinery, water that does not
  obey gravity, more than four fingers of a hand doing anything, any text or
  signage, lens flare, HDR halos, over-saturated sunsets.
- **No people** in Sunline or Meridian. The existing libraries have none, and one
  figure would break the set.
- **Licensing:** confirm Google's current commercial terms before any of this
  goes on a client site. Google indemnifies some generated-content use under
  Cloud terms; verify it covers your case.

---

## After generating

```bash
# landscape slot
MAXW=1280 ./scripts/make-concept-assets.sh ~/Downloads/svcpool.png sunline svcpool

# something that fills a tall box on phones
./scripts/make-concept-assets.sh ~/Downloads/proj1.png sunline proj1 --portrait
```

Then register the widths in `ASSETS` in `components/concepts/kit.tsx` — and if
it renders in a tall box on mobile, add the name to `PORTRAIT` too. A file that
is not in `ASSETS` is a silent 404.

---

# MERIDIAN — the three outstanding kitchens

The **Selected Kitchens** section (`§ 07`, "see our work") is built and live. It
renders whatever kitchen assets are registered in `ASSETS.meridian` and silently
skips the rest, so it shows **one** today and becomes **four** the moment these
three land. Nothing breaks in the meantime.

The argument of that section is that the atelier is *not a look* — so these three
must not resemble each other, and none should resemble Arbour Lane (black walnut,
honed limestone, brass, dark and heavy). Push them apart deliberately.

**All three:** 4:3 landscape · `MAXW=1920` · no people · no visible branding.

Prepend the Meridian house style block from earlier in this document, then:

### 1 · `kitchenoak` — Fenwick Row, pale and handleless

```
A large kitchen in rift-sawn white oak, almost white in tone. Completely
handleless — no pulls, no visible fixings, doors opening on a shadow gap. A long
twelve-foot run of tall cabinetry on one wall with the grain running vertically
and continuously across every door. A stone island in pale Bianco with a full
waterfall return to the floor, 60mm slab. Bright, even north light from a large
window out of frame left. Nothing on the counters but one stone bowl. Cool,
quiet, almost clinical.
```

Reject: warm golden oak (it must read pale, not honey), any visible handle,
clutter on the counter, sun patches.

### 2 · `kitchenpainted` — Marlow House, classic English

```
A hand-painted English kitchen in a muted sage-green, inset doors set flush
within a face frame with a visible even reveal, paint rubbed back slightly on
the arrises to show wear. Polished unlacquered brass cup handles and knobs. An
aged marble counter with a hand-cut ogee edge and a deep fireclay sink. A cast
iron range cooker set into a plastered alcove. Warm side light through a
sash window, old plaster walls, wide board floor. Traditional, quiet, lived in.
```

Reject: anything glossy or modern-Shaker, chrome, engineered stone, a kitchen
island (this room should read older than islands).

### 3 · `kitchensteel` — Gasworks Loft, dark and framed

```
A dark kitchen built as furniture inside a converted industrial space: a
blackened steel frame carrying carcases in fumed ash, the steel visible as a
slim structural edge around every opening. Honed black basalt counters. Open
steel shelving with a single row of glassware. Exposed brick and a large
steel-framed warehouse window behind, city light, overcast. Moody, low contrast,
no warm lamps.
```

Reject: anything that reads as a domestic kitchen with black cabinets — the
steel frame must be legible as structure, not as trim. No pendant lights.

## After they land

```bash
MAXW=1920 ./scripts/make-concept-assets.sh ~/Downloads/kitchenoak.png meridian kitchenoak
MAXW=1920 ./scripts/make-concept-assets.sh ~/Downloads/kitchenpainted.png meridian kitchenpainted
MAXW=1920 ./scripts/make-concept-assets.sh ~/Downloads/kitchensteel.png meridian kitchensteel
```

Then add to `ASSETS.meridian` in `components/concepts/kit.tsx`:

```ts
kitchenoak: [640, 1280, 1920],
kitchenpainted: [640, 1280, 1920],
kitchensteel: [640, 1280, 1920],
```

That is the whole wiring — the section picks them up automatically, in the order
declared in `KITCHENS` in `Meridian.tsx`, and renumbers the plates itself.
