import { describe, expect, it } from "vitest";
import { buildTaggingPrompt, cleanTaggingResult, displayPersonName } from "./tagging";

const cols = [
  { slug: "lifts", name: "Lifts", description: "PRs" },
  { slug: "places", name: "Places", description: null },
];

describe("buildTaggingPrompt", () => {
  it("includes the entry, slugs and known people", () => {
    const p = buildTaggingPrompt("Lunch with Sam", cols, ["Sam", "Mom"]);
    expect(p).toContain('"Lunch with Sam"');
    expect(p).toContain("- lifts: Lifts (PRs)");
    expect(p).toContain("Sam, Mom");
  });

  it("handles an empty scrapbook", () => {
    const p = buildTaggingPrompt("hi", [], []);
    expect(p).toContain("(none yet)");
  });
});

describe("cleanTaggingResult", () => {
  it("keeps known slugs only, capped and deduped", () => {
    const r = cleanTaggingResult({ collections: ["lifts", "nope", "lifts", "places", "x"], people: [], tone: "good" }, cols, []);
    expect(r.collections).toEqual(["lifts", "places"]);
    expect(r.tone).toBe("good");
  });

  it("trims names, dedupes case-insensitively, and reuses known spellings", () => {
    const r = cleanTaggingResult({ collections: [], people: ["  sam ", "SAM", "my roommate", "", "x".repeat(41)], tone: "neutral" }, cols, ["Sam"]);
    expect(r.people).toEqual(["Sam", "my roommate"]);
  });

  it("defaults tone and survives garbage", () => {
    expect(cleanTaggingResult({ collections: [], people: [], tone: "angry" }, cols, []).tone).toBe("neutral");
    expect(cleanTaggingResult(null, cols, [])).toEqual({ collections: [], people: [], tone: "neutral" });
    expect(cleanTaggingResult({ collections: "x", people: 3 }, cols, [])).toEqual({ collections: [], people: [], tone: "neutral" });
  });
});

describe("displayPersonName", () => {
  it("capitalizes the first letter only", () => {
    expect(displayPersonName("mom")).toBe("Mom");
    expect(displayPersonName("my roommate")).toBe("My roommate");
    expect(displayPersonName("McKenna")).toBe("McKenna");
  });
});
