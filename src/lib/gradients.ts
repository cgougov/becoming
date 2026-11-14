/**
 * One palette for collection tiles, their dots and tag chips, so they read as a set.
 * Every tone has the same softness (pastel, similar lightness); only the hue moves.
 * Each tile fades from its tone into the same dusk base, so the grid looks like one family,
 * and a collection's dot is exactly its tile's tone (Christian, 2026-11-14).
 */
export const TONES = [
  "#f2a77e", // peach
  "#f1c77c", // honey
  "#a6d4a9", // sage
  "#8fc9d8", // sky
  "#a7b3ef", // periwinkle
  "#c7a8ea", // lilac
  "#eea3bf", // rose
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

export function gradientFor(key: string): string {
  const tone = toneFor(key);
  return `linear-gradient(160deg, ${tone} 0%, color-mix(in oklab, ${tone} 40%, ${DUSK}) 100%)`;
}
