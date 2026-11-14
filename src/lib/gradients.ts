/**
 * One palette for collection tiles, their dots and tag chips, so they read as a set.
 * Every tone has the same softness (pastel, similar lightness); only the hue moves.
 * Each tile fades from its tone into the same dusk base, so the grid looks like one family,
 * and a collection's dot is exactly its tile's tone (Christian, 2026-11-14).
 */
export const TONES = [
  "#ff9b7a", // coral
  "#6fc6e2", // aqua
  "#ffd36e", // butter
  "#c39bf2", // lilac
  "#7fd6a6", // mint
  "#f79cc4", // pink
  "#8f9ff7", // periwinkle
  "#e8b98a", // sand
] as const;

/** The shared dark every tile fades into. */
export const DUSK = "#1a1822";

function hash(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

/** A key's tone: the same for its tile, its dot and its chips. */
export function toneFor(key: string): string {
  return TONES[hash(key) % TONES.length];
}

/**
 * Collections get tones in order (1st coral, 2nd aqua, ...), so neighbors in the grid never
 * match. Order is chosen so side-by-side and stacked tiles are different families.
 */
export function toneAt(index: number): string {
  return TONES[((index % TONES.length) + TONES.length) % TONES.length];
}

/** id → tone for a user's collections, given in their display order. */
export function collectionTones(ordered: { id: string }[]): Map<string, string> {
  return new Map(ordered.map((c, i) => [c.id, toneAt(i)]));
}

export function gradientOf(tone: string): string {
  return `linear-gradient(165deg, ${tone} 0%, color-mix(in oklab, ${tone} 72%, ${DUSK}) 50%, color-mix(in oklab, ${tone} 38%, ${DUSK}) 100%)`;
}

export function gradientFor(key: string): string {
  return gradientOf(toneFor(key));
}
