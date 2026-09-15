/* ============================================================
   REVIEWS DEMO — the walkthrough shown at /reviews

   Copy for a page whose whole job is to answer "what actually
   happens, and what do I have to do?" for a prospect who has
   never bought this before.

   Written so the owner's own effort is obvious at every step:
   they do one thing (step 01) and the rest runs. That is the
   sale. Anything that sounds like homework kills it.
   ============================================================ */

export type FlowStep = {
  n: string;
  title: string;
  /** the one line that carries the step */
  copy: string;
  /** what the phone/screen shows while this step is active */
  screen: 'job' | 'sms' | 'google' | 'landed' | 'reply' | 'site';
  /** small print under the copy — the honest detail */
  note?: string;
};

export const FLOW: FlowStep[] = [
  {
    n: '01',
    title: 'You finish the job',
    copy: 'Mark it complete the way you already do. That is the only thing you ever have to do.',
    screen: 'job',
    note: 'Triggered from your invoicing or job software, so nobody has to remember anything.',
  },
  {
    n: '02',
    title: 'We ask, twenty minutes later',
    copy: 'A short text goes out while the work is still fresh in their mind.',
    screen: 'sms',
    note: 'Twenty minutes beats same-evening, and same-evening beats next-day. Every hour costs you replies.',
  },
  {
    n: '03',
    title: 'One tap, no hunting',
    copy: 'The link opens the review box directly. No searching for your business, no app, no account setup.',
    screen: 'google',
    note: 'Most requests die here. A direct link is the single biggest lever on the whole flow.',
  },
  {
    n: '04',
    title: 'The review lands',
    copy: 'It appears on your Google profile, where the next customer searching for you will see it.',
    screen: 'landed',
    note: 'Volume and recency both feed local ranking — not just the star rating.',
  },
  {
    n: '05',
    title: 'We answer it — all of them',
    copy: 'Every review gets a reply within one business day, the good ones included.',
    screen: 'reply',
    note: 'A bad review answered well sells better than a perfect record. It is the only one people read closely.',
  },
  {
    n: '06',
    title: 'It goes on your website',
    copy: 'Your best reviews appear on your own site automatically, updating as new ones come in.',
    screen: 'site',
    note: 'This is the part most review companies cannot do. We build the site, so the reviews live in it properly.',
  },
];

/* Sample reviews for the live widget at the bottom of the page. Invented, and
   labelled as such on the page — a demo that shows fabricated reviews under a
   real business name is the exact thing this service exists to avoid. */
export const SAMPLE_REVIEWS = [
  { name: 'Marisol R.', stars: 5, when: '2 days ago',
    text: 'Crew showed up when they said they would and cleaned up every night. The quote never moved.' },
  { name: 'Dan W.', stars: 5, when: '1 week ago',
    text: 'Straight answers, no pressure, and they caught a drainage problem the last two guys missed.' },
  { name: 'Priya N.', stars: 5, when: '2 weeks ago',
    text: 'Booked Monday, done Thursday. Sent photos every day since I was out of town.' },
  { name: 'Kev T.', stars: 4, when: '3 weeks ago',
    text: 'Ran a day over because of rain, but they told me before I had to ask. Work is solid.' },
];

export const SAMPLE_RATING = 4.9;
export const SAMPLE_COUNT = 127;
