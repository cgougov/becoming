/**
 * Where a photo lives in the private "photos" bucket. The first folder segment
 * must be the owner's id: storage RLS policies key off it.
 */
export const PHOTO_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * What to tell the file picker. Leaving HEIC out makes iPhone hand us a JPEG it converted
 * itself, which every browser can shrink and upload.
 */
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

/** A file's real type: some pickers leave `type` empty, so fall back to the extension. */
export function photoMime(file: { type: string; name: string }): string {
  if (file.type) return file.type === "image/heif" ? "image/heic" : file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic", heif: "image/heic" } as Record<string, string>)[ext] ?? "";
}

/** Plain-words reason a photo can't go up, or null if it can. */
export function photoProblem(file: { type: string; name: string; size: number }): string | null {
  if (!PHOTO_MIME_TO_EXT[photoMime(file)]) return "that file type won't work. try a JPEG or a screenshot.";
  if (file.size > MAX_PHOTO_BYTES) return "that photo is too big for me. try a smaller one.";
  return null;
}

export function photoObjectPath(ownerId: string, mime: string, id: string, now: Date = new Date()): string | null {
  const ext = PHOTO_MIME_TO_EXT[mime];
  if (!ext) return null;
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${ownerId}/${yyyy}-${mm}/${id}.${ext}`;
}

export function ownerFromPhotoPath(path: string): string | null {
  const [owner] = path.split("/");
  return owner || null;
}
