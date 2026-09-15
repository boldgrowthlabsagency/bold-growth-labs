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
