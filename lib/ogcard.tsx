/* ============================================================
   SHARED OPEN GRAPH CARD

   The three unlisted pages are links you SEND to one person, so
   the card that unfurls in Messages or email is the first thing
   they read. Left alone they all inherited the homepage's card —
   "Websites Built to Make People Stop", the marketing blurb and
   the logo lockup — which makes a client think you have sent
   them your own advert rather than something addressed to them.

   Rendered rather than designed, so there is no image asset to
   keep in sync with the copy. ImageResponse supports flexbox
   only, and every element with more than one child needs an
   explicit display, hence the verbosity.
   ============================================================ */

import { BOLD_MARK } from './og-mark';

export const OG_SIZE = { width: 1200, height: 630 };

export function OgCard({
  eyebrow,
  title,
  accent,
  sub,
  background,
}: {
  eyebrow: string;
  title: string;
  /** the words carried in orange — the site sets every heading this way */
  accent?: string;
  sub: string;
  /** a full-bleed still behind the card (data URI); a navy veil keeps the text legible */
  background?: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '76px 84px',
        backgroundColor: '#00022E',
        backgroundImage:
          'radial-gradient(circle at 78% 4%, rgba(232,82,10,0.38) 0%, rgba(0,2,46,0) 58%)',
        fontFamily: 'Archivo',
        position: 'relative',
      }}
    >
      {background ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={background} width={1200} height={630} alt=""
            style={{ position: 'absolute', top: -76, left: -84, width: 1200, height: 630, objectFit: 'cover' }} />
          {/* offsets undo the card's padding: satori positions absolute children inside it */}
          <div style={{ display: 'flex', position: 'absolute', top: -76, left: -84, width: 1200, height: 630,
            backgroundImage: 'linear-gradient(90deg, rgba(0,2,46,0.72) 0%, rgba(0,2,46,0.38) 60%, rgba(0,2,46,0) 100%)' }} />
        </>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', width: 44, height: 3, backgroundColor: '#E8520A' }} />
        <div
          style={{
            marginLeft: 18,
            fontSize: 21,
            letterSpacing: 6,
            color: '#E8520A',
            fontWeight: 800,
          }}
        >
          {eyebrow.toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            fontSize: 84,
            lineHeight: 1.04,
            /* the site's display scale: 800 weight, tight negative tracking */
            letterSpacing: -3.4,
            fontWeight: 800,
            color: '#FFFFFF',
            maxWidth: 960,
          }}
        >
          <span style={{ marginRight: accent ? 20 : 0 }}>{title}</span>
          {accent ? <span style={{ color: '#E8520A' }}>{accent}</span> : null}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 26,
            fontSize: 29,
            lineHeight: 1.42,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.62)',
            maxWidth: 820,
          }}
        >
          {sub}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BOLD_MARK} width={236} height={47} alt="BOLD." />
          <div
            style={{
              display: 'flex',
              marginTop: 8,
              fontSize: 17,
              letterSpacing: 7,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            GROWTH LABS
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.4)' }}>
          boldgrowthlabs.io
        </div>
      </div>
    </div>
  );
}
