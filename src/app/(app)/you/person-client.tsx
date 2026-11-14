"use client";

import { useState, useTransition } from "react";
import { normalizePhone, reachLinks } from "@/lib/people";
import { setPersonClose, setPersonNote, setPersonPhone } from "./actions";

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

/** Text / call / FaceTime in one tap, or a quiet field to add their number. */
export function ReachOut({ id, name, phone }: { id: string; name: string; phone: string | null }) {
  const [editing, setEditing] = useState(!phone);
  const [value, setValue] = useState(phone ?? "");
  const [saved, setSaved] = useState(phone);
  const [bad, setBad] = useState(false);
  const [pending, start] = useTransition();

  if (saved && !editing) {
    const links = reachLinks(saved);
    const pill = "flex min-h-11 flex-1 items-center justify-center rounded-full bg-chip text-[14px] font-semibold";
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <a href={links.text} className={pill}>text</a>
          <a href={links.call} className={pill}>call</a>
          <a href={links.facetime} className={pill}>facetime</a>
        </div>
        <button type="button" onClick={() => setEditing(true)} className="self-start text-[12px] font-semibold text-muted">
          change number
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await setPersonPhone(id, value);
          setBad(!r.ok);
          if (r.ok) {
            setSaved(normalizePhone(value));
            setEditing(false);
          }
        });
      }}
    >
      <label htmlFor="person-phone" className="sr-only">
        {name}&apos;s number
      </label>
      <input
        id="person-phone"
        type="tel"
        inputMode="tel"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setBad(false);
        }}
        placeholder={bad ? "that doesn't look like a number" : `${name}'s number, to text them in one tap`}
        className="min-h-11 flex-1 rounded-full bg-chip px-4 text-[14px] outline-none placeholder:text-muted"
      />
      <button type="submit" disabled={pending || !value.trim()} className="min-h-11 rounded-full bg-foreground px-4 text-[14px] font-bold text-background disabled:opacity-30">
        save
      </button>
    </form>
  );
}
