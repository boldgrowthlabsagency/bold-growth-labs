'use client';
import { useEffect, useRef, useState } from 'react';

/* ============================================================
   CONCEPT KIT

   Deliberately almost empty. The previous version of this section
   shared a nav, a photo band, a footer and a gallery across all
   the builds, and that shared spine was exactly what made them
   read as one template in three colourways.

   So what survives here is only the stuff that has no visual
   opinion: an <img> that emits a correct srcset, and two hooks for
   scroll and pointer. Every pixel of layout, type, chrome, motion
   and colour lives inside the individual brand files, where it
   can diverge without anything pulling it back to a mean.
   ============================================================ */

export type Slug = 'sunline' | 'ridgeline' | 'meridian';

/* Widths actually on disk, per image. Asking for a file that was never
   generated is a 404 the browser silently ignores, so this is not optional
   bookkeeping — it is the contract. */
export const ASSETS: Record<Slug, Record<string, number[]>> = {
  sunline: {
    hero: [640, 1280, 1920, 2560], aerial: [640, 1280, 1920, 2560],
    before: [640, 1280, 1920, 2560], after: [640, 1280, 1920, 2560],
    firepit: [640, 1280, 1920], terrace: [640, 1280, 1920], water: [640, 1280, 1920],

    /* SUNLINE HOUSE — Palm Springs. One project, six camera positions off a
       single fixed description, so the set genuinely reads as one place.
       Masters arrive at 1376px. The 1920 step is a lanczos upscale with light
       unsharp — it adds no detail, but it stops the browser stretching a 1280
       file at runtime on a 2x display, which is what was reading as blocky.
       Regenerating the plates above 2K is the only real fix. */
    hswide: [640, 1280, 1920], hsskim: [640, 1280, 1920], hsdrone: [640, 1280, 1920],
    hsspa: [640, 1280, 1920], hspavilion: [640, 1280, 1920], hsgrove: [640, 1280, 1920],

  },
  ridgeline: {
    hero: [640, 1280, 1920, 2560], roofline: [640, 1280, 1920, 2560],
    damage: [640, 1280, 1920, 2560], repaired: [640, 1280, 1920, 2560],
    project: [640, 1280, 1920], crew: [640, 1280, 1920], shingle: [640, 1280, 1920],
    /* Whole-house survey pair, camera-locked. Replaces the shingle-level
       damage/repaired pair in the wipe — a torn shingle is invisible at page
       scale, a whole roof is not. */
    beforeproject: [640, 1280, 1920, 2560], afterproject: [640, 1280, 1920, 2560],
    /* Service row thumbnails — small boxes, so the ladder stops at 1280. */
    svcreroof: [640, 1280], svcstorm: [640, 1280], svcrepair: [640, 1280],
    svcgutter: [640, 1280], svcinspect: [640, 1280],
  },
meridian: {
    hero: [640, 1280, 1920, 2560], interior: [640, 1280, 1920, 2560],
    project: [640, 1280, 1920], material: [640, 1280, 1920], craft: [640, 1280],
    /* Elevation linework traced from `interior`, so the two plates share one
       camera exactly and the wipe between them is pixel-registered. */
    drawing: [640, 1280, 1920],

    /* Selected Kitchens — four single photographs at 1200x896, so the ladder is
       640 plus the native 1200. No upscaling anywhere: an earlier set arrived as
       one contact sheet holding all three kitchens, which left each plate 408px
       wide and forced the layout around it. */
    kitchenwalnut: [640, 1200], kitchencherry: [640, 1200],
    kitchenwenge: [640, 1200], kitchenmaple: [640, 1200],
  },
};

/* Not everything is a photograph. Line art stays PNG (12KB, and JPEG would ring
   along every edge); the softened study is a JPEG because it is a blurred
   photograph and PNG would be enormous. Anything unlisted is webp. */
export const ASSET_EXT: Partial<Record<Slug, Record<string, string>>> = {
  meridian: { drawing: 'png' },
};

/* Portrait crops.

   A 16:9 photograph filling a tall box on a phone is the worst case in
   responsive imagery: `object-fit: cover` scales it until its HEIGHT matches
   the box, so a 402pt-wide viewport is actually rendering ~1740pt of image
   width and throwing three-quarters of it away off-screen. `sizes="100vw"`
   tells the browser 402pt, it fetches a 1280 file, and what you see is a
   centre slice upscaled roughly four times. Measured on a 402x874 phone the
   Sunline hero was landing at 0.24x — visibly soft, exactly as reported.

   A landscape master cannot fix this: cropping 2560x1440 to 9:16 yields only
   810px of width, so no wider file exists to fetch. What DOES fix it is
   shipping the crop itself. The portrait variant is already the shape of the
   box, so nothing is cover-scaled and every pixel fetched is a pixel shown —
   sharper AND smaller than sending the full landscape frame.

   Only call sites that actually render tall on a phone pass `tall`. A wide
   box would be made worse by a portrait source, not better. */
const PORTRAIT_WIDTHS = [405, 608, 810];

type ImgProps = {
  slug: Slug;
  name: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  /** this image covers a TALL box on phones — serve the portrait crop there */
  tall?: boolean;
};

/** A plain responsive <img>. No wrapper, no caption, no aspect ratio, no opinion. */
export function Img({ slug, name, alt, sizes = '100vw', className = '', priority, style, tall }: ImgProps) {
  const widths = ASSETS[slug]?.[name] ?? [1280];
  const ext = ASSET_EXT[slug]?.[name] ?? 'webp';
  const url = (w: number) => `/concepts/${slug}/${name}-${w}.${ext}`;
  const purl = (w: number) => `/concepts/${slug}/${name}-p${w}.${ext}`;

  const img = (
    <img
      src={url(widths[Math.min(1, widths.length - 1)])}
      srcSet={widths.map((w) => `${url(w)} ${w}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      className={className}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
    />
  );

  if (!tall || !PORTRAIT[slug]?.includes(name)) return img;

  return (
    <picture>
      <source
        media="(max-width: 900px) and (orientation: portrait)"
        srcSet={PORTRAIT_WIDTHS.map((w) => `${purl(w)} ${w}w`).join(', ')}
        sizes="100vw"
        type={`image/${ext === "jpg" ? "jpeg" : ext}`}
      />
      {img}
    </picture>
  );
}

/** Names that have a portrait crop on disk. Fetching one that doesn't exist is
    a silent 404 and a broken image, so this list is the contract. */
const PORTRAIT: Record<Slug, string[]> = {
  sunline: ['hero', 'aerial', 'firepit', 'terrace', 'before', 'after'],
  ridgeline: ['hero', 'roofline', 'project', 'crew', 'damage', 'repaired', 'beforeproject', 'afterproject'],
  meridian: ['hero', 'interior', 'project', 'material', 'drawing'],
};

/** 0→1 as `ref` travels through the viewport. Used for scroll-driven sequences. */
export function useProgress<T extends HTMLElement>(ref: React.RefObject<T>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setP(1); return; }

    let raf = 0;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setP(span <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / span)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };

    /* The concept runs inside a scrolling panel, not the document, so listen on
       whichever ancestor actually scrolls rather than assuming window. */
    let node: HTMLElement | null = el.parentElement;
    let scroller: HTMLElement | Window = window;
    while (node) {
      const o = getComputedStyle(node).overflowY;
      if (o === 'auto' || o === 'scroll') { scroller = node; break; }
      node = node.parentElement;
    }
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    read();
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return p;
}

/** Fires once when `ref` first enters view. For one-shot reveals. */
export function useSeen<T extends HTMLElement>(ref: React.RefObject<T>, margin = '-12%') {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { rootMargin: `0px 0px ${margin} 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, margin]);
  return seen;
}

/** Normalised pointer position over `ref`, 0→1 on each axis. */
export function usePointer<T extends HTMLElement>(ref: React.RefObject<T>) {
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      setPt({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    };
    const out = () => setPt(null);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', out);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', out); };
  }, [ref]);
  return pt;
}

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
/** map n from [a,b] to [0,1], clamped — the workhorse of scroll choreography */
export const range = (n: number, a: number, b: number) => clamp01((n - a) / (b - a));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Marks every concept as fiction. Styled per brand; never omitted. */
export function useLockedRef() { return useRef<HTMLDivElement>(null); }

/* ============================================================
   DIAGONAL WIPE — the mechanism only, never the look.

   Sunline's transformation section is the strongest thing in the
   builds, so Ridgeline and Meridian now use the
   same device. What is shared here is strictly the geometry: turn
   a 0→1 progress into the two clip-paths that reveal one stacked
   plate over another along a leaning edge.

   Everything that carries brand — how tall the stage is, the
   frame, the labels, the seam colour, how fast the edge travels —
   stays in each brand's own file. That is the line the kit has
   always held, and a shared *look* here would undo exactly what
   these builds exist to prove.

   The edge leans rather than running straight down: a vertical bar
   reads as a UI control, a raked one reads as a wipe.
   ============================================================ */
export function diagonalWipe(reveal: number, lean = 3.2) {
  const edge = mix(-8, 108, reveal);   // leading edge, % of stage width
  const top = edge + lean;
  const bot = edge - lean;
  return {
    /** clip for the plate being revealed (stacked above the base plate) */
    afterClip: `polygon(0% 0%, ${top.toFixed(2)}% 0%, ${bot.toFixed(2)}% 100%, 0% 100%)`,
    /** a 2px sliver riding the edge, for a lit seam */
    seamClip:
      `polygon(calc(${top.toFixed(2)}% - 1px) 0%, calc(${top.toFixed(2)}% + 1px) 0%, ` +
      `calc(${bot.toFixed(2)}% + 1px) 100%, calc(${bot.toFixed(2)}% - 1px) 100%)`,
  };
}
