import { describe, expect, it } from "vitest";
import { buildFilingPrompt, cleanFilingResult, confidentAssignments } from "./filing";

const entries = [
  { id: "e1", body: "Bench 225 for 3", has_photo: false },
  { id: "e2", body: null, has_photo: true },
  { id: "e3", body: "Ramen at that place on 9th", has_photo: false },
  { id: "e4", body: "Pho with the roommates", has_photo: false },
  { id: "e5", body: "Tacos after practice", has_photo: false },
];
const collections = [
  { slug: "lifts", name: "Lifts", description: "PRs" },
  { slug: "people", name: "People", description: null },
];

describe("buildFilingPrompt", () => {
  it("lists collections by slug and entries by id", () => {
    const p = buildFilingPrompt(entries, collections);
    expect(p).toContain("- lifts: Lifts — PRs");
    expect(p).toContain("- people: People");
    expect(p).toContain('id e1: "Bench 225 for 3"');
    expect(p).toContain("id e2: (no text) [has a photo]");
  });

  it("copes with no collections", () => {
    expect(buildFilingPrompt(entries, [])).toContain("(none yet)");
  });
});

describe("cleanFilingResult", () => {
  it("keeps valid assignments, nulls unknown slugs, clamps confidence, dedupes", () => {
    const r = cleanFilingResult(
      {
        assignments: [
          { entry_id: "e1", collection_slug: "lifts", confidence: 0.95 },
          { entry_id: "e1", collection_slug: "people", confidence: 0.9 },
          { entry_id: "e2", collection_slug: "nope", confidence: 1.7 },
          { entry_id: "zzz", collection_slug: "lifts", confidence: 1 },
        ],
        proposals: [],
      },
      entries,
      collections,
    );
    expect(r.assignments).toEqual([
      { entry_id: "e1", collection_slug: "lifts", confidence: 0.95 },
      { entry_id: "e2", collection_slug: null, confidence: 1 },
    ]);
  });

  it("keeps one proposal with enough real entries, drops the rest", () => {
    const r = cleanFilingResult(
      {
        assignments: [],
        proposals: [
          { name: "places I ate", hint: "worth going back to", entry_ids: ["e3", "e4", "e5", "ghost", "e3"] },
          { name: "second", hint: "", entry_ids: ["e3", "e4", "e5"] },
          { name: "too small", hint: "", entry_ids: ["e3"] },
        ],
      },
      entries,
      collections,
    );
    expect(r.proposals).toHaveLength(1);
    expect(r.proposals[0]).toEqual({ name: "places I ate", hint: "worth going back to", entry_ids: ["e3", "e4", "e5"] });
  });

  it("survives garbage", () => {
    expect(cleanFilingResult(null, entries, collections)).toEqual({ assignments: [], proposals: [] });
    expect(cleanFilingResult({ assignments: "x", proposals: 3 }, entries, collections)).toEqual({ assignments: [], proposals: [] });
  });
});

describe("confidentAssignments", () => {
  it("applies the threshold and skips nulls", () => {
    const out = confidentAssignments({
      assignments: [
        { entry_id: "e1", collection_slug: "lifts", confidence: 0.6 },
        { entry_id: "e2", collection_slug: "lifts", confidence: 0.59 },
        { entry_id: "e3", collection_slug: null, confidence: 1 },
      ],
      proposals: [],
    });
    expect(out.map((a) => a.entry_id)).toEqual(["e1"]);
  });
});
