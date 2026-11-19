/* ============================================================
   /audit — growth audit for business owners

   The /apply form rebuilt for the other side of the table: owners
   who want to scale, and who should come away knowing BGL is a
   growth partner — systems, automations, paid ads, reputation —
   not only a website shop.

   High level on purpose. Every question is one an owner can answer
   from memory in a few seconds, and each one points at a specific
   bottleneck: how leads arrive, how fast they are answered, where
   the hours go, what the ads are doing. Nothing that needs a login,
   a report or an accountant.

   Revenue and ad spend are asked as ranges, with an opt-out on
   revenue: they decide which fixes are worth paying for, but an
   exact number is a reason to close the tab.

   Adding a question means adding it to CHOICES here (which feeds
   AUDIT_FIELDS) AND to AUDIT_COLUMNS in docs/google-sheet-script.gs,
   then a new Apps Script deployment — or it is dropped silently.
   ============================================================ */

export const AUDIT = {
  eyebrow: 'Free growth audit',
  title: 'Find what’s capping',
  /** kept on one line with the accent — never "your" left alone */
  lead: 'your',
  accent: 'growth.',
  summary:
    'A website is one piece. We build the systems behind it — lead capture, follow-up automation, paid ads, reviews and reporting. Answer a few questions and we’ll come back with the bottlenecks we’d fix first and what fixing them would take.',
  pills: ['About two minutes · mostly taps', 'No cost · no obligation'],
};

/** The areas BGL can actually deliver. Every recommendation maps to one. */
export type AreaId = 'ads' | 'speed' | 'crm' | 'automation' | 'site' | 'seo' | 'reviews' | 'reporting';

export const AREAS: Record<AreaId, { title: string; copy: string }> = {
  ads:        { title: 'Paid ads management',      copy: 'Campaigns built around cost per booked job, not clicks — with tracking that shows which dollars came back.' },
  speed:      { title: 'Speed-to-lead automation', copy: 'Every new enquiry gets an instant text and email reply and lands with whoever can call back, day or night.' },
  crm:        { title: 'CRM & follow-up system',   copy: 'One pipeline for every lead, with follow-up sequences so nobody is forgotten after the first quote.' },
  automation: { title: 'Workflow automation',      copy: 'The repetitive admin — booking, reminders, invoices, data entry — handed to systems instead of people.' },
  site:       { title: 'Conversion-focused website', copy: 'A site that turns the traffic you already have into calls and bookings, with one obvious next step on every page.' },
  seo:        { title: 'Local SEO & Google profile', copy: 'Showing up in search and on Maps for the work you want, in the places you serve.' },
  reviews:    { title: 'Reviews & reputation',     copy: 'A steady stream of reviews from real customers, every one answered, and the best working on your site.' },
  reporting:  { title: 'Reporting dashboard',      copy: 'Leads, cost per lead, close rate and revenue in one place, so decisions run on numbers instead of gut.' },
};

export type Choice = {
  id: string;
  label: string;
  hint?: string;
  options: string[];
  multi?: boolean;
  /** answer → areas it points at. Read by recommend(), never shown. */
  signals?: Record<string, AreaId[]>;
};

/* Grouped so the form reads as four short sections rather than one long wall
   of chips. Order inside each group is the order on screen. */
export const GROUPS: { title: string; ids: string[] }[] = [
  { title: 'The business',   ids: ['industry', 'revenue', 'team'] },
  { title: 'Getting leads',  ids: ['sources', 'volume', 'adspend'] },
  { title: 'Handling them',  ids: ['response', 'tools', 'admin'] },
  { title: 'Where it hurts', ids: ['bottleneck', 'goal', 'timing'] },
];

export const CHOICES: Choice[] = [
  {
    id: 'industry',
    label: 'What kind of business?',
    options: ['Home services', 'Professional services', 'Health & wellness', 'Real estate', 'Retail & e-commerce', 'Food & hospitality', 'Other'],
  },
  {
    id: 'revenue',
    label: 'Monthly revenue, roughly',
    hint: 'A range is plenty — it tells us which fixes are worth what they cost.',
    options: ['Under $10k', '$10k–50k', '$50k–150k', '$150k–500k', '$500k+', 'Rather not say'],
  },
  {
    id: 'team',
    label: 'How big is the team?',
    options: ['Just me', '2–5', '6–20', '21–50', '50+'],
  },
  {
    id: 'sources',
    label: 'Where do new customers come from today?',
    hint: 'Tap all that apply.',
    multi: true,
    options: ['Referrals', 'Google search', 'Google Maps', 'Social media', 'Paid ads', 'Repeat customers', 'Outbound', 'Not sure'],
    signals: {
      /* referral-only is the classic ceiling: it grows as fast as word of mouth */
      'Referrals': ['ads', 'seo'],
      'Not sure': ['reporting'],
    },
  },
  {
    id: 'volume',
    label: 'New leads in a typical month',
    options: ['Under 10', '10–50', '50–200', '200+', 'Don’t track it'],
    signals: {
      'Under 10': ['ads', 'seo'],
      '10–50': ['ads'],
      '200+': ['crm', 'speed'],
      'Don’t track it': ['reporting'],
    },
  },
  {
    id: 'adspend',
    label: 'Monthly ad spend',
    options: ['None', 'Under $1k', '$1k–5k', '$5k–20k', '$20k+'],
    signals: {
      'None': ['ads'],
      '$1k–5k': ['reporting'],
      '$5k–20k': ['ads', 'reporting'],
      '$20k+': ['ads', 'reporting'],
    },
  },
  {
    id: 'response',
    label: 'How fast does a new lead hear back?',
    hint: 'Honestly — on a busy day.',
    options: ['Under 5 minutes', 'Within the hour', 'Same day', 'Next day or later', 'Depends who’s around'],
    signals: {
      'Same day': ['speed'],
      'Next day or later': ['speed', 'speed'],
      'Depends who’s around': ['speed', 'crm'],
    },
  },
  {
    id: 'tools',
    label: 'What runs the business today?',
    hint: 'Tap all that apply.',
    multi: true,
    options: ['A CRM', 'Spreadsheets', 'Pen & paper', 'Booking software', 'Email marketing', 'Zapier / automations', 'Nothing formal'],
    signals: {
      'Spreadsheets': ['crm'],
      'Pen & paper': ['crm', 'automation'],
      'Nothing formal': ['crm', 'automation'],
    },
  },
  {
    id: 'admin',
    label: 'Hours a week lost to repetitive admin',
    hint: 'Data entry, chasing invoices, confirming appointments, copying things between apps.',
    options: ['Under 5', '5–10', '10–20', '20+'],
    signals: {
      '10–20': ['automation'],
      '20+': ['automation', 'automation'],
    },
  },
  {
    id: 'bottleneck',
    label: 'What’s holding growth back most?',
    hint: 'Pick up to three.',
    multi: true,
    options: [
      'Not enough leads', 'Leads don’t turn into sales', 'Slow follow-up', 'Too much manual work',
      'Can’t see my numbers', 'Ads aren’t paying off', 'Website doesn’t sell', 'Not enough reviews', 'Team at capacity',
    ],
    /* the owner's own diagnosis counts double — they know where it hurts */
    signals: {
      'Not enough leads': ['ads', 'ads', 'seo'],
      'Leads don’t turn into sales': ['crm', 'crm', 'site'],
      'Slow follow-up': ['speed', 'speed', 'crm'],
      'Too much manual work': ['automation', 'automation'],
      'Can’t see my numbers': ['reporting', 'reporting'],
      'Ads aren’t paying off': ['ads', 'ads', 'reporting'],
      'Website doesn’t sell': ['site', 'site'],
      'Not enough reviews': ['reviews', 'reviews', 'seo'],
      'Team at capacity': ['automation', 'automation', 'crm'],
    },
  },
  {
    id: 'goal',
    label: 'The goal for the next 12 months',
    options: ['Double revenue', 'Steady, profitable growth', 'Free up my own time', 'Open a new location', 'Get ready to sell'],
    signals: {
      'Double revenue': ['ads'],
      'Free up my own time': ['automation'],
      'Open a new location': ['seo'],
      'Get ready to sell': ['reporting'],
    },
  },
  {
    id: 'timing',
    label: 'If the audit finds a clear fix, when would you act on it?',
    options: ['Right away', 'This quarter', 'Later this year', 'Just exploring'],
  },
];

/** Most bottlenecks you can pick at once — past three it stops being a priority. */
export const MAX_BOTTLENECKS = 3;

/* Text questions. Contact details first; `fix` closes the form. */
export const TEXT = {
  name:     { label: 'Your name' },
  business: { label: 'Business name' },
  email:    { label: 'Email' },
  phone:    { label: 'Phone' },
  website:  { label: 'Website', hint: 'Leave it blank if there isn’t one yet.' },
  fix:      { label: 'If you could fix one thing tomorrow, what would it be?' },
};

/** Every field the sheet receives, in column order. `website` is the only optional one. */
export const AUDIT_FIELDS = ['name', 'business', 'email', 'phone', 'website', ...CHOICES.map((c) => c.id), 'fix'];
export const OPTIONAL = new Set(['website']);

/* ------------------------------------------------------------
   The preview shown after sending — and the "Points at" column
   in the sheet, so the call starts from the same three.

   A plain tally of the signals above, nothing cleverer. It is a
   starting point for a conversation, not the audit itself, and
   the page says so.
   ------------------------------------------------------------ */
export function recommend(answers: Record<string, string | string[]>, limit = 3): AreaId[] {
  const score = new Map<AreaId, number>();
  for (const c of CHOICES) {
    if (!c.signals) continue;
    const raw = answers[c.id];
    const picked = Array.isArray(raw) ? raw : raw ? String(raw).split(', ') : [];
    for (const p of picked) for (const a of c.signals[p] || []) score.set(a, (score.get(a) || 0) + 1);
  }
  /* no website at all is decisive on its own */
  if (!String(answers.website || '').trim()) score.set('site', (score.get('site') || 0) + 3);

  return Array.from(score.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}
