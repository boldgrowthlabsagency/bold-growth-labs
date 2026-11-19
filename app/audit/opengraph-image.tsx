import { ImageResponse } from 'next/og';
import { OgCard, OG_SIZE } from '@/lib/ogcard';
import { ogFonts } from '@/lib/ogfonts';
import { AURORA_STILL } from '@/lib/og-aurora';

/* The card /audit unfurls as when the link is sent to an owner. Without it the
   page inherits the homepage's website-pricing card — the opposite of the point. */
export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Free growth audit — BOLD Growth Labs';

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Free growth audit"
        title="Find what’s capping"
        lead="your"
        accent="growth."
        sub="Leads, follow-up, ads and admin. Two minutes of taps."
        background={AURORA_STILL}
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
