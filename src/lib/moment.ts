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

/** The companion's lines for the moment. Kawaii, hopecore, never pressure. */
export const MOMENT_ASKS = ["what's right now?", "this exact minute ♡", "quick, what's around you?", "one thing from right now", "look up. what do you see?"];
export const MOMENT_ENCOURAGEMENT = [
  "no rush. it counts whenever.",
  "anything at all ♡",
  "boring is allowed.",
  "a photo is plenty.",
  "you're doing it.",
];
export const MOMENT_KEPT = ["that's today ♡", "got the moment", "perfect, that's it", "kept it. go live."];
