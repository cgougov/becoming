"use client";

import { useRef, useState, useTransition } from "react";
import { compressImage } from "@/lib/photos/compress";
import { MAX_PHOTO_BYTES, photoObjectPath } from "@/lib/photos/path";
import { createClient } from "@/lib/supabase/client";
import { createEntry } from "./actions";

export function CaptureForm({ userId }: { userId: string }) {
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  function pickPhoto(file: File | null) {
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function reset() {
    setBody("");
    pickPhoto(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function submit() {
    if (!body.trim() && !photo) return;
    setError(null);
    startTransition(async () => {
      let photoPath: string | null = null;
      if (photo) {
        const file = await compressImage(photo);
        if (file.size > MAX_PHOTO_BYTES) return setError("That photo is too large (5 MB max).");
        photoPath = photoObjectPath(userId, file.type, crypto.randomUUID());
        if (!photoPath) return setError("Unsupported image type.");
        const { error: upErr } = await createClient().storage.from("photos").upload(photoPath, file, {
          contentType: file.type,
          cacheControl: "31536000",
        });
        if (upErr) return setError(upErr.message);
      }
      const result = await createEntry({ body, photoPath });
      if (!result.ok) return setError(result.message);
      reset();
    });
  }

  const canSave = (body.trim().length > 0 || photo !== null) && !pending;

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-current/10 bg-current/[.03] p-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      aria-label="Capture"
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        placeholder="Drop it in…"
        rows={2}
        enterKeyHint="done"
        className="w-full resize-none bg-transparent px-1 py-1 text-base outline-none placeholder:opacity-40"
      />

      {preview && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="max-h-56 w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => pickPhoto(null)}
            className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
            aria-label="Remove photo"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <label className="cursor-pointer rounded-full px-3 py-1.5 text-sm opacity-70 hover:opacity-100">
          📷 Photo
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          type="submit"
          disabled={!canSave}
          className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
