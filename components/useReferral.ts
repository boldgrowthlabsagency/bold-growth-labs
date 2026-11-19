'use client';
import { useEffect, useState } from 'react';

/* Who referred this visitor, from a shared link (boldgrowthlabs.io/?ref=maria-lopez).
   Kept for the browser session, so the credit survives a reload or a jump
   between sections. Empty when there is no referral. */
export function useReferral() {
  const [name, setName] = useState('');
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get('ref');
      const val = ref ? ref.replace(/-/g, ' ').slice(0, 60) : sessionStorage.getItem('bgl-ref') || '';
      if (ref) sessionStorage.setItem('bgl-ref', val);
      setName(val);
    } catch { /* private mode — the link still works for this page view */ }
  }, []);
  return name;
}
