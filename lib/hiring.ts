/* ============================================================
   /apply — appointment center applicants

   Built for one traffic source: an Instagram story link sticker.
   That means a phone, a thumb, and roughly one minute of attention
   before the person swipes back to their feed. So:

   · one screen, no steps — a progress bar on a one-minute form is
     just one more thing to read
   · almost every answer is a single tap
   · every question is required — there are few enough that each one
     earns its place, and a half-answered row is a wasted call

   What is deliberately NOT asked: age, date of birth, marital
   status, citizenship, salary history, or anything else that is
   unlawful or risky to screen on. California bans salary-history
   questions outright (Labor Code 432.3). Keep it that way when
   editing.

   No full-time / part-time question either: reps set their own
   schedule, so the only thing worth knowing is when they tend to be
   free.
   ============================================================ */

export const ROLE = {
  /** shown as the eyebrow and in the email subject */
  title: 'Appointment Center Rep',
  /** one line: what the job actually is, in plain words */
  summary:
    'Call real estate agents and brokerages who want more business. We create and deliver a lead engine for them — a done-for-you system that brings more opportunities and becomes an extension of their business. You start the conversation and book the meeting.',
  /** the pill under the summary */
  perk: 'Flexible hours · you set your schedule',
};

export type Choice = { id: string; label: string; hint?: string; options: string[]; multi?: boolean };

export const CHOICES: Choice[] = [
  {
    id: 'phoneExp',
    label: 'Experience on the phones',
    hint: 'Cold calling, sales, call center, setting appointments, customer service — it all counts.',
    options: ['None yet', 'Under 1 year', '1–3 years', '3+ years'],
  },
  {
    id: 'reExp',
    label: 'Real estate background',
    options: ['None', 'Licensed agent', 'Worked with agents', 'ISA / appointment setting'],
  },
  {
    id: 'hours',
    label: 'When are you usually free?',
    hint: 'You set your own schedule — this just helps us plan.',
    options: ['Mornings', 'Afternoons', 'Evenings', 'Weekends'],
    multi: true,
  },
  {
    id: 'start',
    label: 'When could you start?',
    options: ['Right away', 'Within 2 weeks', 'Within a month'],
  },
  {
    id: 'languages',
    label: 'Languages you can take a call in',
    options: ['English', 'Spanish', 'Other'],
    multi: true,
  },
];

/** Every field the sheet receives, in column order. */
export const APPLY_FIELDS = ['name', 'phone', 'email', 'city', ...CHOICES.map((c) => c.id), 'why'];
