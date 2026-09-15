# Image prompts — the three concept builds

Supersedes `CONCEPT-IMAGE-PROMPTS.md`, `CONCEPT-MOTION-AND-IMAGERY-PROMPT.md`
and `docs/IMAGEN-PROMPTS.md`, all of which still describe Norhaven and a
Meridian material archive that no longer exist.

Every filename here matches the `ASSETS` contract in
`components/concepts/kit.tsx`. **Requesting a width that was never generated is
a silent 404 and a broken image**, so adding an image means adding it to
`ASSETS` *and* running the script — the two have to agree.

```bash
./scripts/make-concept-assets.sh <source-file> <slug> <name>
```

`MAXW=1280 ./scripts/…` caps the ladder for small boxes (service thumbnails).
Add `--portrait` only for images that render tall on a phone.

**Always generate from the master.** Deriving 640 and 1280 from an already
upscaled 1920 round-trips the loss — that is what read as pixelation in Sunline
and it cost a full regeneration to undo.

---

## How to get a set that hangs together

Text-to-image models have no 3D model of a scene. Prompting "the same backyard
from the other end" gives you *a different backyard that looks similar* — the
pool changes shape, the house grows a window. At a glance it passes; in a
gallery of four images of "one project" it falls apart, which is exactly where
you would use it.

What works instead: **write the world block once, change only the camera
line, and generate the whole set in one session.** Every descriptor identical,
one variable. That is the entire trick.

---

## SUNLINE — pools & patios

Palette: bone `#F3EEE5`, sand `#D7C3A5`, pacific `#173B46`, saffron `#D89A4A`.

### House style — prepend to every Sunline prompt

```
Editorial architectural photography, California modernism. Pale travertine and
limestone, dark-plaster water, mature olive trees, low warm sun near golden
hour, long soft shadows, single-storey flat-roofed house with deep eaves,
horizontal timber fencing, restrained drought planting. Muted warm palette:
bone, sand, deep teal water, terracotta. Shot on medium format, 35mm or 50mm
equivalent, f/5.6, natural light only. Calm, unpeopled, no visible branding,
no text, no logos.
```

### The actual gap: five service images

The services section has **no imagery at all** — Ridgeline got thumbnails,
Sunline never did. Now that the prices have come off those rows, the right-hand
column is empty and these five would fill it.

Generate 3:2 landscape, then `MAXW=1280 ./scripts/make-concept-assets.sh <src> sunline <name>`
and add `svcpool: [640, 1280]` (and so on) to `ASSETS.sunline`.

| Name | Prompt — append to the house style block |
|---|---|
| `svcpool` | A rectangular dark-plaster swimming pool with a raised spa spilling into it, travertine coping flush with the deck, water perfectly still, low sun raking across the surface. Three-quarter view from the deck corner. |
| `svcterrace` | A wide travertine terrace in large-format slabs with tight joints, meeting a strip of ipe decking. Furniture only at the edge of frame. Late afternoon shadow of an olive tree falling across the stone. |
| `svckitchen` | An outdoor kitchen run built into a plaster wall: stone counter, built-in grill, open shelving, bar seating. Shaded by a timber pergola, warm light beyond. No food, no people. |
| `svcplanting` | Mature olive trees and native grasses against a horizontal timber fence, a low plaster seat wall, gravel and stone underfoot. Late sun through the leaves, dappled shadow on the wall. |
| `svclighting` | A backyard at blue hour: low-voltage path lighting, a linear gas fire feature glowing, underwater pool lights, warm windows in the house beyond. Deep blue sky, no sun. |

### A coherent project set

One world block, four cameras, one session:

```
[paste the Sunline house style block first]

THE PLACE — identical in every image:
A single-storey flat-roofed house in pale lime plaster with deep eaves and
full-height sliding glass. A 12 x 5 metre rectangular pool, dark plaster,
travertine coping, its long axis parallel to the house. A raised spa at the far
end spilling over a stone lip. Horizontal cedar fencing on the left boundary.
Three mature olive trees on the right, underplanted with grasses. An ipe deck
strip between pool and house. Late afternoon, sun low from the left.

THE CAMERA — change only this line:
1. Wide establishing shot from the far corner of the garden, house and full pool in frame, eye level.
2. From the house looking back down the length of the pool toward the spa, low angle just above the water.
3. Overhead drone view, square to the pool, deck and planting visible on all sides.
4. Tight three-quarter detail of the spa spillover, coping and water surface, shallow depth of field.
```

---

## RIDGELINE — roofing & exteriors

Palette: graphite `#1D2528`, steel `#758086`, bone `#E8E4DC`, safety orange
`#E66A2C`, cedar `#795542`.

This build's imagery is **complete** — all fourteen names in the contract exist
on disk, service thumbnails included. Use these prompts only to replace a plate
you are unhappy with, and match the existing set rather than starting a new look.

### House style

```
Documentary exterior photography, overcast Pacific Northwest light. Architectural
asphalt and standing-seam metal roofing, cedar fascia, weathered timber, galvanised
flashing. Flat even sky, no hard shadow, high micro-contrast on materials. Muted
cool palette: graphite, steel grey, bone, weathered cedar. Shot on full frame, 35mm
equivalent, f/8, natural light only. Working, unglamorous, precise. No people unless
specified, no branding, no text.
```

The one rule that matters here: the wipe pair (`beforeproject` / `afterproject`)
must be **camera-locked** — identical position, lens and framing, only the roof
changing. Generate them as a pair from one world block or the wipe reads as a
glitch instead of a comparison.

---

## MERIDIAN — custom millwork

Palette: ink `#1F2321`, warm paper `#E8E1D6`, walnut `#5A3E2D`, white oak
`#C8B08A`, oxidised brass `#A98454`.

### House style

```
Architectural interior photography for a cabinetmaking monograph. Quartered white
oak and black walnut, hand-applied matte finish, honed stone, unlacquered brass
hardware. Soft directional daylight from one side, deep quiet shadow, still air.
Muted palette: warm paper, walnut brown, oak, aged brass, ink. Shot on medium
format, 50mm equivalent, f/8, tripod, natural light only. Composed square to the
cabinetry. All-wood cabinetry — no painted doors, no steel. No people, no styling
clutter, no branding, no text.
```

### Worth adding

The four kitchens exist. What would strengthen "Selected Kitchens" is range
beyond kitchens — this studio claims to do rooms, not just cabinets.

| Name | Prompt — append to the house style block |
|---|---|
| `library` | A floor-to-ceiling library wall in quartered white oak, scribed to the wall, adjustable shelves, a rolling ladder rail, books sparse and unstyled. One window out of frame casting soft light across the run. |
| `wardrobe` | An open dressing room in black walnut: hanging rails, an island of drawers with a honed stone top, interior fittings in solid timber. Warm low light, nothing hanging that reads as styling. |
| `oakmacro` | Extreme close detail of a rift-sawn white oak cabinet door, grain running vertically, hand-applied matte finish catching raking light, the shadow line of a flush edge. Fills the frame. |
| `jointmacro` | Close detail of a hand-cut mitred corner in black walnut, the joint line almost invisible, an unlacquered brass pull entering frame. Raking side light, deep shadow. |

Generate 3:2, `MAXW=1920`, and add each name to `ASSETS.meridian`.

**Meridian's hero is the one image you cannot regenerate casually.** The
`drawing` plate was traced from the `interior` photograph so both share one
camera exactly, which is what makes the drawn → built wipe register pixel for
pixel. Replacing `interior` means re-tracing `drawing` from the new photograph.

---

## Before you generate anything

- **No real business names, no signage, no logos, no readable text.** These are
  fictional companies; a real company's name never goes on invented work.
- **No recognisable people.** Every build is unpeopled by design, and it keeps
  the sets consistent.
- Ask for the **largest** size the tool offers. The ladder can always come down
  from a master; it cannot come up.
