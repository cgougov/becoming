import { startOfDayInTimeZone } from "@/lib/entries/time";

/**
 * The daily moment: one random time inside the user's window. Pure, so it's testable.
 * Window values are minutes after local midnight (profiles.checkin_window_*).
 */
export function pickMomentTime(
  now: Date,
  timeZone: string,
  windowStart: number,
  windowEnd: number,
  rand: () => number = Math.random,
): Date {
  const dayStart = startOfDayInTimeZone(now, timeZone);
  const start = Math.min(windowStart, windowEnd);
  const end = Math.max(windowStart, windowEnd);
  // Never earlier than "now + 15 min" if we're creating it mid-day, so a late open still gets a moment.
  const earliestMs = Math.max(dayStart.getTime() + start * 60_000, now.getTime() + 15 * 60_000);
  const latestMs = dayStart.getTime() + end * 60_000;
  if (earliestMs >= latestMs) return new Date(latestMs); // window already over: pin to its end (will read as passed)
  return new Date(earliestMs + Math.floor(rand() * (latestMs - earliestMs)));
}

/** How long the moment stays "live" after its time. */
export const LIVE_MINUTES = 90;

export type MomentPhase = "upcoming" | "live" | "passed";

export function momentPhase(now: Date, at: Date): MomentPhase {
  const d = now.getTime() - at.getTime();
  if (d < 0) return "upcoming";
  if (d <= LIVE_MINUTES * 60_000) return "live";
  return "passed";
}

/** Pip's lines for the moment (docs/VOICE.md). Never pressure; missing it is never mentioned. */
export const MOMENT_ASKS = ["it's the moment! what's around you?", "quickly, what's right now?", "now, please. anything at all.", "look up. what do you see?", "this minute, if you don't mind."];
export const MOMENT_ENCOURAGEMENT = ["no rush. it counts whenever.", "boring is allowed.", "a photo is plenty.", "anything at all is fine.", "I'm not grading it."];
export const MOMENT_KEPT = ["right on time!", "that's today's moment. perfect.", "got it. now go back to it.", "oh good, I hoped you'd catch it."];
