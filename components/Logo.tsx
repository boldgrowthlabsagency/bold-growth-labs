'use client';

import { useId } from 'react';

/* Identity lockup — vector rebuild of the master artwork.
   BOLD is drawn, not typed: tightened tracking, squared counters, and an
   orange rim-light burning up from under the baseline the way the 3D master
   does. The period carries the accent. GROWTH sits in white and LABS in
   orange beneath, tracked out to span the wordmark exactly — that width match
   is forced with textLength, so it stays flush in any font, loaded or not.
   Variants: full | compact | monogram. */

type Variant = 'full' | 'compact' | 'monogram';

export default function Logo({
  variant = 'full',
  light = false,
  className = '',
}: { variant?: Variant; light?: boolean; className?: string }) {
  /* Unique per instance — the navbar renders two of these and the footer a
     third, and duplicate filter ids in one document silently cross-wire. */
  const uid = useId().replace(/[:]/g, '');
  const rim = `bgl-rim-${uid}`;
  const steel = `bgl-steel-${uid}`;
  const gloss = `bgl-gloss-${uid}`;

  const ink = light ? 'var(--bold-slate)' : '#FFFFFF';
  const accent = 'var(--bold-orange)';

  if (variant === 'monogram') {
    return (
      <svg viewBox="0 0 40 40" className={className} role="img" aria-label="BOLD Growth Labs">
        <rect width="40" height="40" rx="9" fill={accent} />
        <path d="M10.00 30.00V10.00H25.11Q26.23 10.00 27.15 10.56Q28.08 11.11 28.65 12.05Q29.22 12.99 29.22 14.11V17.86Q29.22 18.22 29.18 18.54Q29.14 18.86 29.03 19.14Q29.44 19.67 29.72 20.36Q30.00 21.06 30.00 21.75V25.89Q30.00 27.01 29.43 27.95Q28.86 28.89 27.92 29.44Q26.99 30.00 25.86 30.00H10.00ZM14.31 25.67H25.64Q25.64 25.67 25.64 25.67Q25.64 25.67 25.64 25.67V22.00Q25.64 22.00 25.64 22.00Q25.64 22.00 25.64 22.00H14.31Q14.31 22.00 14.31 22.00Q14.31 22.00 14.31 22.00V25.67Q14.31 25.67 14.31 25.67Q14.31 25.67 14.31 25.67ZM14.31 17.67H24.86Q24.86 17.67 24.86 17.67Q24.86 17.67 24.86 17.67V14.33Q24.86 14.33 24.86 14.33Q24.86 14.33 24.86 14.33H14.31Q14.31 14.33 14.31 14.33Q14.31 14.33 14.31 14.33V17.67Q14.31 17.67 14.31 17.67Q14.31 17.67 14.31 17.67Z" fill="#FFFFFF" />
      </svg>
    );
  }

  /* Custom-drawn BOLD wordmark: heavy, high-contrast, squared counters. */
  const letters = (
    <>
      {/* Orbitron 900, outlined. A logo ships as paths, not live text: no
          webfont dependency, no swap on load, and the letterforms cannot be
          substituted on a machine that lacks the face. Normalised to cap height
          so the lockup keeps its vertical rhythm; the width that fell out of
          that (169.30) drives the chip position and the descriptor pin. */}
      <path d="M2.00 41.60V3.00H31.16Q33.32 3.00 35.11 4.07Q36.90 5.14 38.00 6.95Q39.10 8.76 39.10 10.93V18.17Q39.10 18.87 39.02 19.49Q38.94 20.10 38.72 20.64Q39.53 21.66 40.06 23.00Q40.60 24.34 40.60 25.68V33.67Q40.60 35.84 39.50 37.65Q38.40 39.46 36.59 40.53Q34.78 41.60 32.61 41.60H2.00ZM10.31 33.24H32.18Q32.18 33.24 32.18 33.24Q32.18 33.24 32.18 33.24V26.16Q32.18 26.16 32.18 26.16Q32.18 26.16 32.18 26.16H10.31Q10.31 26.16 10.31 26.16Q10.31 26.16 10.31 26.16V33.24Q10.31 33.24 10.31 33.24Q10.31 33.24 10.31 33.24ZM10.31 17.80H30.68Q30.68 17.80 30.68 17.80Q30.68 17.80 30.68 17.80V11.36Q30.68 11.36 30.68 11.36Q30.68 11.36 30.68 11.36H10.31Q10.31 11.36 10.31 11.36Q10.31 11.36 10.31 11.36V17.80Q10.31 17.80 10.31 17.80Q10.31 17.80 10.31 17.80Z" />
      <path d="M54.27 41.60Q52.10 41.60 50.29 40.53Q48.48 39.46 47.41 37.65Q46.34 35.84 46.34 33.67V10.93Q46.34 8.76 47.41 6.95Q48.48 5.14 50.29 4.07Q52.10 3.00 54.27 3.00H77.00Q79.15 3.00 80.95 4.07Q82.74 5.14 83.84 6.95Q84.94 8.76 84.94 10.93V33.67Q84.94 35.84 83.84 37.65Q82.74 39.46 80.95 40.53Q79.15 41.60 77.00 41.60ZM54.65 33.24H76.52Q76.52 33.24 76.52 33.24Q76.52 33.24 76.52 33.24V11.36Q76.52 11.36 76.52 11.36Q76.52 11.36 76.52 11.36H54.65Q54.65 11.36 54.65 11.36Q54.65 11.36 54.65 11.36V33.24Q54.65 33.24 54.65 33.24Q54.65 33.24 54.65 33.24Z" />
      <path d="M90.89 41.60V2.95H99.20V33.24H129.49V41.60Z" />
      <path d="M132.70 41.60V3.00H163.32Q165.49 3.00 167.30 4.07Q169.11 5.14 170.20 6.95Q171.30 8.76 171.30 10.93V33.67Q171.30 35.84 170.20 37.65Q169.11 39.46 167.30 40.53Q165.49 41.60 163.32 41.60ZM140.96 33.24H162.89Q162.89 33.24 162.89 33.24Q162.89 33.24 162.89 33.24V11.36Q162.89 11.36 162.89 11.36Q162.89 11.36 162.89 11.36H140.96Q140.96 11.36 140.96 11.36Q140.96 11.36 140.96 11.36V33.24Q140.96 33.24 140.96 33.24Q140.96 33.24 140.96 33.24Z" />
    </>
  );

  /* One lockup, one viewBox — the descriptor cannot drift out of alignment
     because it is measured against the wordmark in the same coordinate space. */
  const lockup = (
    <svg viewBox="0 0 185.80 64" height="100%" role="img" aria-label="BOLD Growth Labs">
      <defs>
        <filter id={rim} x="-15%" y="-20%" width="130%" height="165%">
          <feGaussianBlur stdDeviation="1.9" />
        </filter>

        {/* Chrome. userSpaceOnUse so one continuous ramp runs across all four
            letters — per-glyph bounding boxes would step the highlight. The
            dark stop at .46 flipping straight to white at .485 is the horizon
            line — that hard edge, not the fade, is what reads as metal. */}
        <linearGradient id={steel} gradientUnits="userSpaceOnUse" x1="0" y1="3" x2="0" y2="41.6">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".26" stopColor="#F4F7FB" />
          <stop offset=".46" stopColor="#C7D2E0" />
          <stop offset=".485" stopColor="#FFFFFF" />
          <stop offset=".64" stopColor="#FBFCFE" />
          <stop offset=".86" stopColor="#E3E9F1" />
          <stop offset="1" stopColor="#C6D0DD" />
        </linearGradient>

        {/* The period is a 9-unit chip — too small to carry a horizon, so it
            gets a soft top-lit ramp and a discrete highlight instead. */}
        <linearGradient id={gloss} gradientUnits="userSpaceOnUse" x1="0" y1="32.6" x2="0" y2="41.6">
          <stop offset="0" stopColor="var(--bold-orange-lit)" />
          <stop offset=".42" stopColor="var(--bold-orange)" />
          <stop offset="1" stopColor="var(--bold-orange-deep)" />
        </linearGradient>
      </defs>

      {/* rim-light: the master art burns orange up from under the letterforms.
          Skipped on light grounds, where a glow reads as a printing fault. */}
      {!light && (
        <g transform="translate(0 2.6)" fill={accent} filter={`url(#${rim})`} opacity=".6">
          {letters}
        </g>
      )}

      <g fill={light ? ink : `url(#${steel})`}>{letters}</g>
      {/* the accent lives in the period */}
      <rect x="175.80" y="32.6" width="9" height="9" rx="1.8" fill={light ? accent : `url(#${gloss})`} />
      {!light && (
        <rect x="177.00" y="33.5" width="6.6" height="2.6" rx="1.3" fill="#FFFFFF" opacity=".34" />
      )}

      {/* Descriptor. textLength pins it to the exact width of the letterforms
          (x2 → x171.30), so it stays flush with the outlined wordmark above. */}
      <text
        x="2" y="59.5" textLength="169.30" lengthAdjust="spacing"
        fontFamily="var(--font-sans)" fontSize="17" fontWeight="500"
      >
        <tspan fill={light ? 'var(--bold-slate)' : '#FFFFFF'}>GROWTH</tspan>
        <tspan fill={accent}> LABS</tspan>
      </text>
    </svg>
  );

  /* 185.80 : 64 — width is derived from height so the ratio can never drift. */
  if (variant === 'compact') {
    return <span className={`block h-[27px] w-[78.4px] ${className}`}>{lockup}</span>;
  }
  return <span className={`block h-[34px] w-[98.7px] ${className}`}>{lockup}</span>;
}
