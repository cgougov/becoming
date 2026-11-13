/**
 * How the companion greets you on arrival, from your rhythm. Never sad, never guilt.
 * (PRODUCT.md: "arrival after quiet days = curious, never sad")
 */
export type Mood = "idle" | "fresh" | "curious";

export function arrivalMood(daysSinceLastKept: number | null): Mood {
  if (daysSinceLastKept === null) return "fresh"; // never kept anything: welcoming
  if (daysSinceLastKept >= 3) return "curious"; // been a while: perks up, no comment
  return "idle";
}

export function daysBetween(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / 86_400_000);
}
