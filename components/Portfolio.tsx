'use client';
import { useState } from 'react';
import { projects } from '@/lib/data';
import type { ConceptSlug } from '@/lib/concepts';
import SectionReveal from './SectionReveal';
import MagneticButton from './MagneticButton';
import ConceptModal from './ConceptModal';
import Sunline from './concepts/Sunline';
import Ridgeline from './concepts/Ridgeline';
import Meridian from './concepts/Meridian';

/* ============================================================
   THE INVITATION

   This used to be four rounded cards, each showing a ~0.4x live
   miniature of its concept behind a browser-chrome mockup. Two
   problems with that. A miniature at 6.5px type is unreadable, so
   the card was selling a thumbnail rather than a build. And four
   identical frames around the builds made the builds themselves
   look identical — the chrome was the loudest thing on screen.

   So the frames are gone. Each concept is now a wide cinematic
   band carrying one photograph from its own campaign, its own
   brand-coloured accent, and an invitation to enter. The builds
   behind them are full-screen experiences, so the entry point
   should feel like a door, not a thumbnail.
   ============================================================ */

const CONCEPTS: Record<string, () => JSX.Element> = {
  sunline: Sunline,
  ridgeline: Ridgeline,
  meridian: Meridian,
};

/* One still per brand, pulled from that brand's own photography, plus the
   accent it uses for actions. Nothing here is shared between them. */
const DOOR: Record<ConceptSlug, {
  shot: string; widths: number[]; accent: string; ink: string;
  kicker: string; line: string; alt: string;
}> = {
  sunline: {
    shot: 'hero', widths: [640, 1280, 1920, 2560],
    accent: '#D89A4A', ink: '#F3EEE5',
    kicker: 'Luxury outdoor living',
    line: 'Your backyard. Reimagined.',
    alt: 'Infinity pool at golden hour beside a low California-modern house',
  },
  ridgeline: {
    shot: 'roofline', widths: [640, 1280, 1920, 2560],
    accent: '#E66A2C', ink: '#E8E4DC',
    kicker: 'Roofing & exteriors',
    line: 'Protect what matters most.',
    alt: 'Dark shingled residential roof with clean ridge geometry under overcast sky',
  },
meridian: {
    shot: 'interior', widths: [640, 1280, 1920, 2560],
    accent: '#A98454', ink: '#E8E1D6',
    kicker: 'Custom millwork',
    line: 'Built once. Built right.',
    alt: 'White oak kitchen with a stone island and long raking shadows',
  },
};

export default function Portfolio() {
  const [open, setOpen] = useState<ConceptSlug | null>(null);

  const renderConcept = (slug: ConceptSlug) => {
    const C = CONCEPTS[slug];
    return C ? <C /> : null;
  };

  return (
    <section id="work" className="section relative overflow-hidden" style={{ background: 'var(--bold-slate)' }}>
      <div className="shell relative z-[2]">
        <SectionReveal><p className="eyebrow mb-6">Proof of concept</p></SectionReveal>
        <SectionReveal delay={60}>
          <h2 className="display max-w-[14ch]">
            Three businesses. <span className="text-orange">Three websites.</span>
          </h2>
        </SectionReveal>
        <SectionReveal delay={110}>
          <p className="lede mt-6">
            Not one layout in three colourways. Each of these was designed from its own
            business, its own audience and its own way of proving something &mdash; separate
            typography, separate photography, separate interaction, separate everything.
          </p>
        </SectionReveal>
        <SectionReveal delay={150}>
          <p className="mt-4 max-w-[62ch] text-sm text-muted">
            All three businesses are fictional. We don&rsquo;t put a real company&rsquo;s name on work
            they didn&rsquo;t commission.
          </p>
        </SectionReveal>
      </div>

      {/* full-bleed doors — deliberately outside .shell */}
      <div className="doors mt-16">
        {projects.map((p, i) => {
          const d = DOOR[p.slug as ConceptSlug];
          if (!d) return null;
          const src = (w: number) => `/concepts/${p.slug}/${d.shot}-${w}.webp`;
          return (
            <SectionReveal key={p.slug} delay={i * 60}>
              <button
                type="button"
                className="door"
                style={{ ['--door-accent' as string]: d.accent, ['--door-ink' as string]: d.ink }}
                onClick={() => setOpen(p.slug as ConceptSlug)}
                data-cursor="open"
              >
                <span className="door__frame">
                  <img
                    className="door__img"
                    src={src(1280)}
                    srcSet={d.widths.map((w) => `${src(w)} ${w}w`).join(', ')}
                    sizes="100vw"
                    alt={d.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </span>

                <span className="door__body">
                  <span className="door__no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="door__kicker">{d.kicker}</span>
                  <span className="door__name">
                    {p.client} <em>{p.italic}</em>
                  </span>
                  <span className="door__line">{d.line}</span>
                  <span className="door__copy">{p.copy}</span>
                  <span className="door__tags">
                    {p.tags.map((t) => <span key={t}>{t}</span>)}
                  </span>
                  <span className="door__enter">
                    Enter the experience <span aria-hidden>→</span>
                  </span>
                </span>

                <span className="door__badge">Concept build</span>
              </button>
            </SectionReveal>
          );
        })}
      </div>

      <div className="shell relative z-[2]">
        <SectionReveal delay={120}>
          <div className="cta-rail mt-16">
            <div>
              <h3 className="cta-rail__h">Want one of these built for your business?</h3>
              <p className="cta-rail__p">Tell us the business and the outcome. We&rsquo;ll tell you what it takes.</p>
            </div>
            <div className="cta-rail__btns">
              <MagneticButton href="#contact">Get your website built</MagneticButton>
              <MagneticButton href="#pricing" variant="ghost" arrow={false}>See pricing</MagneticButton>
            </div>
          </div>
        </SectionReveal>
      </div>

      <ConceptModal
        slug={open}
        onClose={() => setOpen(null)}
        onNavigate={(s) => setOpen(s)}
        render={renderConcept}
      />
    </section>
  );
}
