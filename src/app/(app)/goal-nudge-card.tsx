"use client";

import { useActionState, useEffect, useState } from "react";
import { addDirection, type DirectionState } from "./you/actions";

/** Pip's goal nudge: one line, an inline field, "not now" hides it for the day. */
export function GoalNudgeCard({ line, day }: { line: string; day: string }) {
  const [state, action, pending] = useActionState<DirectionState, FormData>(addDirection, { status: "idle" });
  const [hidden, setHidden] = useState(false);
  const key = `becoming:goal-nudge:${day}`;

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (localStorage.getItem(key) === "no") setHidden(true);
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, [key]);

  if (hidden) return null;
  if (state.status === "ok") return <p className="anim-rise rounded-card bg-chip p-3 text-[14px] font-semibold">lovely. it&apos;s on Yours now. I&apos;ll keep count.</p>;

  return (
    <form action={action} className="flex flex-col gap-2 rounded-card bg-chip p-3">
      <input type="hidden" name="horizon" value="week" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-semibold leading-snug">{line}</p>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(key, "no");
            } catch {}
            setHidden(true);
          }}
          className="flex-none text-[12px] font-semibold text-muted"
        >
          not now
        </button>
      </div>
      <div className="flex gap-2">
        <input
          name="text"
          maxLength={120}
          aria-label="A goal for this week"
          placeholder="run twice. call grandma."
          className="min-h-10 flex-1 rounded-full bg-background/60 px-4 text-[15px] outline-none placeholder:text-muted"
        />
        <button type="submit" disabled={pending} className="min-h-10 rounded-full bg-foreground px-4 text-[14px] font-bold text-background disabled:opacity-40">
          add
        </button>
      </div>
    </form>
  );
}
