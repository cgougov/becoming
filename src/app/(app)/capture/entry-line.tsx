"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { deleteEntry, updateEntryBody } from "./actions";

/**
 * One kept thing, as a line on today's page. Tap the text to edit in place;
 * blur or ⌘↩ saves; Escape cancels. Emptying a text-only line removes it.
 */
export function EntryLine({
  id,
  body,
  photoUrl,
  stamp,
  dot,
  status,
  editable = true,
}: {
  id: string;
  body: string | null;
  photoUrl?: string;
  stamp: string;
  dot: string;
  status: string;
  /** Days close: only today is editable; older things can be annotated later. */
  editable?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body ?? "");
  const [pending, start] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      const el = ref.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [editing]);

  function save() {
    setEditing(false);
    if (draft.trim() === (body ?? "").trim()) return;
    start(() => void updateEntryBody(id, draft));
  }

  function cancel() {
    setDraft(body ?? "");
    setEditing(false);
  }

  return (
    <li className={`group flex flex-col gap-2.5 py-4 ${pending ? "opacity-60" : ""}`}>
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="-mx-6 max-h-[70vh] w-[calc(100%+3rem)] max-w-none object-cover" loading="lazy" />
      )}
      {!editable ? (
        <p className={`whitespace-pre-wrap text-[17px] font-medium leading-[1.4] ${body ? "" : "text-muted"}`}>{body ?? ""}</p>
      ) : editing ? (
        <textarea
          ref={ref}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancel();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
          }}
          rows={1}
          aria-label="Edit"
          className="w-full resize-none bg-transparent text-[17px] font-medium leading-[1.4] outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`w-full whitespace-pre-wrap text-left text-[17px] font-medium leading-[1.4] ${body ? "" : "text-muted"}`}
        >
          {body ?? (photoUrl ? "Add a caption…" : "")}
        </button>
      )}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <span className="h-[7px] w-[7px] rounded-full" style={{ background: dot }} />
        <span>{status}</span>
        <span className="mx-1 opacity-50">·</span>
        <span>{stamp}</span>
        {editable && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Remove this?")) start(() => void deleteEntry(id));
            }}
            className="ml-auto opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
            aria-label="Remove"
          >
            Remove
          </button>
        )}
      </div>
    </li>
  );
}
