import { ImageResponse } from 'next/og';
import { OgCard, OG_SIZE } from '@/lib/ogcard';
import { ogFonts } from '@/lib/ogfonts';
import { AURORA_STILL } from '@/lib/og-aurora';

/* The card /apply unfurls as when the link is shared in a DM. Without it the
   page inherits the homepage's marketing card and nobody can tell it's a job. */
export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Now hiring: Appointment Center Rep — BOLD Growth Labs';

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Now hiring"
        title="Appointment Center"
        accent="Rep"
        sub="Flexible hours. One minute to apply."
        background={AURORA_STILL}
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
