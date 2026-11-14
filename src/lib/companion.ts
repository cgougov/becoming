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
  good?: boolean; // the partner read it as a good moment
}

// Pip's voice: a kawaii C-3PO (docs/VOICE.md). Short, mostly lowercase, a little formal and
// fussy, easily delighted. Never AI cadence. test: src/lib/voice.test.ts checks every line.
const GENERAL = [
  "kept. I shall guard it with my life.",
  "filed under 'excellent decisions'.",
  "oh my. how wonderfully specific.",
  "noted. with enthusiasm.",
  "by my calculations, that was a good one.",
  "I have saved it. twice, to be safe.",
  "how very human of you. I approve.",
  "splendid. truly splendid.",
  "another page for the scrapbook!",
  "I'll remember that. it's my whole job.",
  "acknowledged ♡",
  "oh, lovely. lovely lovely.",
];
const PHOTO = ["oh! a photograph. how thrilling.", "I'm told this is called art. I agree.", "framed. metaphorically.", "a picture! I'll keep it very safe.", "ooh. let me look closer. lovely."];
const FIRST_TODAY = ["the first one today! I was waiting.", "oh, hello. I've been very patient.", "there you are. the day may begin.", "good whenever-it-is."];
const MANY_TODAY = ["goodness. you are a busy person.", "another! I'm running out of shelves.", "my, what a full day.", "you're on a roll. I'm keeping up."];
const LATE = ["it is very late. I am keeping it anyway.", "you should be asleep. so should I.", "a midnight one. how mysterious.", "quietly saved. bed soon?"];
const EARLY = ["you're up early. so am I, apparently.", "good morning ♡", "an early one! how industrious."];
const BACK = ["oh! you're back. I kept everything tidy.", "I kept everything exactly where you left it.", "hello again. I hoped you'd come.", "there you are! hello hello."];
const GOOD = ["oh! that sounds lovely.", "goodness, a good one!", "how wonderful. I'm doing a little dance.", "yay! (that's the technical term.)"];
export const FRESH_HELLO = "oh! hello. I'm Pip.";
export const TAP_LINES = ["hee. that tickles.", "oh! hello.", "yes? I'm here.", "boop. I'm told that's a greeting.", "please, I'm working. (I'm not.)"];
export const HARD_LINE = "oh no. I'm sorry.";

/** Every curated line Pip can say, for the voice test. */
export const ALL_COMPANION_LINES = [...GENERAL, ...PHOTO, ...FIRST_TODAY, ...MANY_TODAY, ...LATE, ...EARLY, ...BACK, ...GOOD, FRESH_HELLO, ...TAP_LINES, HARD_LINE];

export function reactionPool(ctx: KeptContext): string[] {
  const pool: string[] = [];
  if (ctx.moment) return [...MOMENT_KEPT];
  if (ctx.good) pool.push(...GOOD, ...GOOD, ...GOOD);
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
