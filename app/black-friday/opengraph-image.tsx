import { ImageResponse } from 'next/og';
import { OgCard, OG_SIZE } from '@/lib/ogcard';
import { ogFonts } from '@/lib/ogfonts';
import { AURORA_STILL } from '@/lib/og-aurora';

/* The card /black-friday unfurls as when the link is shared. Without it the
   page inherits the homepage's website-pricing card — the opposite of the point. */
export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Black Friday special — BOLD Growth Labs';

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Black Friday special"
        title="Website redesigns"
        lead="now"
        accent="$499."
        sub="Normally $699. Everything else on sale too. Ends Cyber Monday, Nov 30."
        background={AURORA_STILL}
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
