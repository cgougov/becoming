import { localDay, startOfDayInTimeZone, startOfWeekInTimeZone } from "./entries/time";

/**
 * Goals, alive: a direction counts what you kept toward it in its own horizon
 * ("3 things this week", "12 this month"). No targets, no streaks, no red numbers.
 */
export type Horizon = "week" | "month" | "year";

/** When this week / month / year began, in the user's timezone. */
export function periodStart(horizon: Horizon, now: Date, timeZone: string): Date {
  if (horizon === "week") return startOfWeekInTimeZone(now, timeZone);
  const [y, m] = localDay(now, timeZone).split("-").map(Number);
  // Noon UTC on the 1st is the 1st everywhere from UTC-11 to UTC+11.
  return startOfDayInTimeZone(new Date(Date.UTC(y, horizon === "month" ? m - 1 : 0, 1, 12)), timeZone);
}

/** "3 things this week" · "1 thing this month" · "nothing yet this week. it's early." */
export function progressLine(count: number, horizon: Horizon): string {
  if (count === 0) return `nothing yet this ${horizon}. it's early.`;
  return `${count} ${count === 1 ? "thing" : "things"} this ${horizon}`;
}

/**
 * When Pip suggests a goal on Today. Gently, every so often, never daily:
 * no week goal → Sunday and Monday; no goals at all → also Thursday.
 */
export function goalNudge(i: { hasWeekGoal: boolean; hasAnyGoal: boolean; weekday: number }): "week" | null {
  if (i.hasWeekGoal) return null;
  if (i.weekday === 0 || i.weekday === 1) return "week";
  if (!i.hasAnyGoal && i.weekday === 4) return "week";
  return null;
}

export const GOAL_NUDGE_LINES = [
  "no plans this week? fine. suspicious, but fine.",
  "one small thing for this week?",
  "a goal for the week? tiny ones welcome.",
];
