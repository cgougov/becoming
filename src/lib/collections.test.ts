import { describe, expect, it } from "vitest";
import { SUGGESTED_COLLECTIONS, buildInitialCollections, normalizeCollectionName, slugify } from "./collections";

describe("suggested collections", () => {
  it("have unique slugs and copy", () => {
    expect(new Set(SUGGESTED_COLLECTIONS.map((c) => c.slug)).size).toBe(SUGGESTED_COLLECTIONS.length);
    for (const c of SUGGESTED_COLLECTIONS) {
      expect(c.name).not.toBe("");
      expect(c.hint).not.toBe("");
      expect(slugify(c.name)).toBe(c.slug);
    }
  });
});

describe("slugify", () => {
  it("makes url-safe slugs", () => {
    expect(slugify("Places I ate")).toBe("places-i-ate");
    expect(slugify("  Café & Bars!! ")).toBe("cafe-bars");
    expect(slugify("!!!")).toBeNull();
  });
});

describe("normalizeCollectionName", () => {
  it("trims, collapses spaces, and bounds length", () => {
    expect(normalizeCollectionName("  people   to  call ")).toBe("people to call");
    expect(normalizeCollectionName("   ")).toBeNull();
    expect(normalizeCollectionName("x".repeat(41))).toBeNull();
  });
});

describe("buildInitialCollections", () => {
  it("keeps order, dedupes, skips reserved and junk", () => {
    const rows = buildInitialCollections(["lifts", "nope", "lifts", "reading"], ["Lifts", "Unsorted", "", "Soccer games"]);
    expect(rows.map((r) => r.slug)).toEqual(["lifts", "reading", "soccer-games"]);
    expect(rows.map((r) => r.position)).toEqual([0, 1, 2]);
    expect(rows[0].origin).toBe("suggested");
    expect(rows[2].origin).toBe("user");
    expect(rows[2].description).toBeNull();
  });

  it("allows an empty start", () => {
    expect(buildInitialCollections([], [])).toEqual([]);
  });
});
