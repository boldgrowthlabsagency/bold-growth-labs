'use client';
export default function ScrollIndicator() {
  return (
    <div className="mt-12 flex items-center gap-3.5" aria-hidden>
      <span className="relative block h-9 w-px overflow-hidden bg-white/15">
        <span className="scroll-tick absolute left-0 top-0 block h-3 w-px bg-orange" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Scroll</span>
    </div>
  );
}
