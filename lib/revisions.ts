/* ============================================================
   REVISION REQUESTS — /revisions

   Sent to a client whose build is finished but not yet live. It
   answers two questions in one submission: are we going live, and
   what needs changing first.

   Deliberately NOT a second copy of /start. That form asks who
   you are and what you sell, because nothing exists yet. By this
   point the client is known and the site is built, so asking any
   of it again is the fastest way to get feedback by text message
   instead — which is the thing this page exists to prevent.

   The unit here is a REQUEST, not a form. One submission carries
   as many as the client needs, and each one is written to its own
   row so the list can be worked through and ticked off.
   ============================================================ */

/** Rounds included in a build. Shown on the page, not enforced by it. */
export const ROUNDS_INCLUDED = 2;

/* Where on the page. Generic enough for any build we ship, and short enough
   to stay a row of chips rather than a dropdown nobody opens. */
export const SECTIONS = [
  'Header / nav',
  'Hero',
  'Services',
  'About',
  'Gallery / photos',
  'Reviews',
  'Contact form',
  'Footer',
  'Whole page',
  'Something else',
];

/* Half of all "this looks broken" is a phone-only problem, and knowing which
   device turns a hunt into a fix. */
export const DEVICES = ['Desktop', 'Phone', 'Tablet', 'All of them'];

/* Lets the client separate instructions from thinking-out-loud, which is where
   most scope creep starts. */
export const PRIORITIES = [
  'Must fix before launch',
  'Would like it changed',
  'Just a question',
];

/* The one decision the page is really asking for. */
export const DECISIONS = [
  'Approved — publish as is',
  'Approved once these changes are made',
  'Still reviewing — these are questions, not instructions',
];

export const ROUND_OPTIONS = [
  'Round 1',
  'Round 2',
  'Beyond round 2',
];

/* ============================================================
   THE GUIDANCE ON THE PAGE

   A client who has never signed off a website does not know what
   counts as a revision, what to look for, or how much detail we
   need. Left to guess they send "can you make it pop" by text at
   11pm, and we lose two days to messages. So the page teaches the
   job before it asks them to do it.
   ============================================================ */

/** Three steps, shown above the form. */
export const HOW_IT_WORKS = [
  {
    n: '01',
    t: 'Go through the preview properly',
    d: 'Open it on your phone and on a computer. Tap every button, read every line, and send the contact form to yourself. Things are far cheaper to change now than after launch.',
  },
  {
    n: '02',
    t: 'List each change on its own',
    d: 'One block per change, and say where it is: "Services, second paragraph" lands today. Screenshot anything that looks broken — a picture settles it in seconds.',
  },
  {
    n: '03',
    t: 'Tell us whether to publish',
    d: 'Approve it as is, approve it once the changes are made, or say you are still reviewing. We reply within one working day with what we are doing and when.',
  },
];

/** Ticked off by the client, saved in their browser, never submitted. */
export const CHECKLIST = [
  { id: 'name', t: 'Business name spelled exactly the way you use it' },
  { id: 'phone', t: 'Phone number — tap it on your phone and check it dials you' },
  { id: 'form', t: 'Send the contact form to yourself and make sure it arrives' },
  { id: 'hours', t: 'Address, service area and opening hours' },
  { id: 'services', t: 'Services list — nothing missing, nothing you no longer do' },
  { id: 'claims', t: 'Prices, offers, guarantees and licence numbers you can stand behind' },
  { id: 'photos', t: 'Photos are yours to use and show work you are proud of' },
  { id: 'links', t: 'Social and review links open your profiles, not someone else\u2019s' },
  { id: 'phone-read', t: 'Read the whole site once on a phone — most visitors will' },
];

/* What a round covers, and what gets quoted instead. Said before they ask, so
   the first invoice is never the first time they hear it. */
export const SCOPE = {
  included: [
    'Wording, headings and any text on the page',
    'Swapping photos, logos and files',
    'Colour, spacing, sizes and the order of sections',
    'Contact details, hours, service areas and links',
    'Anything broken or wrong on our side — that is a fix, and it never counts as a round',
  ],
  quoted: [
    'New pages that were not in the build',
    'New features — booking, payments, logins, a shop',
    'Rebuilding the design around a new brand or direction',
    'Photography, video or copywriting from scratch',
  ],
};

/** What happens after they hit send. */
export const NEXT_STEPS = [
  'We read everything and reply within one working day with what we are doing and when.',
  'Changes are made as one batch, not one at a time — it is faster and nothing gets missed.',
  'You get the preview link again to check the list off.',
  'When you approve, we publish and send you the live link.',
];

/* Good and vague, side by side. Shown next to the box people have to write in,
   which is the only place the example is any use. */
export const EXAMPLE = {
  good: 'On the Services page, the second box still says "Free estimates in 24 hours" — change it to "Free estimates, same week".',
  vague: 'The services part needs work.',
};

/** One row in the client's list. */
export type RevisionRequest = {
  page: string;
  section: string;
  device: string;
  priority: string;
  detail: string;
  /** screenshot, uploaded straight to Blob like the questionnaire's files */
  shotUrl?: string;
  shotPath?: string;
  shotName?: string;
};

export const emptyRequest = (): RevisionRequest => ({
  page: '', section: '', device: '', priority: '', detail: '',
});

/* Screenshots only — a revision note does not need a 25MB PSD, and keeping the
   list tight keeps the upload fast on a phone. */
export const SHOT = {
  maxBytes: 12 * 1024 * 1024,
  accept: ['image/*', '.heic', '.pdf'],
};

/* NEW MATERIAL, which is a different thing from a screenshot.

   A screenshot shows us a problem; these are files we are meant to put ON the
   site — a replacement logo, photos from a recent job, a PDF menu, copy that
   has been rewritten. Same limits and the same private store as the
   questionnaire's uploads, because it is the same kind of material. */
export const ASSETS = {
  maxFiles: 20,
  maxBytes: 25 * 1024 * 1024,
  accept: ['image/*', '.pdf', '.svg', '.ai', '.eps', '.psd', '.zip', '.doc', '.docx', '.txt', '.rtf', '.heic'],
  blurb: 'New photos, a different logo, rewritten copy, a menu or price list — anything you want added or swapped in.',
};

export type Asset = { name: string; url?: string; pathname?: string; error?: string; pending?: boolean };
