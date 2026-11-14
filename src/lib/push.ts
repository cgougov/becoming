import { EVENING_HELLOS, MORNING_HELLOS } from "./checkins";
import { LIVE_MINUTES, MOMENT_ASKS } from "./moment";

/**
 * When Pip taps you on the shoulder. Pure, so it's testable; the tick route does the I/O.
 * At most three a day, and each only once: the morning check-in, the moment, the wind-down.
 */
export type PushKind = "morning" | "evening" | "moment";

/** Local minutes after midnight for each nudge, and how long after it we'll still send it. */
export const MORNING_AT = 8 * 60 + 30; // 8:30
export const EVENING_AT = 22 * 60; // 10pm
export const SEND_WINDOW_MIN = 45;

export interface DueInput {
  localMinutes: number;
  now: Date;
  sent: Set<PushKind>;
  morningDone: boolean; // checked or skipped
  eveningDone: boolean;
  moment: { at: Date; status: "scheduled" | "kept" | "missed" } | null;
}

export function dueNotifications(i: DueInput): PushKind[] {
  const out: PushKind[] = [];
  const inWindow = (at: number) => i.localMinutes >= at && i.localMinutes < at + SEND_WINDOW_MIN;
  if (!i.sent.has("morning") && !i.morningDone && inWindow(MORNING_AT)) out.push("morning");
  if (!i.sent.has("evening") && !i.eveningDone && inWindow(EVENING_AT)) out.push("evening");
  if (i.moment && !i.sent.has("moment") && i.moment.status === "scheduled") {
    const late = i.now.getTime() - i.moment.at.getTime();
    // Only while it's still live; a moment we couldn't deliver in time just passes quietly.
    if (late >= 0 && late < Math.min(LIVE_MINUTES, 30) * 60_000) out.push("moment");
  }
  return out;
}

export function localMinutes(now: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return get("hour") * 60 + get("minute");
}

/** What the notification says, in Pip's voice. Seeded so a day's line is stable. */
export function pushMessage(kind: PushKind, seed: number): { title: string; body: string; url: string } {
  const pick = (pool: readonly string[]) => pool[Math.abs(seed) % pool.length];
  if (kind === "morning") return { title: "Pip", body: pick(MORNING_HELLOS), url: "/" };
  if (kind === "evening") return { title: "Pip", body: pick(EVENING_HELLOS), url: "/" };
  return { title: "Pip", body: pick(MOMENT_ASKS), url: "/" };
}
