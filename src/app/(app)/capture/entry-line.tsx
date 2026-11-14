"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { dotColor } from "@/lib/collections";
import type { Tag, TagOptions } from "@/lib/entries/tags";
import { deleteEntry, updateEntryBody } from "./actions";
import { TagSheet } from "./tag-sheet";

/**
 * One kept thing, as a line on the day's page. Today: tap the text to edit in place.
 * Earlier days: read-only text (annotations come next). Tags are always yours to change.
 */
export function EntryLine({
  id,
  body,
  photoUrl,
  stamp,
  tags,
  reading,
  options,
  editable = true,
}: {
  id: string;
  body: string | null;
  photoUrl?: string;
  stamp: string;
  tags: Tag[];
  reading: boolean;
  options: TagOptions;
  editable?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [sheet, setSheet] = useState(false);
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

  return (
    <li className={`group flex flex-col gap-2.5 py-4 ${pending ? "opacity-60" : ""}`}>
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="-mx-6 max-h-[70vh] w-[calc(100%+3rem)] max-w-none object-cover" loading="lazy" />
      )}
      {!editable ? (
        body && <p className="whitespace-pre-wrap text-[17px] font-medium leading-[1.4]">{body}</p>
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
            if (e.key === "Escape") {
              setDraft(body ?? "");
              setEditing(false);
            }
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
          {body ?? (photoUrl ? "add a caption…" : "")}
        </button>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {reading ? (
          <span className="anim-shimmer flex h-7 items-center gap-1.5 rounded-full bg-chip px-2.5 text-[12px] font-bold text-muted">
            <span className="h-[7px] w-[7px] rounded-full bg-muted/60" />
            reading…
          </span>
        ) : tags.length > 0 ? (
          tags.map((t) => (
            <button
              key={`${t.kind}-${t.id}`}
              type="button"
              onClick={() => setSheet(true)}
              className={`flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-bold ${
                t.kind === "person" ? "bg-[#5b8cff]/15 text-[#a9c1ff]" : "bg-chip text-foreground/80"
              }`}
            >
              <span className="h-[7px] w-[7px] rounded-full" style={{ background: t.kind === "person" ? "#5b8cff" : dotColor(t.slug) }} />
              {t.label}
            </button>
          ))
        ) : (
          <button type="button" onClick={() => setSheet(true)} className="flex h-7 items-center rounded-full px-2.5 text-[12px] font-bold text-muted/70 ring-1 ring-foreground/10">
            + tag
          </button>
        )}
        <span className="ml-auto flex items-center gap-3 text-xs font-semibold text-muted">
          {editable && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Remove this?")) start(() => void deleteEntry(id));
              }}
              className="opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
            >
              remove
            </button>
          )}
          <span>{stamp}</span>
        </span>
      </div>

      {sheet && <TagSheet entryId={id} tags={tags} options={options} onClose={() => setSheet(false)} />}
    </li>
  );
}
