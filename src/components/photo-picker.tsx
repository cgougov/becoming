"use client";

import { useState, useTransition } from "react";
import { compressImage } from "@/lib/photos/compress";
import { MAX_PHOTO_BYTES, photoObjectPath } from "@/lib/photos/path";
import { createClient } from "@/lib/supabase/client";

/**
 * "add a photo" for anything on Yours (a direction, a person, a collection cover).
 * Uploads straight to the private photos bucket, then hands the path to a server action.
 */
export function PhotoPicker({
  userId,
  onPath,
  label = "add a photo",
  className = "",
}: {
  userId: string;
  onPath: (path: string) => Promise<void>;
  label?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <label className={`cursor-pointer ${pending ? "opacity-50" : ""} ${className}`}>
      {pending ? "uploading…" : label}
      {error && <span className="ml-2 text-red-400">{error}</span>}
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={pending}
        onChange={(e) => {
          const picked = e.target.files?.[0];
          e.target.value = "";
          if (!picked) return;
          setError(null);
          start(async () => {
            const file = await compressImage(picked);
            if (file.size > MAX_PHOTO_BYTES) return setError("too large");
            const path = photoObjectPath(userId, file.type, crypto.randomUUID());
            if (!path) return setError("unsupported image");
            const { error: up } = await createClient().storage.from("photos").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
            if (up) return setError(up.message);
            await onPath(path);
          });
        }}
      />
    </label>
  );
}
