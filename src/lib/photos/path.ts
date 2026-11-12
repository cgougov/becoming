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
