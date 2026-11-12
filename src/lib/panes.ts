/** The three panes of the app, in swipe order. Pure so the bar and swipe logic can be tested. */
export const PANES = [
  { href: "/", label: "Keep" },
  { href: "/you", label: "Yours" },
  { href: "/reflect", label: "Look back" },
] as const;

export type PaneHref = (typeof PANES)[number]["href"];

export function paneIndexForPath(pathname: string): number {
  if (pathname === "/") return 0;
  return PANES.findIndex((p) => p.href !== "/" && pathname.startsWith(p.href));
}

export function adjacentPane(pathname: string, direction: "left" | "right"): PaneHref | null {
  const i = paneIndexForPath(pathname);
  if (i < 0) return null;
  const j = direction === "left" ? i + 1 : i - 1; // swipe left = move to the pane on the right
  return PANES[j]?.href ?? null;
}

/**
 * Decide whether a touch gesture counts as a pane swipe. Conservative on purpose:
 * mostly horizontal, long enough, and not started at the screen edge (iOS back gesture).
 */
export function classifySwipe(
  dx: number,
  dy: number,
  startX: number,
  viewportWidth: number,
  opts = { minDistance: 70, edge: 24, ratio: 2 },
): "left" | "right" | null {
  if (startX < opts.edge || startX > viewportWidth - opts.edge) return null;
  if (Math.abs(dx) < opts.minDistance) return null;
  if (Math.abs(dx) < opts.ratio * Math.abs(dy)) return null;
  return dx < 0 ? "left" : "right";
}
