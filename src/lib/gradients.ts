/**
 * Soft two-tone gradients for tiles with no photo (round 5: "I like the gradients").
 * Deterministic from a key so a collection or person always wears the same one.
 */
export const GRADIENTS: readonly [string, string][] = [
  ["#e9b98d", "#6f5a7a"],
  ["#9fc7b4", "#3d5a50"],
  ["#c9bfe8", "#4f4673"],
  ["#f2c6d3", "#7a4a5c"],
  ["#c9d6e8", "#55627a"],
  ["#f3d9a4", "#8a5a3a"],
  ["#b9e0dc", "#3f6b7a"],
  ["#e8c4b8", "#6b4a5a"],
];

export function gradientFor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 33 + key.charCodeAt(i)) >>> 0;
  const [a, b] = GRADIENTS[h % GRADIENTS.length];
  return `linear-gradient(160deg, ${a}, ${b})`;
}
