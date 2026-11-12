/**
 * Where the companion will live. Reserved now so the layout doesn't shift when
 * the animated character arrives (M3 design pass). Purely decorative until then.
 */
export function CompanionSlot() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-5 z-10 h-11 w-11 rounded-full border border-dashed border-current/20"
      style={{ bottom: "calc(4.25rem + env(safe-area-inset-bottom))" }}
    />
  );
}
