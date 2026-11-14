import { MOMENT_KEPT } from "@/lib/moment";

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

// Pip's voice: a kawaii C-3PO (docs/VOICE.md). Short, mostly lowercase, a little formal and
// fussy, easily delighted. Never AI cadence. test: src/lib/voice.test.ts checks every line.
const GENERAL = [
  "kept.",
  "oh, lovely.",
  "I have saved it. carefully.",
  "noted!",
  "oh my. good one.",
  "filed away, safe and sound.",
  "I'll remember that.",
  "how nice.",
  "acknowledged ♡",
  "yes. very good.",
  "got it, got it.",
  "splendid.",
];
const PHOTO = ["oh! a photograph.", "how pretty.", "I like this one very much.", "a picture. wonderful.", "ooh. let me look."];
const FIRST_TODAY = ["the first one today!", "oh, hello. I was hoping you'd come by.", "there you are.", "good whenever-it-is."];
const MANY_TODAY = ["goodness, what a full day.", "another! by my count, quite a lot.", "you are very busy. I am keeping up.", "more? splendid."];
const LATE = ["it is very late. I am keeping it anyway.", "you should be asleep. so should I.", "a midnight one. how mysterious.", "quietly saved. bed soon?"];
const EARLY = ["you're up early. so am I, apparently.", "good morning ♡", "an early one! how industrious."];
const BACK = ["oh! you're back.", "I kept everything exactly where you left it.", "hello again. I hoped you'd come.", "there you are! hello hello."];
export const FRESH_HELLO = "oh! hello. I'm Pip.";
export const TAP_LINES = ["hee. that tickles.", "oh! hello.", "yes? I'm here.", "boop."];
export const HARD_LINE = "oh no. I'm sorry.";

/** Every curated line Pip can say, for the voice test. */
export const ALL_COMPANION_LINES = [...GENERAL, ...PHOTO, ...FIRST_TODAY, ...MANY_TODAY, ...LATE, ...EARLY, ...BACK, FRESH_HELLO, ...TAP_LINES, HARD_LINE];

export function reactionPool(ctx: KeptContext): string[] {
  const pool: string[] = [];
  if (ctx.moment) return [...MOMENT_KEPT];
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
  return pool[Math.floor(rand() * pool.length)] ?? "kept.";
}
