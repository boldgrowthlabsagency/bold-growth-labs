'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addOnsOnce, addOnsMonthly, plans, type AddOn } from '@/lib/data';
import SectionReveal from './SectionReveal';
import MagneticButton from './MagneticButton';

/* Live-updating package builder. Totals animate between values rather than
   snapping, so the number feels considered rather than mechanical. */
function useCountUp(value: number) {
  const [shown, setShown] = useState(value);
  useMemo(() => {
    if (typeof window === 'undefined') { setShown(value); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(value); return; }
    let raf = 0; const from = shown, delta = value - from, t0 = performance.now(), dur = 420;
    const step = (t: number) => {
      const k = Math.min((t - t0) / dur, 1);
      setShown(Math.round(from + delta * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return shown;
}

export default function AddOnBuilder() {
  const [planId, setPlanId] = useState('redesign');
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  /* Selecting an item clears anything it replaces. The Local Growth Bundle and
     the two services inside it would otherwise all be tickable at once, and the
     running total would show a price no client would ever be quoted. */
  const toggle = (id: string) =>
    setPicked((p) => {
      const on = !p[id];
      const next = { ...p, [id]: on };
      if (!on) return next;
      const item = [...addOnsOnce, ...addOnsMonthly].find((a) => a.id === id);
      for (const other of item?.excludes ?? []) next[other] = false;
      return next;
    });

  /* One list at a time. Stacking both groups made this the longest block on
     the page and pushed the running total below the fold on a phone, which is
     the one thing that has to stay visible while you are picking. Selections
     persist across the switch — `picked` is keyed by id, not by which tab is
     showing — so nothing is lost by flipping between them. */
  const [billing, setBilling] = useState<'once' | 'monthly'>('once');

  /* One tip open at a time, tracked here rather than per-row, so opening a
     second one closes the first without any row needing to know about its
     siblings. */
  const [tip, setTip] = useState<string | null>(null);
  useEffect(() => {
    if (!tip) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setTip(null); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [tip]);

  const plan = plans.find((p) => p.id === planId)!;
  const all = [...addOnsOnce, ...addOnsMonthly];
  const once = all.filter((a) => picked[a.id]).reduce((s, a) => s + (a.once ?? 0), plan.price);
  const monthly = all.filter((a) => picked[a.id]).reduce((s, a) => s + (a.monthly ?? 0), 0);

  const onceShown = useCountUp(once);
  const monthlyShown = useCountUp(monthly);

  return (
    <section className="section relative overflow-hidden" style={{ background: 'var(--bold-slate)' }}>
      <div className="shell relative z-[2]">
        <SectionReveal><p className="eyebrow mb-6">Build your package</p></SectionReveal>
        <SectionReveal delay={60}><h2 className="display">Make it <span className="text-orange">yours.</span></h2></SectionReveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,.65fr)]">
          <div className="builder-panel p-6 sm:p-8">
            <div className="mb-7 flex flex-wrap gap-2">
              {plans.map((p) => (
                <button key={p.id} onClick={() => setPlanId(p.id)}
                  className={`inline-flex min-h-[44px] items-center rounded-full px-5 text-[12.5px] font-semibold transition-colors ${
                    planId === p.id ? 'bg-orange text-white' : 'border border-white/15 text-white/65 hover:text-white'
                  }`}>
                  {p.name} ${p.price}
                </button>
              ))}
            </div>

            <div className="billing-toggle mb-6 inline-flex p-1" role="tablist" aria-label="Billing type">
              {([['once', 'One-time'], ['monthly', 'Monthly']] as const).map(([k, label]) => {
                const on = billing === k;
                const n = (k === 'once' ? addOnsOnce : addOnsMonthly)
                  .filter((a) => picked[a.id]).length;
                return (
                  <button
                    key={k} type="button" role="tab" aria-selected={on}
                    onClick={() => setBilling(k)}
                    className={`inline-flex min-h-[40px] items-center gap-2 rounded-full px-5 text-[12.5px] font-semibold transition-colors ${
                      on ? 'bg-orange text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {label}
                    {/* the count is why hiding a list is safe — you can always
                        see that something is selected on the other tab */}
                    {n > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 font-mono text-[9.5px] ${on ? 'bg-white/25' : 'bg-orange/25 text-orange'}`}>
                        {n}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {billing === 'once'
              ? <AddGroup title="One-time" items={addOnsOnce} picked={picked} toggle={toggle} tip={tip} setTip={setTip} />
              : <AddGroup title="Monthly" items={addOnsMonthly} picked={picked} toggle={toggle} tip={tip} setTip={setTip} />}
          </div>

          <aside className="h-fit rounded-[var(--r-lg)] border border-orange/25 bg-[rgba(var(--orange-rgb),.05)] p-7 lg:sticky lg:top-24">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Your build</p>
            <p className="mt-4 text-sm text-white/60">{plan.name}</p>
            <p className="mt-1 text-[clamp(2.4rem,5vw,3.4rem)] font-extrabold leading-none tracking-tight tabular-nums">
              ${onceShown.toLocaleString()}
            </p>
            <p className="text-xs text-white/45">one-time</p>
            <div className="my-6 h-px bg-white/10" />
            <p className="text-[clamp(1.4rem,3vw,1.9rem)] font-extrabold leading-none tabular-nums">
              ${monthlyShown.toLocaleString()}<span className="text-sm font-medium text-white/50">/mo</span>
            </p>
            <p className="mt-6 text-xs leading-relaxed text-white/45">
              50% up front, 50% when you&rsquo;re live. No payment now &mdash; this just tells us what to quote.
            </p>
            <MagneticButton href="#contact" className="mt-6 w-full justify-center">Start My Build</MagneticButton>
          </aside>
        </div>
      </div>
    </section>
  );
}

type GroupProps = {
  title: string;
  items: AddOn[];
  picked: Record<string, boolean>;
  toggle: (id: string) => void;
  tip: string | null;
  setTip: (id: string | null) => void;
  className?: string;
};

function AddGroup({ title, items, picked, toggle, tip, setTip, className = '' }: GroupProps) {
  return (
    <div className={className}>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-orange">{title}</p>
      <ul className="ab-list divide-y divide-white/[0.07]">
        {items.map((a) => (
          <AddRow
            key={a.id}
            item={a}
            on={!!picked[a.id]}
            toggle={toggle}
            open={tip === a.id}
            setTip={setTip}
          />
        ))}
      </ul>
    </div>
  );
}

function AddRow({
  item, on, toggle, open, setTip,
}: { item: AddOn; on: boolean; toggle: (id: string) => void; open: boolean; setTip: (id: string | null) => void }) {
  const row = useRef<HTMLLIElement>(null);
  const [flip, setFlip] = useState(false);

  /* Decide which side of the row the card sits on at the moment it opens,
     from the row's real position — a card pinned below a row near the bottom
     of the viewport would open off-screen. Nothing in the flow moves either
     way, because the card is absolutely positioned. */
  /* Which side the card opens on is decided from the row's real position and
     the card's real height. A fixed height guess clipped the longest
     description off the bottom on the last row; assuming there is always room
     above clipped it off the top when a row sat under the sticky nav. So:
     measure both, and if neither side fits, take the roomier one. */
  const place = useCallback(() => {
    const el = row.current;
    const r = el?.getBoundingClientRect();
    if (!el || !r) return;
    const card = el.querySelector('.ab-tip') as HTMLElement | null;
    const need = (card?.offsetHeight || 120) + 16;
    const below = window.innerHeight - r.bottom;
    const above = r.top;
    setFlip(below < need && (above >= need || above > below));
  }, []);

  /* Keep it placed while it is open — scrolling with a card up would otherwise
     leave it pinned to a side that no longer has room. */
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const on = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; place(); }); };
    window.addEventListener('scroll', on, { passive: true, capture: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on, true);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [open, place]);

  const show = () => { place(); setTip(item.id); };
  const hide = () => setTip(null);

  return (
    <li
      ref={row}
      className={`ab-row${open ? ' is-tip' : ''}`}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') show(); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') hide(); }}
    >
      <button
        type="button"
        onClick={() => toggle(item.id)}
        aria-pressed={on}
        onFocus={show}
        onBlur={hide}
        className="ab-pick group flex w-full items-center gap-4 py-3 text-left"
      >
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors ${
          on ? 'border-orange bg-orange text-white' : 'border-white/20 text-transparent group-hover:border-white/45'
        }`}>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 12.5l5.2 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className={`ab-label flex-1 text-[14.5px] transition-colors ${on ? 'text-white' : 'text-white/70'}`}>
          {item.label}
        </span>
        <span className="shrink-0 font-mono text-[12px] text-white/55">
          {item.note ? <em className="not-italic text-white/35">{item.note} </em> : null}
          {item.once ? `+$${item.once}` : ''}{item.once && item.monthly ? ' + ' : ''}
          {item.monthly ? `$${item.monthly}/mo` : ''}
        </span>
      </button>

      {/* Separate control, not nested inside the toggle — a button inside a
          button is invalid, and on touch the two need different jobs: tap the
          row to select it, tap this to ask what it is. */}
      <button
        type="button"
        className="ab-what"
        aria-label={`What is ${item.label}?`}
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); if (open) { hide(); } else { show(); } }}
        onFocus={show}
        onBlur={hide}
      >
        <span aria-hidden>?</span>
      </button>

      <span className={`ab-tip${flip ? ' ab-tip--up' : ''}`} role="tooltip" aria-hidden={!open}>
        {item.desc}
      </span>
    </li>
  );
}
