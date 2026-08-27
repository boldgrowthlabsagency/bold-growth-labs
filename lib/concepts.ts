/* ============================================================
   CONCEPT BRAND REGISTRY

   One place for everything that differs between the concept
   builds: the supplied palette, the supplied logo mark geometry,
   the photography that exists today, and the note that explains
   what each build is demonstrating.

   Palettes and marks are transcribed from the brand asset library
   in concept-brands/. Where a photography slot has no asset yet the
   entry is simply absent — nothing renders a placeholder, because a
   placeholder inside a portfolio piece reads as unfinished work.
   ============================================================ */

export type ConceptSlug = 'sunline' | 'ridgeline' | 'meridian';

export type Swatch = { name: string; hex: string };

export type Shot = {
  /** base name under public/concepts/<slug>/ — widths are appended */
  base: string;
  widths: number[];
  ratio: string;      // CSS aspect-ratio
  alt: string;
  caption?: string;
  /** short name for the archive selector */
  label?: string;
};

export type ConceptBrand = {
  slug: ConceptSlug;
  name: string;
  descriptor: string;
  direction: string;          // the art-direction line from the brand README
  palette: Swatch[];
  demonstrates: string[];     // what this build is proving, for the expanded view
  hero?: Shot;
  portrait?: Shot;
  /** a genuinely matched before/after — same place, same camera, zero shift */
  pair?: { before: Shot; after: Shot; beforeLabel: string; afterLabel: string };
  archive?: Shot[];           // the stepped gallery each build runs on
  missing?: string[];         // honest note about slots still to fill
};

const W = [480, 960, 1920];
const M = [400, 800, 1600];

export const CONCEPT_BRANDS: Record<ConceptSlug, ConceptBrand> = {
  sunline: {
    slug: 'sunline',
    name: 'Sunline',
    descriptor: 'Pools & Patios',
    direction:
      'Sun-washed California modernism — luxury outdoor living with architectural restraint, warm late-afternoon light, pale travertine and deep blue water.',
    palette: [
      { name: 'Bone', hex: '#F3EEE5' },
      { name: 'Sand', hex: '#D7C3A5' },
      { name: 'Pacific', hex: '#173B46' },
      { name: 'Saffron', hex: '#D89A4A' },
      { name: 'Charcoal', hex: '#202526' },
    ],
    demonstrates: [
      'A drag-to-reveal before/after as the primary proof device',
      'A stepped project gallery carrying the outcomes behind it',
      'Serif display type holding a premium, unhurried tone',
      'A four-step process strip that answers “what actually happens”',
    ],
    hero: {
      base: 'hero',
      widths: W,
      ratio: '16 / 9',
      alt: 'Infinity pool at golden hour beside a low California-modern house',
    },
    pair: {
      beforeLabel: 'Before',
      afterLabel: 'After',
      before: { base: 'before', widths: M, ratio: '16 / 9',
        alt: 'Bare backyard with dry lawn and a plain concrete slab under flat overcast light' },
      after: { base: 'after', widths: M, ratio: '16 / 9',
        alt: 'The same backyard at golden hour with a finished dark-plaster pool and travertine deck' },
    },
    archive: [
      { base: 'aerial', widths: M, ratio: '16 / 9',
        alt: 'Overhead view of a dark-bottom pool with loungers casting long shadows',
        caption: 'Overhead — dark plaster, travertine deck, evening light',
        label: 'From above' },
      { base: 'firepit', widths: M, ratio: '3 / 2',
        alt: 'Outdoor living area at dusk with a linear fire feature beside a pool',
        caption: 'Dusk — linear fire feature and reflecting pool',
        label: 'After dark' },
      { base: 'terrace', widths: M, ratio: '3 / 2',
        alt: 'Shaded pergola terrace with linen furnishings at the pool edge',
        caption: 'Terrace — shaded pergola, linen, pool edge',
        label: 'Outdoor living' },
      { base: 'water', widths: M, ratio: '1 / 1',
        alt: 'Macro of water meeting travertine coping with caustic light patterns',
        caption: 'Detail — water meeting travertine coping',
        label: 'Material' },
    ],
  },

  ridgeline: {
    slug: 'ridgeline',
    name: 'Ridgeline',
    descriptor: 'Roofing',
    direction:
      'Industrial field authority — established, rugged and reliable. Premium construction documentation with graphite roofs, galvanized metal and hard daylight.',
    palette: [
      { name: 'Graphite', hex: '#1D2528' },
      { name: 'Steel', hex: '#758086' },
      { name: 'Bone', hex: '#E8E4DC' },
      { name: 'Safety orange', hex: '#E66A2C' },
      { name: 'Cedar', hex: '#795542' },
    ],
    demonstrates: [
      'An inspection report that swaps found/fixed on the same roof, in place',
      'Credentials placed above the fold, where a roofing buyer looks first',
      'A single-field estimate form instead of a nine-field wall',
    ],
    hero: {
      base: 'hero',
      widths: W,
      ratio: '16 / 9',
      alt: 'Dark shingled residential roof with cedar detailing under overcast sky',
    },
    /* Same roof, same camera. Shown as an in-place swap inside the inspection
       report rather than two gallery steps, which threw away the whole point of
       shooting them as a pair. Deliberately a different mechanic from Sunline's
       wipe so the two builds keep distinct signatures. */
    pair: {
      beforeLabel: 'Found',
      afterLabel: 'Fixed',
      before: { base: 'damage', widths: M, ratio: '16 / 9',
        alt: 'Storm-damaged shingles beside a brick chimney with decking exposed' },
      after: { base: 'repaired', widths: M, ratio: '16 / 9',
        alt: 'The same roof section cleanly re-shingled with tidy flashing and a crisp ridge' },
    },
    archive: [
      { base: 'crew', widths: M, ratio: '3 / 2',
        alt: 'Two roofers in harnesses reviewing an inspection on a residential roof',
        caption: 'Crew — harnessed and anchored, every job',
        label: 'On site' },
      { base: 'shingle', widths: M, ratio: '1 / 1',
        alt: 'Macro of architectural shingle courses meeting a folded metal drip edge',
        caption: 'Material — architectural shingle and metal drip edge',
        label: 'Material' },
    ],
  },

meridian: {
    slug: 'meridian',
    name: 'Meridian',
    descriptor: 'Cabinetry',
    direction:
      'Material archive / architectural atelier — tactile, exact and permanence-driven. A custom millwork studio photographed for an architecture monograph.',
    palette: [
      { name: 'Ink', hex: '#1F2321' },
      { name: 'Warm paper', hex: '#E8E1D6' },
      { name: 'Walnut', hex: '#5A3E2D' },
      { name: 'White oak', hex: '#C8B08A' },
      { name: 'Oxidized brass', hex: '#A98454' },
    ],
    demonstrates: [
      'A material archive the visitor steps through — the product is the proof',
      'Raking light and macro detail doing the persuasion instead of adjectives',
      'Restrained brass accent reserved strictly for actions',
    ],
    hero: {
      base: 'hero',
      widths: W,
      ratio: '16 / 9',
      alt: 'Walnut and stone kitchen with brass hardware in raking afternoon light',
    },
    archive: [
      {
        base: 'project', widths: M, ratio: '3 / 2',
        alt: 'Completed walnut kitchen with stone island',
        caption: 'Project — full-height walnut with a honed stone island',
        label: 'Walnut kitchen',
      },
      {
        base: 'material', widths: M, ratio: '4 / 3',
        alt: 'Macro of a mitred walnut panel edge on warm paper',
        caption: 'Material — rift-sawn walnut, mitred edge, oiled finish',
        label: 'Mitred edge',
      },
      {
        base: 'craft', widths: M, ratio: '4 / 5',
        alt: 'Cabinetmaker handling a walnut panel in the workshop',
        caption: 'Craft — panels selected and matched by hand in the shop',
        label: 'In the shop',
      },
      {
        base: 'interior', widths: M, ratio: '16 / 9',
        alt: 'Kitchen interior with white oak cabinetry and long shadows',
        caption: 'Interior — white oak run, late afternoon',
        label: 'White oak run',
      },
    ],
  },
};

/* The supplied SVG marks, transcribed as paths so they inherit currentColor
   and stay crisp at any size instead of shipping four more network requests. */
export const CONCEPT_MARKS: Record<ConceptSlug, { viewBox: string; d: string[]; extra?: 'sun' }> = {
  sunline: {
    viewBox: '0 0 96 96',
    d: ['M18 39c7-10 17-15 30-15s23 5 30 15', 'M12 50h72'],
    extra: 'sun',
  },
  ridgeline: {
    viewBox: '0 0 96 96',
    d: ['M14 36 48 12l34 24v34H14z', 'M14 36h68M28 70V43h40v27', 'M38 24h20'],
  },
  meridian: {
    viewBox: '0 0 96 96',
    d: ['M18 72V22l30 26 30-26v50', 'M30 72V39M66 72V39'],
  },
};
