/* ============================================================
   NEW-BUILD QUESTIONNAIRE

   Every question here has to earn its place by answering
   "what would I otherwise have to ask on a call before I could
   start?" — anything merely interesting was cut.

   WRITTEN FOR ANY ORGANISATION, not just trades. A foundation,
   a county agency, a school board committee and a pool builder
   all have to be able to answer every question without
   translating it first. That rules out "customers", "hire you",
   "job" and "competitors" — a public works department has none
   of those and reads them as a form that was not meant for it.
   The neutral versions ("the people you serve", "choose to work
   with you") cost nothing and stay true for a business.

   The shape is deliberate: almost everything is a one-tap chip.
   Only six fields need typing, and only six are required, so
   this can be finished on a phone. A long form that gets
   abandoned tells you nothing; a short one that gets finished
   tells you enough to start.
   ============================================================ */

export type Field = {
  id: string;
  label: string;
  /** the "why are you asking me this" line, shown small under the label */
  hint?: string;
  kind: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'chips' | 'multi';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  rows?: number;
};

export type Step = { n: string; title: string; blurb: string; fields: Field[] };

export const INTAKE_STEPS: Step[] = [
  {
    n: '01',
    title: 'Who you are',
    blurb: 'So we know who we are talking to and where to send the draft.',
    fields: [
      { id: 'org', label: 'Organization name', kind: 'text', required: true },
      {
        id: 'orgtype', label: 'What kind of organization?', kind: 'chips',
        hint: 'This changes how the site is structured more than anything else here.',
        options: ['Business', 'Nonprofit or foundation', 'Government agency', 'Committee or campaign', 'Association or membership body', 'School or institution', 'Something else'],
      },
      { id: 'name', label: 'Your name', kind: 'text', required: true },
      { id: 'role', label: 'Your role', kind: 'text', hint: 'So we know whether we are talking to the decision maker or gathering input.' },
      { id: 'email', label: 'Email', kind: 'email', required: true },
      { id: 'phone', label: 'Phone', kind: 'tel', hint: 'Optional — only if you would rather talk than type.' },
    ],
  },
  {
    n: '02',
    title: 'What you do',
    blurb: 'Plain language is better than polished here. We will do the polishing.',
    fields: [
      {
        id: 'what', label: 'What does your organization do?', kind: 'textarea', rows: 3, required: true,
        hint: 'One or two sentences, the way you would say it out loud rather than the way it appears in a charter.',
      },
      {
        id: 'serve', label: 'Who do you serve, and where?', kind: 'text', required: true,
        hint: 'A city, a county, a district, a membership, a whole state. This drives your search setup.',
      },
      { id: 'age', label: 'How long have you existed?', kind: 'chips', options: ['Just forming', '1–3 years', '3–10 years', '10+ years'] },
      { id: 'current', label: 'Current website', kind: 'url', hint: 'Leave blank if there isn’t one.', placeholder: 'https://' },
    ],
  },
  {
    n: '03',
    title: 'What the website has to do',
    blurb: 'This decides the whole layout, so it is the most important screen here.',
    fields: [
      {
        id: 'goals', label: 'What should it do for you?', kind: 'multi',
        hint: 'Pick as many as apply.',
        options: ['Get enquiries or calls', 'Explain what you do', 'Publish documents or reports', 'Take donations', 'Sign up members or volunteers', 'Take bookings or registrations', 'Sell something', 'Show past work or outcomes', 'Announce meetings and events', 'Look credible to people who already found you', 'Show up in search'],
      },
      {
        id: 'action', label: 'If a visitor does one thing, what is it?', kind: 'chips',
        hint: 'The single action the whole page gets built around.',
        options: ['Contact you', 'Request a quote', 'Book or register', 'Donate', 'Apply or sign up', 'Find a document or answer', 'Buy something'],
      },
      {
        id: 'services', label: 'Your main services, programs or areas of work', kind: 'textarea', rows: 5, required: true,
        hint: 'One per line. Three to six is ideal — these become the main sections.',
      },
    ],
  },
  {
    n: '04',
    title: 'The people you serve',
    blurb: 'This is where the words on the site come from.',
    fields: [
      {
        id: 'audience', label: 'Who is your typical visitor?', kind: 'text',
        hint: 'Residents, homeowners, members, grant applicants, parents, other agencies — whoever actually turns up.',
      },
      {
        id: 'questions', label: 'What do people always ask you?', kind: 'textarea', rows: 4,
        hint: 'The single most useful thing on this form. Every one of these becomes a section or an FAQ that answers the question before it has to be asked.',
      },
      {
        id: 'barrier', label: 'What usually gets in the way?', kind: 'text',
        hint: 'Confusion, cost, not knowing you exist, going somewhere else instead. Whatever the site has to overcome.',
      },
    ],
  },
  {
    n: '05',
    title: 'What you already have',
    blurb: 'Honest answers here keep the timeline real. "None" is a perfectly good answer.',
    fields: [
      { id: 'logo', label: 'Logo', kind: 'chips', options: ['Have one I like', 'Have one, needs work', 'None — need one'] },
      { id: 'brand', label: 'Brand or style guidelines', kind: 'chips', hint: 'Agencies and institutions often have these and they are binding.', options: ['Yes, and we must follow them', 'Yes, loosely', 'None'] },
      { id: 'photos', label: 'Photography', kind: 'chips', hint: 'Real photos of real work beat anything we can buy.', options: ['Lots of good ones', 'A few', 'None yet'] },
      { id: 'copy', label: 'Written content', kind: 'chips', options: ['Written and ready', 'Some of it', 'Please write it'] },
      { id: 'domain', label: 'Domain name', kind: 'chips', options: ['Own it already', 'Not yet', 'Not sure'] },
      { id: 'domainname', label: 'Which domain?', kind: 'text', hint: 'If you have one, or one you want.' },
    ],
  },
  {
    n: '06',
    title: 'Requirements and timing',
    blurb: 'Last screen of questions. Then the files.',
    fields: [
      {
        id: 'likes', label: 'Two or three websites you like', kind: 'textarea', rows: 3,
        hint: 'Any sector at all — and say what you like about each. Worth more than any adjective you could give us.',
      },
      { id: 'avoid', label: 'Anything you definitely do not want?', kind: 'text' },
      {
        id: 'compliance', label: 'Any rules the site has to meet?', kind: 'multi',
        hint: 'Public bodies and anyone taking public money usually have at least one of these. Say if you are not sure — it is much cheaper to build for than to retrofit.',
        options: ['WCAG / ADA accessibility', 'Section 508', 'Public records or archiving', 'More than one language', 'Privacy or data rules', 'Procurement or approval process', 'None that I know of', 'Not sure'],
      },
      { id: 'pages', label: 'Pages you think you need', kind: 'multi', hint: 'A guess is fine — we will tell you if it is more or less.', options: ['Home', 'About', 'Services or programs', 'Team or board', 'Gallery or projects', 'Documents', 'News', 'Events or meetings', 'Reviews or testimonials', 'Donate', 'Apply', 'Contact', 'Booking', 'Shop'] },
      { id: 'timeline', label: 'When do you need it live?', kind: 'chips', options: ['As soon as possible', 'Within a month', 'Two to three months', 'Tied to a date or deadline', 'No fixed date'] },
      { id: 'notes', label: 'Anything else we should know?', kind: 'textarea', rows: 3 },
    ],
  },
];

/** Flat list of every field id, in order — used by the API route and the sheet. */
export const INTAKE_FIELDS: string[] = INTAKE_STEPS.flatMap((s) => s.fields.map((f) => f.id));

/* Upload limits. Kept here rather than in the component so the API route and
   the UI cannot disagree about what is allowed. */
export const UPLOAD = {
  maxFiles: 20,
  maxBytes: 25 * 1024 * 1024,      // 25MB per file
  accept: ['image/*', '.pdf', '.svg', '.ai', '.eps', '.psd', '.zip', '.doc', '.docx', '.txt', '.rtf', '.heic'],
  blurb: 'Logos, photographs, brand guidelines, anything already written, reports, color references — whatever you have. If you are not sure it is useful, send it anyway.',
};
