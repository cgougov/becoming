import { describe, expect, it } from "vitest";
import { isPublicPath, normalizeEmail, safeNextPath } from "./routes";

describe("isPublicPath", () => {
  it("allows login, auth callbacks and PWA assets", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/auth/confirm")).toBe(true);
    expect(isPublicPath("/auth/callback")).toBe(true);
    expect(isPublicPath("/manifest.webmanifest")).toBe(true);
    expect(isPublicPath("/icons/icon-192.png")).toBe(true);
  });

  it("protects everything else", () => {
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/today")).toBe(false);
    expect(isPublicPath("/loginx")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("defaults to home", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });

  it("keeps same-origin paths", () => {
    expect(safeNextPath("/today?x=1")).toBe("/today?x=1");
  });

  it("rejects off-site redirects", () => {
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("/\\evil.example")).toBe("/");
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Christian@Example.com ")).toBe("christian@example.com");
  });

  it("rejects obvious non-emails", () => {
    expect(normalizeEmail("")).toBeNull();
    expect(normalizeEmail("nope")).toBeNull();
    expect(normalizeEmail("a@b")).toBeNull();
  });
});
