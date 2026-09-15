import { ImageResponse } from 'next/og';
import { OgCard, OG_SIZE } from '@/lib/ogcard';
import { ogFonts } from '@/lib/ogfonts';

/* The card this page unfurls as when the link is pasted somewhere. Without it
   the page inherits the homepage's card and a client thinks they have been
   sent an advert rather than something meant for them. */
export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Tell us about the work — BOLD Growth Labs';

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Project questionnaire"
        title="Tell us about"
        accent="the work"
        sub="Enough for us to start building. About four minutes, mostly tapping an option."
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
