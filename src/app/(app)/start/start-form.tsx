"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { MAX_COLLECTION_NAME, SUGGESTED_COLLECTIONS, normalizeCollectionName } from "@/lib/collections";
import { completeSetup } from "./actions";

export function StartForm() {
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  function addCustom() {
    const name = normalizeCollectionName(draft);
    if (!name || custom.includes(name)) return;
    setCustom([...custom, name]);
    setDraft("");
  }

  const total = chosen.size + custom.length;

  return (
    <form action={completeSetup} className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested collections">
        {SUGGESTED_COLLECTIONS.map((c) => {
          const on = chosen.has(c.slug);
          return (
            <label
              key={c.slug}
              className={`cursor-pointer select-none rounded-full border px-3 py-1.5 text-sm transition-colors ${
                on ? "border-foreground bg-foreground text-background" : "border-foreground/15 bg-surface hover:border-foreground/40"
              }`}
              title={c.hint}
            >
              <input
                type="checkbox"
                name="suggested"
                value={c.slug}
                checked={on}
                onChange={(e) => {
                  const next = new Set(chosen);
                  if (e.target.checked) next.add(c.slug);
                  else next.delete(c.slug);
                  setChosen(next);
                }}
                className="sr-only"
              />
              {c.name}
            </label>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm opacity-70">Or in your own words:</p>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            maxLength={MAX_COLLECTION_NAME}
            placeholder="e.g. soccer games, café finds, letters to write"
            className="h-11 flex-1 rounded-full border-[1.5px] border-dashed border-foreground/20 bg-transparent px-4 text-[15px] outline-none focus:border-foreground/50"
          />
          <button type="button" onClick={addCustom} className="h-11 rounded-full bg-foreground px-4 text-sm font-semibold text-background">
            Add
          </button>
        </div>
        {custom.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {custom.map((name) => (
              <li key={name} className="flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-sm text-background">
                <input type="hidden" name="custom" value={name} />
                {name}
                <button
                  type="button"
                  onClick={() => setCustom(custom.filter((n) => n !== name))}
                  aria-label={`Remove ${name}`}
                  className="ml-1 opacity-70"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Submit total={total} />
    </form>
  );
}

function Submit({ total }: { total: number }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-col gap-2">
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-accent font-bold text-foreground disabled:opacity-50"
      >
        {pending ? "Setting up…" : total === 0 ? "Start with nothing, I'll add as I go" : `Start with ${total}`}
      </button>
      <p className="text-center text-xs opacity-50">You can rename, add, or drop any of these later. Nothing here is permanent.</p>
    </div>
  );
}
