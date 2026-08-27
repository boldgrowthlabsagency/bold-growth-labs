'use client';
import { useId, useState } from 'react';

/* ============================================================
   DEMO ENQUIRY FORM

   Shared because validation, field state and the submitted state
   are mechanism, not look — the same split the wipe helper uses.
   Every class is prefixed with the brand's own token, so the
   three builds can lay this out completely differently without
   anything pulling them back to a common shape.

   IT NEVER SENDS ANYTHING. There is no endpoint, no fetch, no
   storage. These are fictional businesses, and a form that looks
   real on a page that isn't would collect a real address from
   someone who believed it. The submitted state says so plainly
   rather than thanking the visitor for a message nobody received,
   and the note under the button says so before they type.
   ============================================================ */

export type DemoFormProps = {
  /** brand token — 'sun' | 'rdg' | 'mrd' — drives every class name */
  prefix: string;
  /** the interest / project-type choices, in the brand's own language */
  options: string[];
  labels?: {
    name?: string; email?: string; phone?: string;
    interest?: string; message?: string; submit?: string;
  };
  /** placeholder for the free-text field */
  messageHint?: string;
  /* ---- conversion options ----
     A native <select> hides the whole service range behind a tap and reads as
     admin. Chips show what the studio actually does while the visitor is
     choosing, which is the one moment they are definitely paying attention. */
  interestAs?: 'select' | 'chips';
  /** one column scans faster than two and is what most people fill on a phone */
  layout?: 'two-col' | 'stacked';
  /** the free-text field starts collapsed — three visible fields, not five */
  collapseMessage?: boolean;
  /** short reassurance beside the button: what happens next, what it costs */
  reassure?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function DemoForm({
  prefix: p, options, labels = {}, messageHint,
  interestAs = 'select', layout = 'two-col', collapseMessage = false, reassure,
}: DemoFormProps) {
  const uid = useId();
  const [v, setV] = useState({ name: '', email: '', phone: '', interest: '', message: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [openMsg, setOpenMsg] = useState(!collapseMessage);

  const errors: Record<string, string> = {};
  if (!v.name.trim()) errors.name = 'Please add a name.';
  if (!v.email.trim()) errors.email = 'Please add an email.';
  else if (!EMAIL.test(v.email.trim())) errors.email = 'That email does not look right.';

  const show = (f: string) => (touched[f] || state !== 'idle') && errors[f];
  const set = (f: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((s) => ({ ...s, [f]: e.target.value }));
  const blur = (f: string) => () => setTouched((s) => ({ ...s, [f]: true }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (Object.keys(errors).length) {
      /* Move focus to the first problem rather than only colouring it — a
         visitor using a screen reader otherwise gets silence on submit. */
      const first = errors.name ? 'name' : 'email';
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setState('sending');
    window.setTimeout(() => setState('done'), 650);
  };

  if (state === 'done') {
    return (
      <div className={`${p}-form ${p}-form--done`} role="status" aria-live="polite">
        <p className={`${p}-form-donemark`} aria-hidden>✓</p>
        <h3 className={`${p}-form-doneh`}>Nothing was sent.</h3>
        <p className={`${p}-form-donep`}>
          This is a concept build, so the form is a demonstration — your details were not
          submitted, stored or emailed anywhere. On a live site this is where the enquiry
          would land in the studio&rsquo;s inbox, usually with an auto-reply on the way back.
        </p>
        <button
          type="button"
          className={`${p}-form-again`}
          onClick={() => { setV({ name: '', email: '', phone: '', interest: '', message: '' }); setTouched({}); setState('idle'); }}
        >
          Try it again
        </button>
      </div>
    );
  }

  return (
    <form className={`${p}-form ${p}-form--${layout}`} onSubmit={submit} noValidate>
      <div className={`${p}-form-row`}>
        <div className={`${p}-form-field`}>
          <label htmlFor={`${uid}-name`}>{labels.name ?? 'Name'}</label>
          <input
            id={`${uid}-name`} name="name" type="text" autoComplete="name"
            value={v.name} onChange={set('name')} onBlur={blur('name')}
            aria-invalid={!!show('name')}
            aria-describedby={show('name') ? `${uid}-name-e` : undefined}
          />
          {show('name') && <p className={`${p}-form-err`} id={`${uid}-name-e`}>{errors.name}</p>}
        </div>

        <div className={`${p}-form-field`}>
          <label htmlFor={`${uid}-email`}>{labels.email ?? 'Email'}</label>
          <input
            id={`${uid}-email`} name="email" type="email" autoComplete="email"
            value={v.email} onChange={set('email')} onBlur={blur('email')}
            aria-invalid={!!show('email')}
            aria-describedby={show('email') ? `${uid}-email-e` : undefined}
          />
          {show('email') && <p className={`${p}-form-err`} id={`${uid}-email-e`}>{errors.email}</p>}
        </div>
      </div>

      <div className={`${p}-form-row`}>
        <div className={`${p}-form-field`}>
          <label htmlFor={`${uid}-phone`}>{labels.phone ?? 'Phone'} <span>optional</span></label>
          <input
            id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel"
            value={v.phone} onChange={set('phone')}
          />
        </div>

        {interestAs === 'select' && (
          <div className={`${p}-form-field`}>
            <label htmlFor={`${uid}-interest`}>{labels.interest ?? 'Interested in'}</label>
            <select id={`${uid}-interest`} name="interest" value={v.interest} onChange={set('interest')}>
              <option value="">Choose one…</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        )}
      </div>

      {interestAs === 'chips' && (
        <fieldset className={`${p}-form-chips`}>
          <legend>{labels.interest ?? 'Interested in'} <span>optional</span></legend>
          <div className={`${p}-form-chipset`}>
            {options.map((o) => (
              <button
                key={o}
                type="button"
                className={`${p}-form-chip${v.interest === o ? ' is-on' : ''}`}
                aria-pressed={v.interest === o}
                onClick={() => setV((st) => ({ ...st, interest: st.interest === o ? '' : o }))}
              >
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {!openMsg ? (
        <button type="button" className={`${p}-form-more`} onClick={() => setOpenMsg(true)}>
          + {labels.message ?? 'Add a note'}
        </button>
      ) : (
        <div className={`${p}-form-field`}>
          <label htmlFor={`${uid}-message`}>{labels.message ?? 'Anything else'} <span>optional</span></label>
          <textarea
            id={`${uid}-message`} name="message" rows={4}
            placeholder={messageHint} value={v.message} onChange={set('message')}
            autoFocus={collapseMessage}
          />
        </div>
      )}

      <div className={`${p}-form-foot`}>
        <button type="submit" className={`${p}-form-submit`} disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : (labels.submit ?? 'Send enquiry')}
        </button>
        <div className={`${p}-form-foot-text`}>
          {reassure && <p className={`${p}-form-reassure`}>{reassure}</p>}
          <p className={`${p}-form-note`}>
            Demonstration only — this form does not send, store or email anything.
          </p>
        </div>
      </div>
    </form>
  );
}
