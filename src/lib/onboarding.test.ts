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

describe("becoming choices", () => {
  it("turns taps into plain goals", async () => {
    const { goalsFromChoices } = await import("./onboarding");
    expect(goalsFromChoices({ language: "Bulgarian", lift: "4 a week", faith: "read my Bible" }, "")).toEqual([
      { text: "practice Bulgarian most days", horizon: "week" },
      { text: "lift 4 a week", horizon: "week" },
      { text: "read my Bible daily", horizon: "week" },
    ]);
    expect(goalsFromChoices({ read: "a book a month" }, "  be kinder ")).toEqual([
      { text: "read a book a month", horizon: "month" },
      { text: "be kinder", horizon: "year" },
    ]);
    expect(goalsFromChoices({ scroll: undefined }, "")).toEqual([{ text: "scroll less, live more", horizon: "week" }]);
  });
});
