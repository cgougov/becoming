"use client";

import { useState, useTransition } from "react";
import { PipFace } from "@/components/pip-face";
import { MAX_COLLECTION_NAME, SUGGESTED_COLLECTIONS, normalizeCollectionName } from "@/lib/collections";
import { BECOMING_OPTIONS, DEFAULT_COLLECTIONS, MAX_DIRECTION, ONBOARDING, goalsFromChoices } from "@/lib/onboarding";
import { MicButton } from "@/components/mic-button";
import type { PipMood } from "@/lib/pip";
import { pushState, subscribe } from "@/lib/push-client";
import { savePushSubscription, type SubscriptionJSON } from "../notify/actions";
import { completeSetup } from "./actions";

const STEPS = ["hello", "becoming", "keep", "notify", "done"] as const;
type Step = (typeof STEPS)[number];
const PIP: Record<Step, PipMood> = { hello: "happy", becoming: "calm", keep: "calm", notify: "happy", done: "happy" };

/**
 * Onboarding as a short conversation with Pip. One thing per screen, everything skippable,
 * about a minute. Ends by dropping you on Today, ready to keep your first thing.
 */
export function StartForm({ pipDay }: { pipDay: string }) {
  const [step, setStep] = useState<Step>("hello");
  const [becoming, setBecoming] = useState("");
  // Picked options → their follow-up answer (undefined until answered).
  const [picked, setPicked] = useState<Record<string, string | undefined>>({});
  const [chosen, setChosen] = useState<Set<string>>(new Set(DEFAULT_COLLECTIONS));
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [homeScreen, setHomeScreen] = useState(false);
  const [pending, start] = useTransition();

  const s = ONBOARDING[step];
  const next = () => setStep(STEPS[Math.min(STEPS.indexOf(step) + 1, STEPS.length - 1)]);

  function addCustom() {
    const name = normalizeCollectionName(draft);
    if (!name || custom.includes(name)) return;
    setCustom([...custom, name]);
    setDraft("");
  }

  function askNotify() {
    start(async () => {
      const st = await pushState();
      if (st === "needs-home-screen") {
        setHomeScreen(true);
        return;
      }
      if (st === "off") {
        const sub = await subscribe();
        if (sub?.endpoint && sub.keys) await savePushSubscription(sub as SubscriptionJSON);
      }
      next();
    });
  }

  function finish() {
    const fd = new FormData();
    for (const c of chosen) fd.append("suggested", c);
    for (const c of custom) fd.append("custom", c);
    fd.set("goals", JSON.stringify(goalsFromChoices(picked, becoming)));
    start(() => completeSetup(fd));
  }

  const chip = (on: boolean) =>
    `min-h-10 rounded-full px-4 text-[14px] font-semibold transition-colors ${on ? "bg-foreground text-background" : "bg-chip"}`;
  const primary = "min-h-12 flex-[2] rounded-full bg-foreground text-[16px] font-bold text-background disabled:opacity-40";
  const quiet = "min-h-12 flex-1 rounded-full text-[15px] font-semibold text-muted";

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-7 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="flex gap-1.5" aria-hidden>
          {STEPS.map((x, i) => (
            <span key={x} className={`h-1 flex-1 rounded-full ${i <= STEPS.indexOf(step) ? "bg-foreground/70" : "bg-foreground/10"}`} />
          ))}
        </div>

        <div key={step} className="anim-rise mt-8 flex flex-1 flex-col">
          <div className="flex items-center gap-3">
            <span className={step === "hello" || step === "done" ? "anim-hop" : "anim-breathe"}>
              <PipFace mood={PIP[step]} day={pipDay} size={step === "hello" ? 96 : 56} />
            </span>
            <p className="text-[15px] font-semibold text-muted">{s.pip}</p>
          </div>
          <h1 className="mt-6 text-[30px] font-bold leading-[1.1] tracking-[-0.025em]">{s.title}</h1>
          {"body" in s && <p className="mt-3 text-[16px] leading-snug text-muted">{s.body}</p>}

          {step === "becoming" && (
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Who you want to become">
                {BECOMING_OPTIONS.map((o) => {
                  const on = o.id in picked;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        const n = { ...picked };
                        if (on) delete n[o.id];
                        else n[o.id] = undefined;
                        setPicked(n);
                      }}
                      className={chip(on)}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              {BECOMING_OPTIONS.filter((o) => o.follow && o.id in picked).map((o) => (
                <div key={o.id} className="anim-rise flex flex-col gap-2">
                  <p className="text-[13px] font-bold text-muted">
                    {o.label} · {o.follow!.ask}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {o.follow!.choices.map((c) => (
                      <button key={c} type="button" aria-pressed={picked[o.id] === c} onClick={() => setPicked({ ...picked, [o.id]: c })} className={chip(picked[o.id] === c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-end gap-2">
                <label htmlFor="becoming-own" className="sr-only">
                  {ONBOARDING.becoming.placeholder}
                </label>
                <textarea
                  id="becoming-own"
                  rows={2}
                  value={becoming}
                  maxLength={MAX_DIRECTION}
                  onChange={(e) => setBecoming(e.target.value)}
                  placeholder={ONBOARDING.becoming.placeholder}
                  className="flex-1 resize-none rounded-[22px] bg-chip px-4 py-3 text-[17px] font-medium leading-snug outline-none placeholder:text-muted"
                />
                <MicButton onText={(t) => setBecoming(becoming ? `${becoming} ${t}` : t)} />
              </div>
            </div>
          )}

          {step === "keep" && (
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Collections">
                {SUGGESTED_COLLECTIONS.map((c) => {
                  const on = chosen.has(c.slug);
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        const n = new Set(chosen);
                        if (on) n.delete(c.slug);
                        else n.add(c.slug);
                        setChosen(n);
                      }}
                      className={chip(on)}
                    >
                      {c.name}
                    </button>
                  );
                })}
                {custom.map((name) => (
                  <button key={name} type="button" onClick={() => setCustom(custom.filter((n) => n !== name))} className={chip(true)} aria-label={`Remove ${name}`}>
                    {name} ✕
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={draft}
                  maxLength={MAX_COLLECTION_NAME}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustom();
                    }
                  }}
                  placeholder="or your own: soccer, café finds…"
                  aria-label="Your own collection"
                  className="min-h-11 flex-1 rounded-full bg-chip px-4 text-[15px] outline-none placeholder:text-muted"
                />
                <button type="button" onClick={addCustom} className="min-h-11 rounded-full bg-chip px-4 text-[14px] font-semibold">
                  add
                </button>
              </div>
            </div>
          )}

          {step === "notify" && homeScreen && (
            <p className="mt-6 rounded-[20px] bg-chip p-4 text-[15px] leading-snug">
              first, add me to your Home Screen: tap Share, then <b>Add to Home Screen</b>. open me from there and I can tap you. you can also do it later in Yours.
            </p>
          )}

          <div className="mt-auto flex gap-2 pt-8">
            {step === "hello" && (
              <button type="button" onClick={next} className={primary}>
                hi, Pip
              </button>
            )}
            {step === "becoming" && (
              <>
                <button type="button" onClick={next} className={quiet}>
                  skip
                </button>
                <button type="button" onClick={next} disabled={Object.keys(picked).length === 0 && !becoming.trim()} className={primary}>
                  continue
                </button>
              </>
            )}
            {step === "keep" && (
              <button type="button" onClick={next} className={primary}>
                {chosen.size + custom.length === 0 ? "none for now" : "continue"}
              </button>
            )}
            {step === "notify" && (
              <>
                <button type="button" onClick={next} className={quiet}>
                  later
                </button>
                <button type="button" onClick={homeScreen ? next : askNotify} disabled={pending} className={primary}>
                  {homeScreen ? "got it" : "yes, tap me"}
                </button>
              </>
            )}
            {step === "done" && (
              <button type="button" onClick={finish} disabled={pending} className={primary}>
                {pending ? "one sec…" : "let's go"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
