"use client";

import { useActionState, useEffect, useRef } from "react";
import { MAX_COLLECTION_NAME } from "@/lib/collections";
import { addCollection, type NewCollectionState } from "./actions";

export function NewCollectionForm() {
  const [state, action, pending] = useActionState<NewCollectionState, FormData>(addCollection, { status: "idle" });
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "ok") ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          name="name"
          maxLength={MAX_COLLECTION_NAME}
          placeholder="Keep track of something new…"
          className="flex-1 rounded-xl border border-current/20 bg-transparent px-3 py-2 text-base outline-none placeholder:opacity-40 focus:border-current/50"
        />
        <button type="submit" disabled={pending} className="rounded-xl border border-current/20 px-3 text-sm disabled:opacity-40">
          Add
        </button>
      </div>
      {state.status === "error" && (
        <p className="text-xs text-red-600" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
