import { SMS_MESSAGE, EMAIL_MESSAGE, EXAMPLE_BIZ } from '@/lib/reviewflow';

/* ============================================================
   WHAT THE CUSTOMER RECEIVES — two phones, full size

   The walkthrough above shows the sequence. This shows the two
   things an actual customer holds in their hand, drawn properly:
   an iOS message thread and an email, at a size a prospect can
   read across a table.

   Drawn in CSS rather than shipped as a screenshot. A screenshot
   of a phone goes soft on a retina display, cannot be edited when
   the copy changes, and would have to be regenerated every time
   the message is reworded — the copy lives in lib/reviewflow.ts
   and both the small screen and these read from it.

   Deliberately light-themed inside the bezel: a phone in a dark
   room is a design flourish, but a prospect reading this is
   comparing it to the messages on their own screen, which are
   almost certainly light.
   ============================================================ */

function Bezel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="rp-fig">
      <div className="rp-phone">
        <div className="rp-phone__screen">
          {/* status bar: the detail that makes the rest read as a phone */}
          <div className="rp-status">
            <span className="rp-status__time">9:41</span>
            <span className="rp-island" aria-hidden />
            <span className="rp-status__icons" aria-hidden>
              <svg viewBox="0 0 18 12" className="rp-sig"><path d="M1 9h2v3H1zM5.5 6.5h2V12h-2zM10 4h2v8h-2zM14.5 1h2v11h-2z" /></svg>
              <svg viewBox="0 0 16 12" className="rp-wifi"><path d="M8 10.4l1.9-2.3a3 3 0 00-3.8 0zM8 6.2c1.2 0 2.3.4 3.2 1.2l1.3-1.6A7 7 0 008 4a7 7 0 00-4.5 1.8l1.3 1.6A5 5 0 018 6.2zM8 2.2c1.9 0 3.7.7 5.1 1.8l1.3-1.6A10 10 0 008 0a10 10 0 00-6.4 2.4l1.3 1.6A8 8 0 018 2.2z" /></svg>
              <span className="rp-batt"><i /></span>
            </span>
          </div>
          {children}
        </div>
      </div>
      <figcaption className="rp-cap">{label}</figcaption>
    </figure>
  );
}

export default function ReviewPreview() {
  return (
    <div className="rp-pair">
      {/* ---------------- the text ---------------- */}
      <Bezel label="The text — twenty minutes after the job closes">
        <div className="rp-msg">
          <header className="rp-msg__head">
            <span className="rp-msg__back" aria-hidden>‹</span>
            <span className="rp-avatar" aria-hidden>B</span>
            <span className="rp-msg__who">{SMS_MESSAGE.from}</span>
          </header>

          <div className="rp-thread">
            <p className="rp-when">{SMS_MESSAGE.when}</p>

            {/* incoming SMS is grey on iOS — green is what the customer sends */}
            <div className="rp-bub rp-bub--in">
              {SMS_MESSAGE.body}
              <a className="rp-bub__link">{SMS_MESSAGE.link}</a>
              <span className="rp-bub__fine">{SMS_MESSAGE.optOut}</span>
            </div>

            <div className="rp-bub rp-bub--out">{SMS_MESSAGE.reply}</div>
            <p className="rp-read">Read 4:23 PM</p>
          </div>

          <div className="rp-bar" aria-hidden>
            <span className="rp-bar__field">iMessage</span>
          </div>
        </div>
      </Bezel>

      {/* ---------------- the email ---------------- */}
      <Bezel label="The email — next morning, only if they have not reviewed">
        <div className="rp-mail">
          <header className="rp-mail__head">
            <span className="rp-msg__back" aria-hidden>‹</span>
            <span className="rp-mail__box">Inbox</span>
          </header>

          <div className="rp-mail__body">
            <h3 className="rp-mail__subject">{EMAIL_MESSAGE.subject}</h3>
            <div className="rp-mail__from">
              <span className="rp-avatar rp-avatar--mail" aria-hidden>B</span>
              <span>
                <strong>{EMAIL_MESSAGE.from}</strong>
                <em>{EMAIL_MESSAGE.address}</em>
              </span>
              <span className="rp-mail__time">{EMAIL_MESSAGE.when}</span>
            </div>

            <div className="rp-mail__sheet">
              <p className="rp-mail__hi">{EMAIL_MESSAGE.greeting}</p>
              <p>{EMAIL_MESSAGE.body}</p>
              <p>{EMAIL_MESSAGE.ask}</p>

              <span className="rp-mail__stars" aria-hidden>
                {Array.from({ length: 5 }).map((_, k) => (
                  <svg key={k} viewBox="0 0 24 24">
                    <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9z" />
                  </svg>
                ))}
              </span>

              <span className="rp-mail__btn">{EMAIL_MESSAGE.button}</span>
              <p className="rp-mail__sign">— {EMAIL_MESSAGE.signoff}</p>
              <p className="rp-mail__unsub">{EMAIL_MESSAGE.unsubscribe}</p>
            </div>
          </div>

          {/* iOS Mail's bottom toolbar — without it the screen reads as a web
              page in a phone frame rather than as mail */}
          <div className="rp-mail__tools" aria-hidden>
            {['M8 4l-6 6 6 6', 'M8 4l6 6-6 6', 'M3 6l7 6 7-6', 'M10 3v10M6 7l4-4 4 4'].map((d) => (
              <svg key={d} viewBox="0 0 20 20"><path d={d} /></svg>
            ))}
          </div>
        </div>
      </Bezel>

      <p className="rp-note">
        {EXAMPLE_BIZ} is our own business, used throughout this page as a worked example —
        the messages are written the way real ones go out, and the reviews behind them are
        samples. Yours go out in your own name, from your own number and address.
      </p>
    </div>
  );
}
