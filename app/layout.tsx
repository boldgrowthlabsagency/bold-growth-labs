import type { Metadata, Viewport } from 'next';
import './globals.css';

/* Each concept build carries its own complete stylesheet. They are separate
   files on purpose — the four brands share no visual DNA, and keeping them
   apart is what stops a shared rule quietly pulling them back toward a common
   template. Every selector inside is namespaced (sun-/rdg-/nor-/mrd-). */
import './concepts/sunline.css';
import './concepts/ridgeline.css';
import './concepts/meridian.css';

const SITE = 'https://boldgrowthlabs.io';
const TITLE = 'BOLD Growth Labs | Websites Built to Make People Stop';
const DESC =
  'BOLD Growth Labs builds high-performance websites, landing pages, brands, and digital growth systems designed to get businesses noticed and turn attention into action.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  alternates: { canonical: SITE },
  openGraph: {
    title: TITLE, description: DESC, url: SITE, siteName: 'BOLD Growth Labs',
    type: 'website', locale: 'en_US',
    images: [{ url: '/logo-lockup.png', width: 1536, height: 1024, alt: 'BOLD Growth Labs' }],
  },
  twitter: {
    card: 'summary_large_image', title: TITLE, description: DESC,
    images: ['/logo-lockup.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { themeColor: '#00022E', width: 'device-width', initialScale: 1 };

const schema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'BOLD Growth Labs',
  description: DESC,
  url: SITE,
  email: 'boldgrowthlabs@gmail.com',
  areaServed: 'US',
  slogan: 'Websites built to make people stop.',
  makesOffer: [
    { '@type': 'Offer', name: 'Landing Page', price: '400', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Website Redesign', price: '699', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Custom Build', price: '999', priceCurrency: 'USD' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Webfonts load asynchronously so they never block first paint. The
            system stack in globals.css is metric-compatible enough that the
            swap is not jarring. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          media="print"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap"
          // eslint-disable-next-line react/no-unknown-property
          onLoad={undefined}
        />
        <noscript>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" />
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('link[media="print"]').forEach(function(l){l.media='all'})});`,
          }}
        />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded focus:bg-orange focus:px-4 focus:py-2">
          Skip to content
        </a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </body>
    </html>
  );
}
