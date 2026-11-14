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

describe("photoMime / photoProblem", () => {
  it("reads the type, falling back to the extension", async () => {
    const { photoMime } = await import("./path");
    expect(photoMime({ type: "image/png", name: "a.png" })).toBe("image/png");
    expect(photoMime({ type: "", name: "IMG_1.HEIC" })).toBe("image/heic");
    expect(photoMime({ type: "image/heif", name: "x" })).toBe("image/heic");
    expect(photoMime({ type: "", name: "notes.txt" })).toBe("");
  });
  it("says what's wrong in plain words", async () => {
    const { photoProblem, MAX_PHOTO_BYTES } = await import("./path");
    expect(photoProblem({ type: "image/jpeg", name: "a.jpg", size: 1000 })).toBeNull();
    expect(photoProblem({ type: "image/gif", name: "a.gif", size: 1000 })).toMatch(/type/);
    expect(photoProblem({ type: "image/jpeg", name: "a.jpg", size: MAX_PHOTO_BYTES + 1 })).toMatch(/too big/);
  });
});
