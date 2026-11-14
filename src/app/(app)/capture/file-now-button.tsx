"use client";

import { useState, useTransition } from "react";
import { fileNow } from "./actions";

/** Shows next to "Today" when something is unfiled. The nightly job does this on its own. */
export function FileNowButton() {
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  return (
    <span className="flex items-center gap-2">
      {note && <span className="text-xs font-medium text-muted">{note}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await fileNow();
            setNote(
              !r.ok ? r.message : r.filed === 0 ? "Nothing it was sure about." : r.proposed ? `Filed ${r.filed}, started “${r.proposed}”.` : `Filed ${r.filed}.`,
            );
            setTimeout(() => setNote(null), 4000);
          })
        }
        className="text-[13px] font-semibold text-accent disabled:opacity-40"
      >
        {pending ? "Filing…" : "File now"}
      </button>
    </span>
  );
}
