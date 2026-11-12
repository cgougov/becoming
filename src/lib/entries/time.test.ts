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
