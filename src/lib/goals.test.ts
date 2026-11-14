import { describe, expect, it } from "vitest";
import { goalNudge, periodStart, progressLine } from "./goals";

describe("goals", () => {
  it("finds the start of the period", () => {
    const now = new Date("2026-11-14T20:00:00Z"); // Sat 3pm in New York
    expect(periodStart("month", now, "America/New_York").toISOString()).toBe("2026-11-01T04:00:00.000Z");
    expect(periodStart("year", now, "America/New_York").toISOString()).toBe("2026-01-01T05:00:00.000Z");
    expect(periodStart("week", now, "America/New_York").toISOString()).toBe("2026-11-09T05:00:00.000Z");
  });
  it("counts without pressure", () => {
    expect(progressLine(3, "week")).toBe("3 things this week");
    expect(progressLine(1, "month")).toBe("1 thing this month");
    expect(progressLine(0, "week")).toBe("nothing yet this week. it's early.");
  });
  it("nudges every so often, never daily", () => {
    expect(goalNudge({ hasWeekGoal: false, hasAnyGoal: true, weekday: 0 })).toBe("week");
    expect(goalNudge({ hasWeekGoal: false, hasAnyGoal: true, weekday: 3 })).toBeNull();
    expect(goalNudge({ hasWeekGoal: false, hasAnyGoal: false, weekday: 4 })).toBe("week");
    expect(goalNudge({ hasWeekGoal: true, hasAnyGoal: true, weekday: 1 })).toBeNull();
  });
});
