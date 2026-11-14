"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PipFace } from "@/components/pip-face";
import { goodThingPrompt, goodbyeLine, pipMoodFor, sliderLine, type CheckKind } from "@/lib/checkins";
import { saveCheckin, skipCheckin } from "./actions";

type Step = "sliders" | "text" | "done";

/**
 * The morning check-in and the 10pm wind-down. Collapsed: a small card with a line from Pip.
 * Open: Pip big, mirroring the sliders with set faces and its mood color; then one thing.
 */
export function CheckinFlow({ kind, hello, pipDay }: { kind: CheckKind; hello: string; pipDay: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("sliders");
  const [mood, setMood] = useState(60);
  const [energy, setEnergy] = useState(kind === "evening" ? 40 : 60);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();

  const pip = step === "done" && mood >= 30 ? "happy" : pipMoodFor(mood, energy);
  const line = step === "sliders" ? sliderLine(mood, energy) : step === "text" ? goodThingPrompt(kind, mood).hint : goodbyeLine(kind, mood);
  const prompt = goodThingPrompt(kind, mood);

  function finish(withText: boolean) {
    start(async () => {
      await saveCheckin({ kind, mood, energy, text: withText ? text : "" });
      setStep("done");
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 2600);
    });
  }

  if (!open) {
    return (
      <div className="flex items-center gap-3 rounded-card bg-chip p-3 pr-4">
        <PipFace mood={kind === "evening" ? "sleepy" : "calm"} day={pipDay} size={40} />
        <button type="button" onClick={() => setOpen(true)} className="min-w-0 flex-1 text-left">
          <span className="block text-[15px] font-semibold leading-snug">{hello}</span>
          <span className="block text-[13px] text-muted">{kind === "morning" ? "how are you starting?" : "how was today?"}</span>
        </button>
        <button type="button" onClick={() => start(() => skipCheckin(kind))} disabled={pending} className="text-[12px] font-semibold text-muted">
          not now
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background" role="dialog" aria-modal="true" aria-label={kind === "morning" ? "Morning check-in" : "Wind-down"}>
      <div className="anim-pane mx-auto flex w-full max-w-md flex-1 flex-col px-7 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-semibold text-muted">{kind === "morning" ? "morning" : "wind-down"}</span>
          {step !== "done" && (
            <button type="button" onClick={() => setOpen(false)} className="min-h-11 text-[13px] font-semibold text-muted">
              close
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-col items-center gap-4">
          <span key={`${pip}-${step}`} className={step === "done" && mood >= 30 ? "anim-hop" : pip === "soft" ? "anim-sway" : "anim-breathe"}>
            <PipFace mood={pip} day={pipDay} size={140} />
          </span>
          <p className="min-h-6 text-center text-[17px] font-semibold" aria-live="polite">
            {line}
          </p>
        </div>

        {step === "sliders" && (
          <div className="anim-rise mt-8 flex flex-col gap-6">
            <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em]">{kind === "morning" ? "how are you starting?" : "how was today?"}</h2>
            {(
              [
                ["mood", mood, setMood, "heavy", "light"],
                ["energy", energy, setEnergy, "empty", "full"],
              ] as const
            ).map(([name, value, set, lo, hi]) => (
              <div key={name} className="flex flex-col gap-1">
                <label htmlFor={`slider-${name}`} className="text-[13px] font-bold text-muted">
                  {name}
                </label>
                <input
                  id={`slider-${name}`}
                  type="range"
                  min={0}
                  max={100}
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                  className="pip-range"
                />
                <div className="flex justify-between text-[12px] font-semibold text-muted/80">
                  <span>{lo}</span>
                  <span>{hi}</span>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setStep("text")} className="h-13 min-h-12 rounded-full bg-foreground text-[16px] font-bold text-background">
              next
            </button>
          </div>
        )}

        {step === "text" && (
          <div className="anim-rise mt-8 flex flex-col gap-4">
            <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em]">{prompt.ask}</h2>
            <label htmlFor="checkin-text" className="sr-only">
              {prompt.ask}
            </label>
            <textarea
              id="checkin-text"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              placeholder={prompt.hint}
              className="resize-none rounded-[22px] bg-chip px-4 py-4 text-[19px] font-medium leading-snug outline-none placeholder:text-muted"
            />
            <div className="flex gap-2">
              <button type="button" disabled={pending} onClick={() => finish(false)} className="min-h-12 flex-1 rounded-full border-[1.5px] border-foreground/15 text-[15px] font-semibold disabled:opacity-40">
                skip
              </button>
              <button type="button" disabled={pending || !text.trim()} onClick={() => finish(true)} className="min-h-12 flex-[2] rounded-full bg-foreground text-[16px] font-bold text-background disabled:opacity-40">
                {pending ? "keeping…" : "keep"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <p className="anim-rise mt-8 text-center text-[14px] text-muted">
            {kind === "morning" ? "it's on today's page." : "today is kept."}
          </p>
        )}
      </div>
    </div>
  );
}
