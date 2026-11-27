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
  screen: 'job' | 'sms' | 'email' | 'google' | 'landed' | 'reply' | 'site';
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
    title: 'A text goes out twenty minutes later',
    copy: 'Short, in your name, with the link already in it — while the work is still fresh in their mind.',
    screen: 'sms',
    note: 'Twenty minutes beats same-evening, and same-evening beats next-day. Every hour costs you replies.',
  },
  {
    n: '03',
    title: 'An email follows the next morning',
    copy: 'Only to the people who have not left one yet. Some customers never answer a text and will happily click an email.',
    screen: 'email',
    note: 'Two channels, one ask. Nobody is chased twice, and anyone who reviews is dropped from the sequence immediately.',
  },
  {
    n: '04',
    title: 'One tap, no hunting',
    copy: 'The link opens the review box directly. No searching for your business, no app, no account setup.',
    screen: 'google',
    note: 'Most requests die here. A direct link is the single biggest lever on the whole flow.',
  },
  {
    n: '05',
    title: 'The review lands',
    copy: 'It appears on your Google profile, where the next customer searching for you will see it.',
    screen: 'landed',
    note: 'Volume and recency both feed local ranking — not just the star rating.',
  },
  {
    n: '06',
    title: 'We answer it — all of them',
    copy: 'Every review gets a reply within one business day, the good ones included.',
    screen: 'reply',
    note: 'A bad review answered well sells better than a perfect record. It is the only one people read closely.',
  },
  {
    n: '07',
    title: 'It goes on your website',
    copy: 'Your best reviews appear on your own site automatically, updating as new ones come in.',
    screen: 'site',
    note: 'This is the part most review companies cannot do. We build the site, so the reviews live in it properly.',
  },
];

/* ============================================================
   THE PROFILE IN THE MOCK-UPS

   BOLD Home Solutions is Aldo's own business, used here with his
   say-so — the "never put a real name on work they did not
   commission" rule in CLAUDE.md is about other people's names.

   THE RATING AND THE REVIEWS BELOW ARE SAMPLES, and every screen
   that shows them is captioned as a mock-up on the page. If they
   are ever swapped for the real profile's numbers, they have to
   match the profile exactly on the day — a made-up star count
   under a real business is the same fabrication the service
   exists to prevent, and it is worse when the business is ours.
   ============================================================ */
export const PROFILE = {
  name: 'BOLD Home Solutions',
  category: 'General contractor',
  area: 'San Diego, CA',
  phone: '(858) 315-7718',
  site: 'boldhomesolutions.net',
  hours: 'Open ⋅ Closes 6 PM',
  /** sample — see the warning above */
  rating: '4.9',
  count: '37',
  /** how the five bars sit in the ratings breakdown, 5★ first */
  bars: [94, 5, 1, 0, 0],
};

/* ============================================================
   WHAT THE CUSTOMER ACTUALLY RECEIVES

   One source for both the walkthrough's phone and the full-size
   mock-ups, so the text in the little screen and the text in the
   big one can never drift apart.

   Everything here is BOLD Home Solutions, Aldo's own business, so
   the whole page shows one worked example rather than two. The
   messages are written the way real ones go out; the reviews and
   the rating behind them are samples, and the page says so.

   Two details in here are not decoration:
   · the text carries STOP, because a business sending automated
     SMS without an opt-out is breaking carrier rules and the TCPA
   · the email carries an unsubscribe line, for the same reason
     under CAN-SPAM
   Leave both in. They are also the first thing a careful prospect
   looks for.
   ============================================================ */

export const EXAMPLE_BIZ = PROFILE.name;

export const SMS_MESSAGE = {
  from: EXAMPLE_BIZ,
  when: 'Today 4:21 PM',
  body: 'Hi Marisol — Aldo here from BOLD Home Solutions. Thanks for having us out this week. If you have twenty seconds, would you leave us a quick review?',
  link: 'g.page/r/bold-home-solutions',
  optOut: 'Reply STOP to opt out.',
  /** the customer's own reply, shown so the thread reads like a real one */
  reply: 'Just did — kitchen looks great 👍',
};

export const EMAIL_MESSAGE = {
  from: EXAMPLE_BIZ,
  address: 'hello@boldhomesolutions.net',
  when: '8:02 AM',
  subject: 'How did we do, Marisol?',
  greeting: 'Hi Marisol,',
  body: 'Thanks again for having us out to the kitchen remodel. We are a small local crew, and reviews are genuinely how people find us.',
  ask: 'Would you mind leaving one? It takes about twenty seconds.',
  button: 'Leave a review',
  signoff: 'Aldo and the crew at BOLD Home Solutions',
  unsubscribe: 'Unsubscribe',
};

/* Sample reviews for the live widget at the bottom of the page. Invented, and
   labelled as such on the page — a demo that shows fabricated reviews under a
   real business name is the exact thing this service exists to avoid. */
export const SAMPLE_REVIEWS = [
  { name: 'Marisol R.', stars: 5, when: '2 days ago',
    text: 'Crew showed up when they said they would and cleaned up every night. The quote never moved.' },
  { name: 'Dan W.', stars: 5, when: '1 week ago',
    text: 'Straight answers, no pressure, and they caught a rot problem under the sink the last two guys missed.' },
  { name: 'Priya N.', stars: 5, when: '2 weeks ago',
    text: 'Booked Monday, done Thursday. Sent photos every day since I was out of town.' },
  { name: 'Kev T.', stars: 4, when: '3 weeks ago',
    text: 'Ran a day over because of rain, but they told me before I had to ask. Work is solid.' },
];

/* One business across the whole page means one rating and one count — the
   widget and the profile mock-up read the same two numbers, or a prospect
   sees 127 reviews in one screen and 37 in the next. */
export const SAMPLE_RATING = PROFILE.rating;
export const SAMPLE_COUNT = PROFILE.count;
