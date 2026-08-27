/* ------------------------------------------------------------------
   CONFIGURE ME — set the real number before launch. Used by every
   "Call BOLD" action on the site. Left as a placeholder deliberately:
   we do not invent phone numbers.
   ------------------------------------------------------------------ */
export const PHONE = '+18583157718';
export const PHONE_DISPLAY = '858.315.7718';

/* How long a punchline sits fully assembled before it leaves, in ms — the
   reading window, not the whole cycle. The build-up (lead wipe, the beat
   before the accent, the goo morph, the supporting line) and the exit add
   roughly 5.6s on top, so the full cycle is about this plus 5.6s. */
export const PUNCHLINE_HOLD_MS = 3800;

/* Where enquiries land. */
export const INBOX = 'boldgrowthlabs@gmail.com';

/* Enquiries are posted to /api/contact, which forwards them to the Apps Script
   bound to the enquiries spreadsheet. The script URL lives in the Vercel
   environment variable SHEETS_WEBHOOK_URL — server-side only, because it is an
   unauthenticated write endpoint and anything in the client bundle is public.
   Setup: docs/GOOGLE-SHEET-SETUP.md */

export const NEEDS = [
  'New Website', 'Website Redesign', 'Landing Page', 'SEO',
  'AI Search', 'AI / Automation', 'Branding', 'Not Sure Yet',
];

/* ============================================================
   All site content lives here. Edit copy and pricing without
   touching a single component.
   ============================================================ */

export type Punchline = { headline: string; accent: string; supporting: string };

/* Each entry is ONE complete visual composition — headline + supporting copy
   transition together as a unit, never as independent sentences. */
export const punchlines: Punchline[] = [
  {
    headline: 'Built to make',
    accent: 'people stop.',
    supporting: 'You just did. Imagine that working for your business.',
  },
  {
    headline: 'Your website has',
    accent: 'one job.',
    supporting: 'Get attention. Keep it. Turn it into business.',
  },
  {
    headline: 'Your business',
    accent: 'evolved.',
    supporting: 'Your website should have too.',
  },
  {
    headline: 'You built something',
    accent: 'worth choosing.',
    supporting: 'Now build a website that makes people see it.',
  },
];

export const laptopBeats = [
  'A website should do more than look good.',
  'It should make people trust you.',
  'And make them take action.',
];

export type Pill = { label: string; detail: string };
export const pills: Pill[] = [
  { label: 'Mobile-first',       detail: 'Designed for the screen most of your customers actually use.' },
  { label: 'Fast loading',       detail: 'Every asset budgeted. Slow sites lose people before they read a word.' },
  { label: 'SEO-ready',          detail: 'Built with the technical foundation search engines expect.' },
  { label: 'AI-search ready',    detail: 'Structured so AI assistants can find and cite you correctly.' },
  { label: 'Conversion-focused', detail: 'Every page has one obvious next step.' },
  { label: 'Contact forms',      detail: 'Routed where you will actually see them.' },
  { label: 'Click-to-call',      detail: 'One tap from interested to on the phone with you.' },
  { label: 'Analytics',          detail: 'You see what people do, not what we guess they did.' },
  { label: 'Google integration', detail: 'Maps, hours and reviews wired in and current.' },
  { label: 'Social integration', detail: 'Your feeds and profiles connected, not orphaned.' },
  { label: 'Secure hosting',     detail: 'HTTPS, backups and uptime handled.' },
  { label: 'Custom domain',      detail: 'Your name, connected properly, no subdomains.' },
  { label: 'Accessibility',      detail: 'Keyboard, contrast and screen readers taken seriously.' },
  { label: 'Performance tuned',  detail: 'Measured against Lighthouse, not vibes.' },
  { label: 'CMS ready',          detail: 'Change your own copy without calling anyone.' },
  { label: 'Easy updates',       detail: 'Plain-English handover so nothing is a mystery.' },
];

export type Service = { n: string; title: string; copy: string };
export const services: Service[] = [
  { n: '01', title: 'Websites',       copy: 'High-converting websites designed around the customer journey.' },
  { n: '02', title: 'Landing Pages',  copy: 'Focused pages built to turn campaigns and traffic into leads.' },
  { n: '03', title: 'Redesigns',      copy: 'Modernize an outdated website without losing what already works.' },
  { n: '04', title: 'Brand Identity', copy: 'Typography, visual systems, logos and digital assets that make businesses memorable.' },
  { n: '05', title: 'SEO',            copy: 'Technical and local search foundations that help businesses get discovered.' },
  { n: '06', title: 'AI & Automation',copy: 'Smart systems that help businesses capture, qualify and follow up with leads.' },
];

export type Step = { n: string; title: string; copy: string };
export const steps: Step[] = [
  { n: '01', title: 'Discover', copy: 'We understand your business, customers, goals and competitive landscape.' },
  { n: '02', title: 'Design',   copy: 'We create the visual direction, messaging, structure and user experience.' },
  { n: '03', title: 'Build',    copy: 'We develop the site, animations, integrations, SEO foundation and responsive experience.' },
  { n: '04', title: 'Launch',   copy: 'We test everything, optimize performance, connect your tools and launch.' },
];

export type Project = {
  slug: 'sunline' | 'ridgeline' | 'meridian';
  client: string; italic: string; category: string;
  copy: string; tags: string[];
};
/* Concept builds — fictional businesses. Each renders a dedicated component
   under components/concepts with its own identity and interaction. */
export const projects: Project[] = [
  {
    slug: 'sunline', client: 'Sunline', italic: 'Pools & Patios', category: 'Custom pool design & build',
    copy: 'A backyard is the biggest purchase most families make after the house itself, so the site has to earn that trust before it asks for anything. Serif editorial direction, a drag-to-compare before/after, and a build sequence that shows exactly what happens after the deposit.',
    tags: ['Before / After Reveal', 'Project Gallery', 'Editorial Serif', 'Build Timeline'],
  },
  {
    slug: 'ridgeline', client: 'Ridgeline', italic: 'Roofing', category: 'Roofing & exteriors',
    copy: 'Roofing buyers are comparison shopping under time pressure, often after damage. Licence number, bonding and warranty sit above the fold, and an interactive inspection walks a homeowner through what actually gets found on a roof and what fixing it involves.',
    tags: ['Interactive Inspection', 'Found / Fixed Proof', 'Trust-First Layout', 'Inline Estimate'],
  },
  {
    slug: 'meridian', client: 'Meridian', italic: 'Cabinetry', category: 'Custom millwork & cabinetry',
    copy: 'Millwork is chosen on material, so material is the interface. An architectural grid, wide-tracked type, and a finish explorer that swaps the rendered panel in real time — walnut, white oak, fumed ash, bone lacquer.',
    tags: ['Material Archive', 'Architectural Grid', 'Spec Detail', 'Brass & Walnut'],
  },
];


export type Plan = {
  id: string; name: string; price: number; priceLabel: string; from?: boolean;
  blurb: string; features: string[]; cta: string; featured?: boolean; tiers?: string[];
};
export const plans: Plan[] = [
  {
    id: 'landing', name: 'Landing Page', price: 400, priceLabel: '$400',
    blurb: 'For solo professionals, campaigns and businesses that need a focused online presence.',
    features: [
      'One professionally designed page', 'Mobile-first responsive design', 'Contact form',
      'Click-to-call', 'Basic SEO foundation', 'Brand integration', 'Domain connection',
      'Fast-loading experience',
    ],
    cta: 'Start My Landing Page',
  },
  {
    id: 'redesign', name: 'Website Redesign', price: 699, priceLabel: 'From $699', from: true, featured: true,
    blurb: 'For businesses with an outdated website that needs a serious upgrade.',
    features: [
      'Up to 3 redesigned pages', 'Modern responsive design', 'Performance optimization',
      'Contact form', 'Click-to-call', 'Maps & hours integration', 'Basic local SEO',
      'Modernized user experience', '100% ownership',
    ],
    cta: 'Redesign My Site',
  },
  {
    id: 'custom', name: 'Custom Build', price: 999, priceLabel: 'From $999', from: true,
    blurb: 'For businesses that want something more advanced.',
    tiers: ['$999 — up to 5 pages', '$1,299 — up to 8 pages + custom feature', '$1,599 — up to 12 pages'],
    features: [
      'Everything in Website Redesign', 'Custom functionality', 'Advanced animations',
      'Booking systems', 'Galleries', 'Integrations', 'Fixed project quote',
    ],
    cta: 'Build Something Custom',
  },
];

export type AddOn = {
  id: string; label: string; once?: number; monthly?: number; note?: string;
  /* Plain-English explanation, surfaced on hover/focus/tap rather than printed
     under every row. Industry terms are clear to us and opaque to a visitor;
     this is the "what is this?" layer, not extra body copy. One or two short
     sentences, maximum. */
  desc: string;
};

export const addOnsOnce: AddOn[] = [
  { id: 'page',      label: 'Extra Page',                    once: 99,
    desc: 'Add another professionally designed page to your website.' },
  { id: 'logo',      label: 'Logo & Brand Mark',             once: 199,
    desc: 'A custom logo or visual mark designed to give your business a recognizable identity.' },
  { id: 'copy',      label: 'Copywriting',                   once: 99,  note: 'per page',
    desc: 'Professional website copy written around your business, customers, and goals.' },
  { id: 'gbp',       label: 'Google Business Profile Setup', once: 199,
    desc: 'Set up and optimize your Google Business Profile so customers can find accurate business information.' },
  { id: 'localsl',   label: 'Local Search Launch',           once: 299,
    desc: 'Build the local SEO foundation that helps your business appear when nearby customers search.' },
  { id: 'booking',   label: 'Online Booking',                once: 149,
    desc: 'Let customers schedule appointments directly through your website.' },
  { id: 'store',     label: 'Simple Online Store',           once: 399, note: 'from',
    desc: 'Add a streamlined storefront so customers can browse and purchase products online.' },
  { id: 'brandkit',  label: 'Full Brand Kit',                once: 399,
    desc: 'Create a complete visual identity with coordinated colors, typography, marks, and brand assets.' },
  { id: 'seotune',   label: 'SEO Tune-Up',                   once: 299,
    desc: 'Improve the technical and on-page elements that help search engines understand your website.' },
];

export const addOnsMonthly: AddOn[] = [
  { id: 'care',      label: 'Care Plan',              monthly: 95,
    desc: 'Keep your website maintained, monitored, backed up, and updated after launch.' },
  { id: 'localseo',  label: 'Local SEO & AI Search',  monthly: 149,
    desc: 'Improve how your business appears in local search and how AI assistants discover and recommend you.' },
  { id: 'social',    label: 'Social Media Marketing', monthly: 149,
    desc: 'Create and manage social content designed to keep your business visible and engaged.' },
  { id: 'email',     label: 'Email Campaigns',        monthly: 149,
    desc: 'Create targeted email campaigns that keep customers informed and bring them back.' },
  { id: 'recept',    label: 'AI Receptionist',        once: 499, monthly: 149,
    desc: 'An AI-powered assistant that answers common questions and helps handle incoming customer inquiries.' },
  { id: 'aibooking', label: 'AI Booking',             once: 299, monthly: 49,
    desc: 'An AI assistant that can help customers schedule appointments automatically.' },
  { id: 'aichat',    label: 'AI Support Chat',        once: 100, monthly: 49,
    desc: 'An AI chat assistant that answers customer questions directly on your website.' },
  { id: 'workflow',  label: 'Workflow Automation',    once: 399, monthly: 49, note: 'from',
    desc: 'Connect repetitive tasks and systems so leads, messages, and follow-ups can happen automatically.' },
];

export type Faq = { q: string; a: string };
export const faqs: Faq[] = [
  { q: 'Do I own my website?', a: 'Yes. Outright. The domain, the code and the content are yours, and you can take them anywhere. We do not rent websites back to the people who paid for them.' },
  { q: 'How much does a website cost?', a: 'A focused landing page starts at $400, a redesign at $699, and a custom build from $999. You get a fixed quote before we start — no hourly surprises.' },
  { q: 'How long does it take?', a: 'A landing page is usually about a week. A redesign runs one to two weeks. Custom builds depend on scope, and we give you a real date, not a range.' },
  { q: 'Can you redesign my existing site?', a: 'That is most of what we do. We keep whatever is already working — the copy that converts, the pages that rank — and rebuild everything around it.' },
  { q: 'Do you provide hosting?', a: 'Yes, on fast modern infrastructure with HTTPS and backups included. You can also host it yourself; it is your code.' },
  { q: 'Do you help with SEO?', a: 'Every build ships with the technical foundation — clean markup, schema, sitemaps, speed. Ongoing local SEO and AI-search work is available as a monthly add-on.' },
  { q: 'Can you write the copy?', a: 'Yes. Copywriting is $99 per page. We interview you first, because the best copy is usually something you already said out loud.' },
  { q: 'Can you integrate booking?', a: 'Yes — online booking is a $149 add-on, and AI-assisted booking that answers and schedules for you is available monthly.' },
  { q: 'What happens after launch?', a: 'We monitor performance, fix anything that breaks, and walk you through making your own updates in plain English. No jargon, no gatekeeping.' },
  { q: 'Can you maintain the website?', a: 'Yes. The Care Plan is $95/month and covers updates, monitoring, backups and small changes.' },
];

export const nav = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Pricing', href: '#pricing' },
];
