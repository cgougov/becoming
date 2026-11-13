import { describe, expect, it } from "vitest";
import { normalizeIntention, showIntentionPrompt } from "./intention";

describe("showIntentionPrompt", () => {
  it("shows in the morning window when nothing is set", () => {
    expect(showIntentionPrompt(5, false)).toBe(true);
    expect(showIntentionPrompt(10, false)).toBe(true);
    expect(showIntentionPrompt(11, false)).toBe(false);
    expect(showIntentionPrompt(23, false)).toBe(false);
    expect(showIntentionPrompt(2, false)).toBe(false);
  });

  it("stays pinned all day once set", () => {
    expect(showIntentionPrompt(15, true)).toBe(true);
    expect(showIntentionPrompt(1, true)).toBe(true);
  });
});

describe("normalizeIntention", () => {
  it("trims and bounds", () => {
    expect(normalizeIntention("  finish   the memo ")).toBe("finish the memo");
    expect(normalizeIntention("   ")).toBeNull();
    expect(normalizeIntention("x".repeat(121))).toBeNull();
  });
});
