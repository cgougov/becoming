"use client";

import { useActionState, useState, useTransition } from "react";
import { MAX_INTENTION } from "@/lib/intention";
import { clearIntention, setIntention, toggleIntentionDone, type IntentionState } from "./actions";

export interface Intention {
  id: string;
  text: string;
  done_at: string | null;
}

/**
 * One line for today. Mornings: an input. Once set: pinned with a check, all day.
 * Deliberately small: it's direction, not an agenda.
 */
export function IntentionLine({ intention }: { intention: Intention | null }) {
  const [state, action, pending] = useActionState<IntentionState, FormData>(setIntention, { status: "idle" });
  const [busy, start] = useTransition();
  const [open, setOpen] = useState(false);

  if (intention) {
    const done = !!intention.done_at;
    return (
      <div className="flex items-center gap-3 rounded-full bg-chip py-2 pl-2 pr-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => start(() => toggleIntentionDone(intention.id, !done))}
          aria-pressed={done}
          aria-label={done ? "Mark not done" : "Mark done"}
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-full transition-colors ${done ? "bg-accent" : "bg-surface"}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className={`min-w-0 flex-1 truncate text-[15px] font-medium ${done ? "text-muted line-through" : ""}`}>{intention.text}</span>
        <button
          type="button"
          disabled={busy}
          onClick={() => start(() => clearIntention(intention.id))}
          aria-label="Clear today's intention"
          className="text-xs font-semibold text-muted"
        >
          ✕
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-full bg-chip px-3.5 py-2 text-[13px] font-semibold text-muted"
      >
        + one thing for today
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2">
      <label htmlFor="intention" className="sr-only">
        One thing for today
      </label>
      <input
        id="intention"
        name="text"
        maxLength={MAX_INTENTION}
        placeholder="One thing for today?"
        autoComplete="off"
        autoFocus
        className="h-10 min-w-0 flex-1 rounded-full bg-chip px-4 text-[15px] font-medium outline-none placeholder:text-muted focus:ring-2 focus:ring-accent/60"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-full bg-surface px-4 text-sm font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.06)] disabled:opacity-40"
      >
        Set
      </button>
      {state.status === "error" && (
        <span className="text-xs text-red-600" role="alert">
          {state.message}
        </span>
      )}
    </form>
  );
}
