"use client";

import { createClient } from "@/lib/supabase/client";
import { compressImage } from "./compress";
import { PHOTO_MIME_TO_EXT, photoMime, photoObjectPath, photoProblem } from "./path";
import { reportPhotoError } from "./report";

/**
 * One way to put a photo up, used by Keep and every "add a photo". Shrinks it, checks it,
 * uploads it, and on failure says why in plain words (and logs the details so we can fix it).
 */
export async function uploadPhoto(userId: string, picked: File): Promise<{ path: string } | { error: string }> {
  const file = await compressImage(picked);
  const mime = photoMime(file);
  const problem = photoProblem(file);
  if (problem) {
    void reportPhotoError({ stage: "check", type: picked.type, name: picked.name.split(".").pop() ?? "", size: picked.size, after: file.size, message: problem });
    return { error: problem };
  }
  const path = photoObjectPath(userId, mime, crypto.randomUUID());
  if (!path || !PHOTO_MIME_TO_EXT[mime]) return { error: "that file type won't work. try a JPEG or a screenshot." };
  const { error } = await createClient().storage.from("photos").upload(path, file, { contentType: mime, cacheControl: "31536000" });
  if (error) {
    void reportPhotoError({ stage: "upload", type: picked.type, name: picked.name.split(".").pop() ?? "", size: picked.size, after: file.size, message: error.message });
    return { error: "that photo didn't make it. try again?" };
  }
  return { path };
}
