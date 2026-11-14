"use client";

import { useState, useTransition } from "react";
import { setPersonClose, setPersonNote } from "./actions";

/** Your close circle: the people you want to stay close to. Pip pays the most attention to them. */
export function CloseToggle({ id, close }: { id: string; close: boolean }) {
  const [on, setOn] = useState(close);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={pending}
      onClick={() => {
        setOn(!on);
        start(() => setPersonClose(id, !on));
      }}
      className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-colors ${on ? "bg-accent text-[#1a1418]" : "bg-chip"}`}
    >
      {on ? "♡ in your close circle" : "keep close"}
    </button>
  );
}

/** "to ask or remember": things for next time you see them. Saves when you tap away. */
export function PersonNote({ id, note }: { id: string; note: string }) {
  const [value, setValue] = useState(note);
  const [saved, setSaved] = useState(true);
  const [, start] = useTransition();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="person-note" className="text-[13px] font-bold text-muted">
        to ask or remember {saved ? "" : "· saving…"}
      </label>
      <textarea
        id="person-note"
        rows={3}
        value={value}
        placeholder="how did the interview go? their sister's name is…"
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        onBlur={() => start(async () => {
          await setPersonNote(id, value);
          setSaved(true);
        })}
        className="resize-none rounded-[20px] bg-chip px-4 py-3 text-[15px] leading-snug outline-none placeholder:text-muted"
      />
    </div>
  );
}
