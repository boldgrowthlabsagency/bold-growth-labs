# BOLD Growth Labs — Concept Build Art Direction Brief

**What this is:** a single high-level prompt you can paste into any image or video
generator (Midjourney, Runway, Kling, Veo, Sora, Firefly, Higgsfield) to produce
the animations and imagery for the four concept websites.

**Read the master prompt once, then use the per-concept blocks.** The master
prompt is the part that keeps all four looking like they came out of the same
studio. The per-concept blocks are what keep them from looking like the same
website.

---

## MASTER PROMPT — prepend to every generation

> Art direction for a premium web design studio's concept portfolio. The output
> must read as **real commissioned work for a real business**, not as a template
> demo or a stock asset. Photographic realism, editorial restraint, natural light
> physics. Every frame should look like it was shot on a paid production day by a
> photographer who was given a mood board and a budget — not assembled from
> stock.
>
> **Camera language:** full-frame stills equivalent, 35mm / 50mm / 85mm. Shallow
> but not gimmicky depth of field. Real optical falloff, real vignetting from the
> lens rather than added in post. Slight imperfection is a feature — a dust mote,
> a fingerprint on glass, an uneven grain — because sterility reads as synthetic.
>
> **Light:** one dominant directional source plus soft fill. Never flat, never
> ring-lit, never HDR-flattened. Time of day is specified per concept and is not
> negotiable — it is the single strongest signal that these four are different
> businesses.
>
> **Colour:** each concept has a locked palette below. Do not drift toward a
> generic teal-and-orange grade. Blacks stay rich but retain detail; highlights
> roll off rather than clip.
>
> **Motion (when generating video):** subtle and *physical*. Camera moves are
> slow dollies, gentle parallax, or a locked-off frame with movement only inside
> it. No whip pans, no drone swoops unless specified, no speed ramps, no lens
> flares thrown in for drama. Target 4–7 seconds, seamlessly loopable, 24fps for
> a filmic cadence. If the clip cannot loop cleanly, generate it symmetric so it
> can be ping-ponged.
>
> **Hard exclusions, every prompt:** `no text, no letters, no logos, no
> watermark, no signage, no visible brand marks, no readable UI, no faces at
> camera, no oversaturation, no HDR halo, no plastic skin, no fisheye`

---

## HOW MOTION IS USED IN THESE BUILDS

Each concept has one signature interaction. Motion assets exist to *serve that
interaction*, not to decorate the page. Generate to the role, not to the vibe.

| Role | Duration | Loop | Where it lives |
|---|---|---|---|
| **Ambient hero** | 5–7s | seamless | behind the concept's hero headline |
| **Interaction state** | 2–3s | ping-pong | swapped in when a visitor picks an option |
| **Transition texture** | 1–2s | one-shot | between sections, barely noticed |

Anything longer than 7 seconds is wasted — these play inside preview frames a few
hundred pixels wide and nobody watches them to the end.

**Weight budget:** every clip ships as WebM/VP9 *and* MP4/H.264 (Safari needs the
MP4), muted, `playsinline`, under **1.5 MB each**. If a clip exceeds that, cut its
duration before you cut its resolution.

---

## SUNLINE POOLS & PATIOS
*Warm, editorial, Southern California. Serif type, lagoon + sand.*

**Locked palette:** deep lagoon blue-green, warm travertine sand, olive foliage,
low gold sun. **Time of day: the 40 minutes before sunset. Never midday.**

**Ambient hero (video):**
> Locked-off wide of a dark-plaster infinity pool at golden hour. The only motion
> is the water surface — slow caustic ripple, sunlight fracturing across it, one
> olive branch drifting at the frame edge. Camera does not move. 6 seconds,
> seamless loop.

**Interaction state (video, ping-pong):**
> Macro of water meeting travertine coping. Caustic light patterns crawling
> across stone. Extremely shallow depth of field. 3 seconds.

**Stills:** the before/after pair is the signature interaction and must be shot
from an **identical camera position** — same height, same lens, same framing — so
the wipe reads as one place transformed rather than two different yards.

> **before** — Empty suburban backyard, dry patchy lawn, plain fence line, flat
> overcast light, real-estate documentary style, deliberately unremarkable.
>
> **after** — The same yard, same camera position, now a luxury infinity pool at
> golden hour: dark plaster interior, limestone coping, mature olive trees, low
> California-modern house behind. Architectural Digest photography.

---

## RIDGELINE ROOFING
*Rugged, documentary, honest. Condensed uppercase, slate + amber.*

**Locked palette:** cold slate grey, weathered asphalt, amber safety gear, muted
sky. **Time of day: overcast, or hard low winter sun. No golden hour — this
concept earns trust by looking unretouched.**

**Ambient hero (video):**
> Slow handheld push toward a residential roof ridge under overcast sky. Visible
> texture in the shingles. A crew member's shadow crosses frame. Documentary
> cinematography, natural grain, no colour grading beyond a slight cool lift.
> 6 seconds.

**Interaction state (video, ping-pong):**
> Locked-off macro of storm-lifted shingle edges moving very slightly in wind,
> exposed underlayment visible, flat grey daylight, insurance-documentation
> aesthetic. 2 seconds.

**Stills:** the damage/repaired pair drives the roof-inspection interaction and
must match framing exactly, same as Sunline's before/after.

> **damage** — Close-up of storm-damaged shingles, lifted and cracked, exposed
> underlayment, grey daylight.
>
> **repaired** — The same roof section cleanly re-shingled, crisp ridge line, tidy
> flashing, identical framing.
>
> **crew** — Two roofers reviewing an inspection tablet on a residential roof,
> natural light, mid-shot, no faces to camera.

---

## NORHAVEN AESTHETICS
*Editorial luxury. Serif, bone + clay, calm.*

**Locked palette:** bone, warm plaster, clay, pale oak. Nearly no saturation.
**Time of day: mid-morning, soft directional window light.**

**Ambient hero (video):**
> Static frame, minimal treatment room. Sheer curtain breathing slowly in front of
> a window. Light shifting almost imperceptibly across a plaster wall. Nothing
> else moves. 7 seconds, seamless.

**Interaction state (video, ping-pong):**
> Extreme close macro, skincare serum drop meeting a bone-coloured plaster
> surface, raking light, real surface tension. 2 seconds.

**Stills:**
> **portrait** — Editorial beauty portrait, natural visible skin texture, minimal
> makeup, soft window light, neutral bone background, calm expression, three-quarter
> angle, not looking at camera.
>
> **clinic** — Minimal clinic interior, warm oak and plaster, single treatment
> chair, zero clutter, soft daylight.
>
> **detail** — Skincare flatlay on textured bone plaster, one dried botanical
> stem, raking light.

**Non-negotiable:** keep skin real. Pores, fine lines, uneven tone. Over-retouched
imagery actively undermines a consult-first clinic — it reads as a stock photo,
and a stock photo tells the visitor the work isn't real.

---

## MERIDIAN CABINETRY
*Architectural, material-led. Near-black, walnut, brass.*

**Locked palette:** near-black, black walnut, honed stone, unlacquered brass.
**Time of day: late afternoon, single hard side light through a large window.**

**Ambient hero (video):**
> Very slow dolly along a full-height black walnut cabinet run. Hard side light
> rakes across the grain, revealing figure as the camera passes. Brass hardware
> catches once. Architectural cinematography, near-monochrome. 6 seconds.

**Interaction state (video, ping-pong):**
> Macro, a hand plane taking a single shaving off a walnut panel, sawdust in a
> shaft of light, shallow focus, muted colour. 3 seconds.

**Stills:**
> **kitchen** — Custom black walnut kitchen, full-height slab cabinetry,
> integrated brass hardware, honed stone counter, dramatic side light.
>
> **detail** — Macro of a mitred walnut drawer front, visible grain, brass edge
> pull, raking light.
>
> **swatches ×4** — Flat material swatches, top-down, even light, filling frame:
> black walnut, quarter-sawn white oak, fumed ash, bone lacquer.

The material explorer currently renders those four finishes as CSS gradients.
Swapping in real swatch photography is the single highest-impact upgrade across
all four concepts — for a cabinetmaker, **material is the entire pitch**, and a
gradient is visibly not wood.

---

## DELIVERY CHECKLIST

1. **Stills** → WebP at q82, under 250 KB each. `cwebp -q 82 in.jpg -o out.webp`
2. **Video** → dual encode, under 1.5 MB each:
   ```
   # MP4 (Safari)
   ffmpeg -i in.mp4 -vf "fps=24,scale=960:-2" -c:v libx264 -profile:v main \
          -level 3.1 -crf 26 -pix_fmt yuv420p -an -movflags +faststart out.mp4
   # WebM (everything else, smaller)
   ffmpeg -i in.mp4 -vf "fps=24,scale=960:-2" -c:v libvpx-vp9 -crf 36 -b:v 0 -an out.webm
   ```
3. **Loops** → if a clip doesn't loop cleanly, ping-pong it:
   ```
   ffmpeg -i clip.mp4 -filter_complex "[0]split[a][b];[b]reverse[r];[a][r]concat=n=2" pp.mp4
   ```
   The junctions become identical frames, so the loop physically cannot pop.
4. Drop files into `public/concepts/<slug>/` and tell me — I'll wire them into the
   existing slots. Every slot already exists in the markup at the right aspect
   ratio, so nothing in the layout will shift.

---

## ONE RULE ABOVE ALL

These are labelled concept builds for fictional businesses. The imagery must look
like real commissioned work — but it must never depict a real, identifiable
company, a real person presented as a client, or anything that could be read as an
actual endorsement. The craft should be indistinguishable from real client work.
The claims should be indistinguishable from honest.
