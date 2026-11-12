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
          className="h-11 flex-1 rounded-full border-[1.5px] border-dashed border-foreground/20 bg-transparent px-4 text-[15px] outline-none placeholder:text-muted focus:border-foreground/50"
        />
        <button type="submit" disabled={pending} className="h-11 rounded-full bg-foreground px-4 text-sm font-semibold text-background disabled:opacity-40">
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
