import { describe, expect, it } from "vitest";
import { ownerFromPhotoPath, photoObjectPath } from "./path";

describe("photoObjectPath", () => {
  it("puts the owner id first so storage RLS can scope it", () => {
    const p = photoObjectPath("user-1", "image/jpeg", "abc", new Date("2026-11-11T12:00:00Z"));
    expect(p).toBe("user-1/2026-11/abc.jpg");
    expect(ownerFromPhotoPath(p!)).toBe("user-1");
  });

  it("rejects unsupported types", () => {
    expect(photoObjectPath("u", "image/gif", "x")).toBeNull();
    expect(photoObjectPath("u", "application/pdf", "x")).toBeNull();
  });
});
