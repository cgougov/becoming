import { describe, expect, it } from "vitest";
import { formatTimeInTimeZone, startOfDayInTimeZone } from "./time";

describe("startOfDayInTimeZone", () => {
  it("returns local midnight in New York (EST)", () => {
    // 2026-01-15 03:30 UTC = Jan 14 22:30 in New York
    const now = new Date("2026-01-15T03:30:00Z");
    const start = startOfDayInTimeZone(now, "America/New_York");
    expect(start.toISOString()).toBe("2026-01-14T05:00:00.000Z");
  });

  it("handles daylight saving time (EDT)", () => {
    const now = new Date("2026-07-04T16:45:12Z"); // 12:45 EDT
    expect(startOfDayInTimeZone(now, "America/New_York").toISOString()).toBe("2026-07-04T04:00:00.000Z");
  });

  it("works for UTC", () => {
    const now = new Date("2026-03-01T23:59:59Z");
    expect(startOfDayInTimeZone(now, "UTC").toISOString()).toBe("2026-03-01T00:00:00.000Z");
  });
});

describe("formatTimeInTimeZone", () => {
  it("formats in 12-hour local time", () => {
    expect(formatTimeInTimeZone(new Date("2026-01-15T03:05:00Z"), "America/New_York")).toBe("10:05 PM");
  });
});

describe("startOfWeekInTimeZone", () => {
  it("returns the Monday of the current week", async () => {
    const { startOfWeekInTimeZone } = await import("./time");
    // Thu 2026-11-12 16:25 UTC (11:25 EST)
    const now = new Date("2026-11-12T16:25:00Z");
    expect(startOfWeekInTimeZone(now, "America/New_York").toISOString()).toBe("2026-11-09T05:00:00.000Z");
  });

  it("is the same day on a Monday", async () => {
    const { startOfWeekInTimeZone } = await import("./time");
    const now = new Date("2026-11-09T23:00:00Z"); // Mon 18:00 EST
    expect(startOfWeekInTimeZone(now, "America/New_York").toISOString()).toBe("2026-11-09T05:00:00.000Z");
  });

  it("handles a week containing the fall DST change", async () => {
    const { startOfWeekInTimeZone } = await import("./time");
    // Sun 2026-11-01 was the DST end in the US. Thu Nov 5 12:00 EST → Monday Nov 2 00:00 EST (05:00Z)
    const now = new Date("2026-11-05T17:00:00Z");
    expect(startOfWeekInTimeZone(now, "America/New_York").toISOString()).toBe("2026-11-02T05:00:00.000Z");
  });
});

describe("localDay / localHour / weekDays", () => {
  it("gives the local date and hour in New York", async () => {
    const { localDay, localHour } = await import("./time");
    const now = new Date("2026-11-13T03:30:00Z"); // Nov 12, 22:30 EST
    expect(localDay(now, "America/New_York")).toBe("2026-11-12");
    expect(localHour(now, "America/New_York")).toBe(22);
  });

  it("lists Monday through Sunday of the current week", async () => {
    const { weekDays } = await import("./time");
    const now = new Date("2026-11-13T17:00:00Z"); // Fri Nov 13
    expect(weekDays(now, "America/New_York")).toEqual([
      "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15",
    ]);
  });

  it("is DST-safe across the fall change", async () => {
    const { weekDays } = await import("./time");
    const now = new Date("2026-10-30T12:00:00Z"); // Fri Oct 30; DST ends Sun Nov 1
    const days = weekDays(now, "America/New_York");
    expect(days[0]).toBe("2026-10-26");
    expect(days[6]).toBe("2026-11-01");
    expect(new Set(days).size).toBe(7);
  });
});
