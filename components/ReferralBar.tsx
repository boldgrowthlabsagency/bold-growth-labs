'use client';
import { useState } from 'react';
import { REFERRAL } from '@/lib/blackfriday';
import { useReferral } from './useReferral';

/* Bottom bar for someone arriving on a referral link: the $100 the share
   message promised, said up front. Pinned to the bottom so it never fights
   the fixed Navbar. Renders nothing without a referral. */
export default function ReferralBar() {
  const name = useReferral();
  const [hidden, setHidden] = useState(false);
  if (!name || hidden) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-[760px] sm:bottom-5" role="status">
      <div className="flex items-center gap-3 rounded-2xl border border-orange/40 bg-[rgba(var(--navy-rgb),.92)] py-2.5 pl-4 pr-2 shadow-[0_18px_50px_rgba(0,0,0,.45)] backdrop-blur-md">
        <a href="#pricing" className="flex min-w-0 flex-1 items-center gap-3">
          <span className="min-w-0 text-[13px] leading-snug">
            <strong className="capitalize">{name}</strong> sent you.{' '}
            <span className="text-orange">${REFERRAL.give} off any build.</span>
          </span>
          <span className="ml-auto shrink-0 rounded-full bg-orange px-4 py-2 text-[12.5px] font-bold">See prices</span>
        </a>
        <button type="button" aria-label="Hide the referral banner" onClick={() => setHidden(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/50 hover:text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
    </div>
  );
}
