"use client";

import { useState, useTransition } from "react";
import { PHOTO_ACCEPT } from "@/lib/photos/path";
import { uploadPhoto } from "@/lib/photos/upload";

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
      {error && <span className="mt-1 block text-[12px] font-semibold text-red-300">{error}</span>}
      <input
        type="file"
        accept={PHOTO_ACCEPT}
        className="sr-only"
        disabled={pending}
        onChange={(e) => {
          const picked = e.target.files?.[0];
          e.target.value = "";
          if (!picked) return;
          setError(null);
          start(async () => {
            const r = await uploadPhoto(userId, picked);
            if ("error" in r) return setError(r.error);
            await onPath(r.path);
          });
        }}
      />
    </label>
  );
}
