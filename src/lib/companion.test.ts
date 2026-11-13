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
