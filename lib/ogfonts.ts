/* ============================================================
   FONTS FOR THE OPEN GRAPH CARDS

   Satori ships no fonts. Left alone it falls back to its own
   default, ignores fontWeight, and the card heading renders in a
   light generic sans that looks nothing like the site — which is
   exactly what these cards looked like before.

   These are the same Archivo weights the site loads (see the
   webfont link in app/layout.tsx), so a card and the page it
   links to are set in one typeface.

   TrueType, not WOFF2 — satori does not read WOFF2, and Google
   Fonts will happily serve EOT or WOFF2 depending on the user
   agent you ask with. Fetched via `new URL(..., import.meta.url)`
   so the bytes are bundled at build time rather than pulled over
   the network while a card is rendering; a failed fetch inside an
   edge OG route returns an empty 200, not an error.
   ============================================================ */

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600 | 800;
  style: 'normal';
};

export async function ogFonts(): Promise<OgFont[]> {
  const [extraBold, semiBold] = await Promise.all([
    fetch(new URL('./ogfonts/Archivo-ExtraBold.ttf', import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL('./ogfonts/Archivo-SemiBold.ttf', import.meta.url)).then((r) => r.arrayBuffer()),
  ]);
  return [
    { name: 'Archivo', data: extraBold, weight: 800, style: 'normal' },
    { name: 'Archivo', data: semiBold, weight: 600, style: 'normal' },
  ];
}
