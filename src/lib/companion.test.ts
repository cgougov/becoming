import { describe, expect, it } from "vitest";
import { arrivalMood, daysBetween } from "./companion";

describe("arrivalMood", () => {
  it("is fresh for a brand-new user, curious after a quiet stretch, idle otherwise", () => {
    expect(arrivalMood(null)).toBe("fresh");
    expect(arrivalMood(0)).toBe("idle");
    expect(arrivalMood(2)).toBe("idle");
    expect(arrivalMood(3)).toBe("curious");
    expect(arrivalMood(30)).toBe("curious");
  });
});

describe("daysBetween", () => {
  it("floors whole days", () => {
    expect(daysBetween(new Date("2026-11-13T10:00:00Z"), new Date("2026-11-10T23:00:00Z"))).toBe(2);
  });
});

describe("reactions", () => {
  const base = { hasPhoto: false, hasText: true, localHour: 14, keptTodayBefore: 2, mood: "idle" as const };

  it("always has something to say and never repeats the last one", async () => {
    const { pickReaction, reactionPool } = await import("./companion");
    const pool = reactionPool(base);
    expect(pool.length).toBeGreaterThan(5);
    for (const last of pool) expect(pickReaction(base, last, () => 0)).not.toBe(last);
  });

  it("leans into context: photos, late night, coming back", async () => {
    const { reactionPool } = await import("./companion");
    expect(reactionPool({ ...base, hasPhoto: true })).toContain("pretty");
    expect(reactionPool({ ...base, localHour: 1 })).toContain("night note ♡");
    expect(reactionPool({ ...base, mood: "curious" })).toContain("missed you ♡");
    expect(reactionPool({ ...base, keptTodayBefore: 0 })).toContain("first one today");
    expect(reactionPool(base)).not.toContain("missed you ♡");
  });

  it("is deterministic given a seed", async () => {
    const { pickReaction } = await import("./companion");
    expect(pickReaction(base, null, () => 0.5)).toBe(pickReaction(base, null, () => 0.5));
  });
});
