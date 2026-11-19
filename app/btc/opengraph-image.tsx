import { ImageResponse } from 'next/og';
import { OgCard, OG_SIZE } from '@/lib/ogcard';
import { ogFonts } from '@/lib/ogfonts';
import { AURORA_STILL } from '@/lib/og-aurora';

/* The card /btc unfurls as in the committee's WhatsApp group. Without it the
   page inherits the homepage's website-pricing card — the opposite of the point. */
export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'BTC committee offer — BOLD Growth Labs';

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="For BTC committee members"
        title="Your website, ready"
        lead="for the"
        accent="BTC launch."
        sub="Redesign $499 with free add-ons. Book by Nov 13 for a free Local Search Launch."
        background={AURORA_STILL}
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
