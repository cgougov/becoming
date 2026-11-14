import { describe, expect, it } from "vitest";
import { SUGGESTED_COLLECTIONS } from "./collections";
import { DEFAULT_COLLECTIONS, MAX_DIRECTION, normalizeDirection, sparkToDirection } from "./onboarding";

describe("onboarding", () => {
  it("keeps one line in your words", () => {
    expect(normalizeDirection("  someone   calmer ")).toBe("someone calmer");
    expect(normalizeDirection("")).toBeNull();
    expect(normalizeDirection("x".repeat(MAX_DIRECTION + 1))).toBeNull();
    expect(normalizeDirection(3)).toBeNull();
  });
  it("turns a spark into a sentence", () => {
    expect(sparkToDirection("stronger")).toBe("someone stronger");
  });
  it("defaults are real suggestions, Thoughts first", () => {
    const slugs = SUGGESTED_COLLECTIONS.map((c) => c.slug);
    for (const d of DEFAULT_COLLECTIONS) expect(slugs).toContain(d);
    expect(DEFAULT_COLLECTIONS[0]).toBe("thoughts");
  });
});
