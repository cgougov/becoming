"use client";

import { useEffect, useState, useTransition } from "react";
import { pushState, subscribe, unsubscribe, type PushState } from "@/lib/push-client";
import { removePushSubscription, savePushSubscription, type SubscriptionJSON } from "./actions";

const HOME_SCREEN_HINT = "add Becoming to your Home Screen first: Share, then Add to Home Screen.";

/**
 * Notifications on/off. "card" is Pip asking once on Today; "row" lives in Yours.
 * Three a day at most: 8:30 morning, the moment, 10pm wind-down.
 */
export function NotifySwitch({ variant = "row" }: { variant?: "row" | "card" }) {
  const [state, setState] = useState<PushState | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    let live = true;
    pushState().then((s) => {
      if (!live) return;
      setState(s);
      try {
        setDismissed(localStorage.getItem("becoming:notify-ask") === "no");
      } catch {}
    });
    return () => {
      live = false;
    };
  }, []);

  function turnOn() {
    start(async () => {
      const sub = await subscribe();
      if (sub?.endpoint && sub.keys) {
        const r = await savePushSubscription(sub as SubscriptionJSON);
        setState(r.ok ? "on" : "off");
      } else {
        setState(await pushState());
      }
    });
  }

  function turnOff() {
    start(async () => {
      const endpoint = await unsubscribe();
      if (endpoint) await removePushSubscription(endpoint);
      setState("off");
    });
  }

  if (state === null) return null;

  if (variant === "card") {
    // Pip asks once, only when it can actually work.
    if (state !== "off" || dismissed) return null;
    return (
      <div className="flex items-center gap-3 rounded-card bg-chip p-3 pr-4">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-snug">can I tap you on the shoulder?</p>
          <p className="text-[13px] text-muted">three times a day, at most. I&apos;m very polite.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem("becoming:notify-ask", "no");
            } catch {}
            setDismissed(true);
          }}
          className="text-[12px] font-semibold text-muted"
        >
          not now
        </button>
        <button type="button" disabled={pending} onClick={turnOn} className="min-h-10 rounded-full bg-foreground px-4 text-[14px] font-bold text-background disabled:opacity-40">
          yes
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold">notifications</p>
          <p className="text-[13px] text-muted">8:30 morning · the moment · 10pm wind-down</p>
        </div>
        {(state === "on" || state === "off") && (
          <button
            type="button"
            role="switch"
            aria-checked={state === "on"}
            disabled={pending}
            onClick={state === "on" ? turnOff : turnOn}
            className={`relative h-8 w-14 flex-none rounded-full transition-colors ${state === "on" ? "bg-kept" : "bg-foreground/15"}`}
          >
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${state === "on" ? "left-7" : "left-1"}`} />
          </button>
        )}
      </div>
      {state === "needs-home-screen" && <p className="text-[13px] text-muted">{HOME_SCREEN_HINT}</p>}
      {state === "blocked" && <p className="text-[13px] text-muted">they&apos;re blocked in Settings. turn them on for Becoming there.</p>}
      {state === "unsupported" && <p className="text-[13px] text-muted">this browser can&apos;t do notifications.</p>}
    </div>
  );
}
