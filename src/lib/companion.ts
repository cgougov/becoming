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

/**
 * What the companion says when you keep something. Kawaii body, hopecore voice
 * (PRODUCT.md): tiny, warm, earnest, never ironic, never about streaks. Picked by context,
 * never the same as the last one.
 */
export interface KeptContext {
  hasPhoto: boolean;
  hasText: boolean;
  localHour: number;
  keptTodayBefore: number; // how many were already kept today, before this one
  mood: Mood;
  moment?: boolean; // kept during the daily moment
}

const GENERAL = ["kept ♡", "yay", "love that", "got it", "nice one", "ooh", "noted, gently", "tiny win", "that's yours now", "mm, yes", "saved ✧", "good one"];
const PHOTO = ["pretty", "ooh, look", "keeping that", "a moment ♡", "cute", "snap ✧"];
const FIRST_TODAY = ["hi again ♡", "first one today", "there you are", "good start"];
const MANY_TODAY = ["you're on a roll", "so much today", "full day ♡", "look at you"];
const LATE = ["sleepy keep", "night note ♡", "late one, nice", "sweet dreams soon"];
const EARLY = ["morning ♡", "early bird", "fresh start", "rise and keep"];
const BACK = ["missed you ♡", "welcome back", "there you are", "hi hi"];

export function reactionPool(ctx: KeptContext): string[] {
  const pool: string[] = [];
  if (ctx.moment) return ["that's today ♡", "got the moment", "perfect, that's it", "kept it. go live.", "right now, kept ♡"];
  if (ctx.mood === "curious") pool.push(...BACK, ...BACK); // weighted: it's glad you're back
  if (ctx.keptTodayBefore === 0) pool.push(...FIRST_TODAY);
  if (ctx.keptTodayBefore >= 4) pool.push(...MANY_TODAY);
  if (ctx.localHour >= 23 || ctx.localHour < 4) pool.push(...LATE, ...LATE);
  if (ctx.localHour >= 5 && ctx.localHour < 9) pool.push(...EARLY);
  if (ctx.hasPhoto) pool.push(...PHOTO, ...PHOTO);
  pool.push(...GENERAL);
  return pool;
}

export function pickReaction(ctx: KeptContext, last: string | null, rand: () => number = Math.random): string {
  const pool = reactionPool(ctx).filter((r) => r !== last);
  return pool[Math.floor(rand() * pool.length)] ?? "kept ♡";
}
