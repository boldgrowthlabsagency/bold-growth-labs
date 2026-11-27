import { ImageResponse } from 'next/og';
import { OgCard, OG_SIZE } from '@/lib/ogcard';
import { ogFonts } from '@/lib/ogfonts';

/* Its own card, like every other unlisted page: without one, a link sent to a
   single client unfurls as the homepage advert. */
export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Website Care Plan — BOLD Growth Labs';

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Your website, looked after"
        title="The"
        accent="Care Plan."
        sub="Hosting, changes and a monthly check. $70 a month, cancel any time."
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
