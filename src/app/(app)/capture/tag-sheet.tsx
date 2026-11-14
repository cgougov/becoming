"use client";

import { useState, useTransition } from "react";
import { dotColor } from "@/lib/collections";
import type { Tag, TagOptions } from "@/lib/entries/tags";
import { setEntryTags } from "./actions";

/** "Where does this go?" Pick collections and people, add new ones in your words, or none. */
export function TagSheet({ entryId, tags, options, onClose }: { entryId: string; tags: Tag[]; options: TagOptions; onClose: () => void }) {
  const [cols, setCols] = useState<Set<string>>(new Set(tags.filter((t) => t.kind === "collection").map((t) => t.id)));
  const [people, setPeople] = useState<Set<string>>(new Set(tags.filter((t) => t.kind === "person").map((t) => t.id)));
  const [newCols, setNewCols] = useState<string[]>([]);
  const [newPeople, setNewPeople] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [draftKind, setDraftKind] = useState<"collection" | "person">("collection");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(set: Set<string>, id: string, update: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update(next);
  }

  function addDraft() {
    const name = draft.trim();
    if (!name) return;
    if (draftKind === "collection") setNewCols((l) => (l.includes(name) ? l : [...l, name]));
    else setNewPeople((l) => (l.includes(name) ? l : [...l, name]));
    setDraft("");
  }

  function save(clear = false) {
    setError(null);
    start(async () => {
      const r = await setEntryTags(
        entryId,
        clear
          ? { collectionIds: [], newCollections: [], personIds: [], newPeople: [] }
          : { collectionIds: [...cols], newCollections: newCols, personIds: [...people], newPeople },
      );
      if (!r.ok) return setError(r.message);
      onClose();
    });
  }

  const chip = (on: boolean) =>
    `flex h-10 items-center gap-2 rounded-full px-3.5 text-[14px] font-semibold transition-colors ${on ? "bg-foreground text-background" : "bg-chip"}`;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Tags">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="anim-rise relative mx-auto flex max-h-[80vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-[28px] bg-surface px-6 pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-6">
        <div>
          <h2 className="text-[16px] font-bold">where does this go?</h2>
          <p className="text-[13px] text-muted">change it, add one, or take it off.</p>
        </div>

        {(options.people.length > 0 || newPeople.length > 0) && (
          <section className="flex flex-col gap-2">
            <h3 className="text-[12px] font-bold text-muted">people</h3>
            <div className="flex flex-wrap gap-2">
              {options.people.map((p) => (
                <button key={p.id} type="button" aria-pressed={people.has(p.id)} onClick={() => toggle(people, p.id, setPeople)} className={chip(people.has(p.id))}>
                  <span className="h-2 w-2 rounded-full bg-[#5b8cff]" />
                  {p.name}
                </button>
              ))}
              {newPeople.map((n) => (
                <button key={n} type="button" onClick={() => setNewPeople((l) => l.filter((x) => x !== n))} className={chip(true)}>
                  <span className="h-2 w-2 rounded-full bg-[#5b8cff]" />
                  {n} ✕
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h3 className="text-[12px] font-bold text-muted">collections</h3>
          <div className="flex flex-wrap gap-2">
            {options.collections.map((c) => (
              <button key={c.id} type="button" aria-pressed={cols.has(c.id)} onClick={() => toggle(cols, c.id, setCols)} className={chip(cols.has(c.id))}>
                <span className="h-2 w-2 rounded-full" style={{ background: dotColor(c.slug) }} />
                {c.name}
              </button>
            ))}
            {newCols.map((n) => (
              <button key={n} type="button" onClick={() => setNewCols((l) => l.filter((x) => x !== n))} className={chip(true)}>
                {n} ✕
              </button>
            ))}
            {options.collections.length === 0 && newCols.length === 0 && <p className="text-[13px] text-muted">none yet. add one below.</p>}
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <div className="flex gap-1 self-start rounded-full bg-chip p-1 text-[12px] font-bold">
            {(["collection", "person"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={draftKind === k}
                onClick={() => setDraftKind(k)}
                className={`h-8 rounded-full px-3 ${draftKind === k ? "bg-foreground text-background" : "text-muted"}`}
              >
                {k === "collection" ? "new collection" : "new person"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <label htmlFor="tag-new" className="sr-only">
              {draftKind === "collection" ? "New collection" : "New person"}
            </label>
            <input
              id="tag-new"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addDraft();
                }
              }}
              maxLength={40}
              placeholder={draftKind === "collection" ? "in your words…" : "their name…"}
              className="h-11 min-w-0 flex-1 rounded-full bg-chip px-4 text-[15px] outline-none placeholder:text-muted"
            />
            <button type="button" onClick={addDraft} className="h-11 rounded-full bg-chip px-4 text-sm font-semibold">
              add
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" disabled={pending} onClick={() => save(true)} className="h-12 flex-1 rounded-full border-[1.5px] border-foreground/15 text-[14px] font-semibold disabled:opacity-40">
            no tag
          </button>
          <button type="button" disabled={pending} onClick={() => save()} className="h-12 flex-[2] rounded-full bg-foreground text-[15px] font-bold text-background disabled:opacity-40">
            {pending ? "saving…" : "done"}
          </button>
        </div>
      </div>
    </div>
  );
}
