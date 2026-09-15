import { ImageResponse } from 'next/og';
import { OgCard, OG_SIZE } from '@/lib/ogcard';
import { ogFonts } from '@/lib/ogfonts';

/* The card this page unfurls as when the link is pasted somewhere. Without it
   the page inherits the homepage's card and a client thinks they have been
   sent an advert rather than something meant for them. */
export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'How the review system works — BOLD Growth Labs';

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Reviews and reputation"
        title="How reviews reach"
        accent="your website"
        sub="From a finished job to a review on your website, step by step."
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
