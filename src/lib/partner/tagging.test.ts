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
    expect(cleanTaggingResult(null, cols, [])).toEqual({ collections: [], people: [], tone: "neutral", directions: [] });
    expect(cleanTaggingResult({ collections: "x", people: 3 }, cols, [])).toEqual({ collections: [], people: [], tone: "neutral", directions: [] });
  });
});

describe("displayPersonName", () => {
  it("capitalizes the first letter only", () => {
    expect(displayPersonName("mom")).toBe("Mom");
    expect(displayPersonName("my roommate")).toBe("My roommate");
    expect(displayPersonName("McKenna")).toBe("McKenna");
  });
});

describe("catch-all", () => {
  it("files into Thoughts when nothing else fits, if you have it", () => {
    const cols = [
      { slug: "thoughts", name: "Thoughts", description: null },
      { slug: "lifts", name: "Lifts", description: null },
    ];
    expect(cleanTaggingResult({ collections: [], people: [], tone: "neutral" }, cols, []).collections).toEqual(["thoughts"]);
    expect(cleanTaggingResult({ collections: ["lifts"], people: [], tone: "neutral" }, cols, []).collections).toEqual(["lifts"]);
    expect(cleanTaggingResult({ collections: [], people: [], tone: "neutral" }, cols.slice(1), []).collections).toEqual([]);
  });
});

describe("direction links", () => {
  const dirs = [
    { key: "g1", text: "get stronger", horizon: "month" },
    { key: "g2", text: "call home more", horizon: "week" },
  ];
  it("lists goals in the prompt", () => {
    const p = buildTaggingPrompt("ran 3 miles", [], [], dirs);
    expect(p).toContain("g1: get stronger (this month)");
    expect(p).toContain("directions:");
  });
  it("keeps only known keys, at most two, deduped", () => {
    const r = cleanTaggingResult({ collections: [], people: [], tone: "good", directions: ["g1", "g1", "g9", "g2"] }, [], [], dirs);
    expect(r.directions).toEqual(["g1", "g2"]);
    expect(cleanTaggingResult({ collections: [], people: [], tone: "good" }, [], [], dirs).directions).toEqual([]);
  });
});
