'use client';
import { MeshGradient } from '@paper-design/shaders-react';
import { useEffect, useState, type ReactNode } from 'react';

/* ============================================================
   AURORA BACKGROUND — two stacked mesh-gradient shaders.

   The one WebGL surface on the site, and it lives only on /apply.
   The main site stays CSS-only (see CLAUDE.md); a single unlisted
   landing page can afford two small canvases.

   · a flowing colour field underneath
   · a swirled, faint sheen on top, blended with `screen` so it
     only ever lightens — this used to be the library's
     `wireframe` layer, which newer versions no longer ship

   Kept cheap for phones arriving from an Instagram story:
   · the layer is `fixed` to the viewport, so a long form does not
     stretch the canvas to the full page height
   · pixel count is capped — a blurred gradient gains nothing from
     a 3x retina buffer
   · a CSS gradient in the same colours paints first, so there is
     never a flash of flat navy while WebGL spins up (or if it
     never does)
   · prefers-reduced-motion freezes both layers (speed 0)

   Palette is the locked brand palette: navy anchor, orange as the
   light source, slate for depth. No new colours.

   Shader visuals powered by @paper-design/shaders-react
   (Apache-2.0) — https://github.com/paper-design/shaders
   ============================================================ */

export const AURORA_COLORS = ['#00022E', '#E8520A', '#0D1C2A', '#00022E', '#B8430A', '#0D1C2A'];
export const AURORA_SHEEN = ['#00022E', '#FFFFFF', '#E8520A', '#00022E'];

type Props = {
  speed?: number;
  sheenOpacity?: number;
  className?: string;
  children?: ReactNode;
};

export function AuroraBackground({ speed = 0.3, sheenOpacity = 0.22, className, children }: Props) {
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotion(!mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const s = motion ? speed : 0;

  return (
    <div className={`relative isolate bg-navy ${className ?? ''}`}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 85% 8%, rgba(232,82,10,.45), transparent 45%), radial-gradient(circle at 10% 90%, rgba(122,42,5,.5), transparent 50%), #00022E',
        }}
      >
        <MeshGradient
          className="absolute inset-0 h-full w-full"
          colors={AURORA_COLORS}
          distortion={0.8}
          swirl={0.1}
          speed={s}
          maxPixelCount={1280 * 1280}
          minPixelRatio={1}
        />
        <MeshGradient
          className="absolute inset-0 h-full w-full"
          style={{ opacity: sheenOpacity, mixBlendMode: 'screen' }}
          colors={AURORA_SHEEN}
          distortion={1}
          swirl={0.9}
          speed={s * 0.66}
          maxPixelCount={960 * 960}
          minPixelRatio={1}
        />
        {/* navy veil: the form sits on top of this, and white-on-orange at 12px
            does not pass contrast. The top stays open so the colour still shows. */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/45 to-navy/75" />
      </div>
      {children}
    </div>
  );
}
