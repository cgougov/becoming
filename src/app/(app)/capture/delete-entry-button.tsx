"use client";

import { useTransition } from "react";
import { deleteEntry } from "./actions";

export function DeleteEntryButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Remove this?")) start(() => void deleteEntry(id));
      }}
      className="opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 disabled:opacity-40"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
