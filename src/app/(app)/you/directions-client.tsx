"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { PhotoPicker } from "@/components/photo-picker";
import { addDirection, archiveDirection, setDirectionPhoto, type DirectionState } from "./actions";

export function DirectionCard({
  id,
  userId,
  text,
  horizon,
  background,
  progress,
  latest,
  thumbs,
}: {
  id: string;
  userId: string;
  text: string;
  horizon: string;
  background: string;
  progress: string;
  latest: string | null;
  thumbs: string[];
}) {
  const [pending, start] = useTransition();
  return (
    <div className={`relative overflow-hidden rounded-card p-4 text-white ${pending ? "opacity-50" : ""}`} style={{ background }}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
      <div className="relative flex min-h-[88px] flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur">{horizon}</span>
          <button
            type="button"
            aria-label="Let this one go"
            onClick={() => {
              if (confirm("let this one go? it stays in your days.")) start(() => archiveDirection(id));
            }}
            className="text-[13px] font-semibold text-white/70"
          >
            ✕
          </button>
        </div>
        <Link href={`/you/goal/${id}`} className="flex flex-col gap-1.5">
          <p className="text-[18px] font-bold leading-snug">{text}</p>
          <div className="flex items-center gap-2">
            {thumbs.length > 0 && (
              <span className="flex -space-x-2">
                {thumbs.map((u) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={u} src={u} alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-black/30" />
                ))}
              </span>
            )}
            <span className="text-[13px] font-semibold text-white/85">{progress}</span>
          </div>
          {latest && <span className="line-clamp-1 text-[13px] italic text-white/75">“{latest}”</span>}
        </Link>
        <PhotoPicker userId={userId} onPath={setDirectionPhoto.bind(null, id)} label="add a photo" className="self-start text-[12px] font-semibold text-white/75" />
      </div>
    </div>
  );
}

export function NewDirectionForm({ empty }: { empty: boolean }) {
  const [state, action, pending] = useActionState<DirectionState, FormData>(addDirection, { status: "idle" });
  const [horizon, setHorizon] = useState<"week" | "month" | "year">("month");
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "ok") ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-2">
      <input type="hidden" name="horizon" value={horizon} />
      <label htmlFor="direction-text" className="sr-only">
        A direction, in your words
      </label>
      <input
        id="direction-text"
        name="text"
        maxLength={120}
        placeholder={empty ? "who do you want to become? e.g. stronger, more present…" : "+ another direction…"}
        className="h-11 rounded-full border-[1.5px] border-dashed border-foreground/20 bg-transparent px-4 text-[15px] outline-none placeholder:text-muted focus:border-foreground/50"
      />
      <div className="flex items-center gap-1.5">
        {(["week", "month", "year"] as const).map((h) => (
          <button
            key={h}
            type="button"
            aria-pressed={horizon === h}
            onClick={() => setHorizon(h)}
            className={`h-8 rounded-full px-3 text-[12px] font-bold ${horizon === h ? "bg-foreground text-background" : "bg-chip text-muted"}`}
          >
            this {h}
          </button>
        ))}
        <button type="submit" disabled={pending} className="ml-auto h-8 rounded-full bg-chip px-3.5 text-[12px] font-bold disabled:opacity-40">
          add
        </button>
      </div>
      {state.status === "error" && (
        <p className="text-xs text-red-400" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
