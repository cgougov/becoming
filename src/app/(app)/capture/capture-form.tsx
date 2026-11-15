"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { KEEPING_EVENT, KEPT_EVENT } from "@/components/companion";
import { MicButton } from "@/components/mic-button";
import { PHOTO_ACCEPT } from "@/lib/photos/path";
import { uploadPhoto } from "@/lib/photos/upload";
import { createEntry, tagEntry } from "./actions";

function Icon({ d }: { d: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
      {d}
    </svg>
  );
}

const DRAFT_KEY = "becoming:draft";

function saveDraft(text: string) {
  try {
    if (text) localStorage.setItem(DRAFT_KEY, text);
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    // private mode or storage blocked: the draft just isn't remembered
  }
}

/**
 * Keep is one motion: type, hit return (or the arrow), done. Pip tags it after it's kept.
 * What you're typing is remembered on this device, so closing the app never loses it.
 */
export function CaptureForm({ userId, keptToday = 0, momentId = null }: { userId: string; keptToday?: number; momentId?: string | null }) {
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const d = localStorage.getItem(DRAFT_KEY);
        if (d) setBody((b) => b || d);
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  function pickPhoto(file: File | null) {
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }


  /**
   * No waiting: the box clears at once and Pip starts reading; the upload and save happen in
   * the background. If anything fails, what you wrote comes back with a plain error.
   */
  function submit() {
    if (!body.trim() && !photo) return;
    setError(null);
    const kept = { body, photo };
    const detail = { hasPhoto: !!photo, hasText: body.trim().length > 0, keptTodayBefore: keptToday, moment: !!momentId };
    // Clear without revoking the preview URL yet; the photo is still uploading.
    setBody("");
    saveDraft("");
    setPhoto(null);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
    window.dispatchEvent(new Event(KEEPING_EVENT));
    startTransition(async () => {
      const restore = (message: string) => {
        setBody(kept.body);
        saveDraft(kept.body);
        if (kept.photo) pickPhoto(kept.photo);
        setError(message);
      };
      let photoPath: string | null = null;
      if (kept.photo) {
        const r = await uploadPhoto(userId, kept.photo);
        if ("error" in r) return restore(r.error);
        photoPath = r.path;
      }
      const result = await createEntry({ body: kept.body, photoPath, momentId });
      if (!result.ok) return restore(result.message);
      // The partner reads it; Pip speaks once it knows how it reads (or after 4s regardless).
      const tone = result.id
        ? await Promise.race([
            tagEntry(result.id).then((r) => r.tone),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
          ])
        : null;
      window.dispatchEvent(new CustomEvent(KEPT_EVENT, { detail: { ...detail, tone } }));
    });
  }

  const canSave = body.trim().length > 0 || photo !== null;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      aria-label="Keep something"
    >
      <label htmlFor="capture" className="sr-only">
        What&apos;s on your mind
      </label>
      <textarea
        id="capture"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          saveDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          // Return keeps it. Shift+Return for a new line.
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={momentId ? "right now…" : "What's on your mind."}
        rows={3}
        enterKeyHint="send"
        className="w-full resize-none bg-transparent text-[28px] font-semibold leading-[1.2] tracking-[-0.025em] outline-none placeholder:text-foreground/30"
      />

      {preview && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="-mx-6 max-h-[60vh] w-[calc(100%+3rem)] max-w-none object-cover" />
          <button
            type="button"
            onClick={() => pickPhoto(null)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/70 text-sm text-background"
            aria-label="Remove photo"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm font-semibold text-red-300" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-chip" aria-label="Add a photo">
          <Icon
            d={
              <>
                <rect x="3" y="6" width="18" height="14" rx="4" />
                <circle cx="12" cy="13" r="3.5" />
                <path d="M9 6l1.2-2h3.6L15 6" />
              </>
            }
          />
          <input
            ref={fileInput}
            type="file"
            accept={PHOTO_ACCEPT}
            className="sr-only"
            onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
          />
        </label>
        <MicButton
          onText={(t) => {
            const next = body ? `${body} ${t}` : t;
            setBody(next);
            saveDraft(next);
          }}
        />
        {canSave && (
          <button
            type="submit"
            aria-label="Keep"
            className="anim-rise ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background"
          >
            <Icon d={<path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" />} />
          </button>
        )}
      </div>
    </form>
  );
}
