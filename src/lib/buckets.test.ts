import { describe, expect, it } from "vitest";
import { STARTER_BUCKETS, getBucket } from "./buckets";

describe("starter buckets", () => {
  it("has exactly the three v1 buckets in order", () => {
    expect(STARTER_BUCKETS.map((b) => b.slug)).toEqual(["goals", "taste", "people"]);
  });

  it("has unique slugs and non-empty copy", () => {
    const slugs = new Set(STARTER_BUCKETS.map((b) => b.slug));
    expect(slugs.size).toBe(STARTER_BUCKETS.length);
    for (const b of STARTER_BUCKETS) {
      expect(b.name.length).toBeGreaterThan(0);
      expect(b.description.length).toBeGreaterThan(0);
      expect(b.examples.length).toBeGreaterThan(0);
    }
  });

  it("looks up buckets by slug", () => {
    expect(getBucket("taste")?.name).toBe("Taste");
    expect(getBucket("nope")).toBeUndefined();
  });
});
