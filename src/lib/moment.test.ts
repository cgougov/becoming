import { describe, expect, it } from "vitest";
import { LIVE_MINUTES, momentPhase, pickMomentTime } from "./moment";

const tz = "America/New_York";

describe("pickMomentTime", () => {
  it("lands inside the window on the local day", () => {
    const now = new Date("2026-11-14T06:00:00Z"); // 1:00 EST
    for (const r of [0, 0.25, 0.5, 0.999]) {
      const at = pickMomentTime(now, tz, 600, 1260, () => r); // 10:00–21:00
      const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "2-digit", hourCycle: "h23" }).format(at));
      expect(h).toBeGreaterThanOrEqual(10);
      expect(h).toBeLessThanOrEqual(20);
    }
  });

  it("never schedules in the past when created mid-day", () => {
    const now = new Date("2026-11-14T20:00:00Z"); // 15:00 EST
    const at = pickMomentTime(now, tz, 600, 1260, () => 0);
    expect(at.getTime()).toBeGreaterThanOrEqual(now.getTime() + 15 * 60_000);
  });

  it("pins to the window end when the window is already over", () => {
    const now = new Date("2026-11-15T03:30:00Z"); // 22:30 EST
    const at = pickMomentTime(now, tz, 600, 1260, () => 0.5);
    expect(at.toISOString()).toBe("2026-11-15T02:00:00.000Z"); // 21:00 EST
  });
});

describe("momentPhase", () => {
  const at = new Date("2026-11-14T20:00:00Z");
  it("is upcoming, then live for a while, then passed", () => {
    expect(momentPhase(new Date("2026-11-14T19:00:00Z"), at)).toBe("upcoming");
    expect(momentPhase(at, at)).toBe("live");
    expect(momentPhase(new Date(at.getTime() + LIVE_MINUTES * 60_000), at)).toBe("live");
    expect(momentPhase(new Date(at.getTime() + (LIVE_MINUTES + 1) * 60_000), at)).toBe("passed");
  });
});
