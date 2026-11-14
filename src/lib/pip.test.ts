import { describe, expect, it } from "vitest";
import { FACES, FAMILIES, MOOD_COLORS, faceFor, familyForDay, restingMood } from "./pip";

describe("Pip faces", () => {
  it("every family has every mood, and soft is always Bean's soft face", () => {
    for (const f of FAMILIES) {
      for (const m of ["calm", "happy", "sleepy", "soft"] as const) expect(FACES[f][m].length).toBeGreaterThan(0);
      expect(FACES[f].soft).toBe(FACES.bean.soft);
    }
  });

  it("Bean's calm face has a mouth now", () => {
    expect(FACES.bean.calm.length).toBe(3);
  });

  it("rotates by day, stable within a day", () => {
    expect(familyForDay("2026-11-14")).toBe(familyForDay("2026-11-14"));
    const seen = new Set(Array.from({ length: 30 }, (_, i) => familyForDay(`2026-11-${String(i + 1).padStart(2, "0")}`)));
    expect(seen.size).toBeGreaterThan(2);
    expect(faceFor("happy", "2026-11-14")).toBe(FACES[familyForDay("2026-11-14")].happy);
  });

  it("has a color per mood", () => {
    expect(Object.keys(MOOD_COLORS).sort()).toEqual(["calm", "happy", "sleepy", "soft"]);
  });
});

describe("restingMood", () => {
  it("dozes after midnight, lights up when you come back, otherwise calm", () => {
    expect(restingMood(1, false)).toBe("sleepy");
    expect(restingMood(1, true)).toBe("sleepy");
    expect(restingMood(14, true)).toBe("happy");
    expect(restingMood(14, false)).toBe("calm");
  });
});
