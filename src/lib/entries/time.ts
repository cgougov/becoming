/**
 * Day boundaries in the user's timezone. "Today" on the home screen must follow
 * the phone's local day, not the server's UTC day.
 */
export function startOfDayInTimeZone(now: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  // Elapsed time since local midnight, subtracted from `now`, lands exactly on local midnight.
  const sinceMidnightMs =
    ((get("hour") * 60 + get("minute")) * 60 + get("second")) * 1000 + now.getMilliseconds();
  return new Date(now.getTime() - sinceMidnightMs);
}

export function formatTimeInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);
}

export function formatDayLabel(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "long", day: "numeric" }).format(date);
}

/** Monday 00:00 in the user's timezone. */
export function startOfWeekInTimeZone(now: Date, timeZone: string): Date {
  const dayStart = startOfDayInTimeZone(now, timeZone);
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(now);
  const offset = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(weekday);
  // Step back day by day (not 24h × n) so DST transitions inside the week don't shift midnight.
  let d = dayStart;
  for (let i = 0; i < offset; i++) d = startOfDayInTimeZone(new Date(d.getTime() - 1), timeZone);
  return d;
}

/** The user's local calendar day as YYYY-MM-DD (matches a Postgres `date`). */
export function localDay(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Hour of day (0–23) in the user's timezone. */
export function localHour(now: Date, timeZone: string): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(now));
}

/** The seven local days of the current week (Mon–Sun) as YYYY-MM-DD, for the rhythm dots. */
export function weekDays(now: Date, timeZone: string): string[] {
  const start = startOfWeekInTimeZone(now, timeZone);
  const days: string[] = [];
  let d = start;
  for (let i = 0; i < 7; i++) {
    days.push(localDay(d, timeZone));
    // Jump into the next local day safely (26h) then snap to its midnight.
    d = startOfDayInTimeZone(new Date(d.getTime() + 26 * 3600_000), timeZone);
  }
  return days;
}
