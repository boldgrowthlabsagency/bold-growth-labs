# Meridian — three kitchens for "Selected Kitchens"

**Copy each block below exactly as it is and paste it straight into Google AI
Studio. Nothing to substitute, nothing to assemble.** The previous version of
this file asked you to paste a `[HOUSE STYLE BLOCK]` placeholder in yourself —
if that went in literally, that alone would explain the results.

Generate **4 variations of each**, keep one. Aspect ratio **4:3**. Use the
largest output size AI Studio offers.

---

## The brief in one line

Meridian is a **millwork atelier** — everything they make is solid timber. So
all three kitchens are wood-fronted. They must still be unmistakably different
rooms, and the difference has to come from the timber itself: species, cut,
grain direction, tone and hardware. Not from paint, not from steel, not from
a different trade.

If two of the three could be confused at a glance, the section fails.

| | Species | Tone | Cut & grain | Hardware | Stone |
|---|---|---|---|---|---|
| 1 | Black walnut | Dark | Slip-matched, horizontal | Aged brass | Honed limestone |
| 2 | White oak | Pale | Rift-sawn, vertical | None — shadow gap | Bianco, waterfall |
| 3 | Cherry | Mid, warm red | Flat-sawn, book-matched | Blackened steel | Soapstone |

---

## 1 · `kitchenwalnut` — dark, heavy, horizontal

```
Photorealistic architectural interior photograph of a kitchen in solid black
walnut, for a fine cabinetmaking monograph. The walnut is dark and close-grained,
slip-matched so the grain runs horizontally and continuously across a long bank
of drawer fronts. A large island topped in honed grey limestone with a 60mm
mitred edge, cut so the stone reads as one solid block. Unlacquered aged brass
tapware and slim brass edge pulls, already patinating. Plaster walls, dark
timber floor. Deep late-afternoon light raking in from a tall window to the
right, strong directional shadow, no fill light. Shot on medium format, 50mm
lens, f/8, camera on a tripod at counter height, composed square to the
cabinetry with verticals perfectly true. No people. No text or branding.
Two real objects on the counter and nothing else.
```

**Reject if:** the walnut looks orange or reddish · grain runs vertically ·
chrome or matte-black hardware · pendant lights.

---

## 2 · `kitchenoak` — pale, quiet, vertical

```
Photorealistic architectural interior photograph of a kitchen in solid rift-sawn
white oak, for a fine cabinetmaking monograph. The oak is very pale and almost
bleached, with a tight straight grain running vertically and continuing
uninterrupted across every door of a twelve-foot run of full-height cabinetry.
Completely handleless — the doors open on a fine shadow gap, with no pulls,
knobs or visible fixings anywhere. An island in pale Bianco stone with a full
waterfall return to the floor. Polished concrete floor, white plaster walls.
Bright, even, cool north daylight from a tall window out of frame to the left,
soft shadow, no sun patches. Shot on medium format, 50mm lens, f/8, camera on a
tripod at counter height, composed square to the cabinetry with verticals
perfectly true. No people. No text or branding. One pale stone bowl on the
counter and nothing else.
```

**Reject if:** the oak reads golden or honey rather than pale · any handle is
visible · grain runs horizontally · warm lamplight.

---

## 3 · `kitchencherry` — warm, figured, book-matched

```
Photorealistic architectural interior photograph of a kitchen in solid American
cherry, for a fine cabinetmaking monograph. The cherry has darkened with age to
a warm reddish brown, flat-sawn and book-matched so the figure mirrors
symmetrically across pairs of tall doors. Counters in honed soapstone, deep
charcoal grey, with a simple square edge. Hardware in blackened steel: slim
tab pulls and a matching blackened steel tap. A tall dresser unit with open
shelving in the same cherry. Lime-washed walls, wide oak boards underfoot. Warm
diffused light from a window behind the camera, gentle shadow. Shot on medium
format, 50mm lens, f/8, camera on a tripod at counter height, composed square
to the cabinetry with verticals perfectly true. No people. No text or branding.
One ceramic jug on the counter and nothing else.
```

**Reject if:** the cherry looks like pine or oak · the book-match is not
symmetrical · brass appears · the room reads as rustic or farmhouse.

---

## If Google still drifts

Three things fix most of it, in order:

1. **Drop the last two sentences** ("Shot on medium format…" onward). Camera
   jargon sometimes pulls these models toward stock-photo lighting. The material
   description is what matters.
2. **Lead with the species.** Start the prompt with *"A solid black walnut
   kitchen…"* rather than the photographic framing.
3. **Generate them in separate sessions.** Asked in one thread, the model tends
   to converge the three toward each other — the opposite of what this section
   needs.

---

## Wiring them in

```bash
MAXW=1920 ./scripts/make-concept-assets.sh ~/Downloads/kitchenwalnut.png meridian kitchenwalnut
MAXW=1920 ./scripts/make-concept-assets.sh ~/Downloads/kitchenoak.png    meridian kitchenoak
MAXW=1920 ./scripts/make-concept-assets.sh ~/Downloads/kitchencherry.png meridian kitchencherry
```

Then add to `ASSETS.meridian` in `components/concepts/kit.tsx`:

```ts
kitchenwalnut: [640, 1280, 1920],
kitchenoak: [640, 1280, 1920],
kitchencherry: [640, 1280, 1920],
```

The section renders whatever is registered and skips the rest, so it goes from
one kitchen to four with no other change — and drop me the files and I will
wire them.
