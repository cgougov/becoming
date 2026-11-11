"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div className="rounded-2xl border border-current/10 bg-current/[.03] p-4" role="status">
        <p className="font-medium">Check your email</p>
        <p className="text-sm opacity-70">
          A sign-in link is on its way to {state.email}. Open it on this phone so the app signs in here.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="opacity-70">Email</span>
        <input
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          required
          className="rounded-xl border border-current/20 bg-transparent px-3 py-3 text-base outline-none focus:border-current/50"
        />
      </label>
      {state.status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-foreground px-4 py-3 font-medium text-background disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send me a sign-in link"}
      </button>
    </form>
  );
}
