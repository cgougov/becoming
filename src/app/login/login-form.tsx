"use client";

import { useActionState } from "react";
import { sendCode, verifyCode, type LoginState } from "./actions";

const input = "h-12 rounded-full border-[1.5px] border-foreground/15 bg-surface px-4 text-base outline-none focus:border-foreground/50";
const primary = "h-12 rounded-full bg-foreground font-bold text-background disabled:opacity-50";

export function LoginForm({ next }: { next: string }) {
  const [sendState, send, sending] = useActionState<LoginState, FormData>(sendCode, { status: "idle" });
  const [verifyState, verify, verifying] = useActionState<LoginState, FormData>(verifyCode, { status: "idle" });

  const email =
    sendState.status === "sent" ? sendState.email : verifyState.status === "error" && verifyState.email ? verifyState.email : null;

  if (email) {
    return (
      <div className="flex flex-col gap-4">
        <div role="status">
          <p className="font-semibold">check your email</p>
          <p className="text-sm text-muted">a code is on its way to {email}. type it here.</p>
        </div>
        <form action={verify} className="flex flex-col gap-3">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <label htmlFor="code" className="sr-only">
            Sign-in code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 -]*"
            autoFocus
            required
            placeholder="123456"
            className={`${input} text-center text-[22px] font-semibold tracking-[0.3em]`}
          />
          {verifyState.status === "error" && (
            <p className="text-sm text-red-400" role="alert">
              {verifyState.message}
            </p>
          )}
          <button type="submit" disabled={verifying} className={primary}>
            {verifying ? "signing in…" : "sign in"}
          </button>
        </form>
        <form action={send} className="flex justify-center">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <button type="submit" disabled={sending} className="min-h-11 text-[13px] font-semibold text-muted">
            {sending ? "sending…" : "send a new code"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={send} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">email</span>
        <input name="email" type="email" inputMode="email" autoComplete="email" autoFocus required className={input} />
      </label>
      {sendState.status === "error" && (
        <p className="text-sm text-red-400" role="alert">
          {sendState.message}
        </p>
      )}
      <button type="submit" disabled={sending} className={primary}>
        {sending ? "sending…" : "send me a code"}
      </button>
    </form>
  );
}
