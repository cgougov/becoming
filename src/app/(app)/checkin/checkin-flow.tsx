"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TapOrWrite } from "@/components/tap-or-write";
import { PipFace } from "@/components/pip-face";
import { MOOD_EVENT } from "@/components/companion";
import { lastNightLine, GOOD_CHIPS, MOOD_BAR_ASK, MOOD_ENDS, MORNING_CHIPS, TOMORROW_CHIPS, TOMORROW_PROMPT, barGoodbye, goodThingPrompt, goodbyeLine, moodWord, pipMoodFor, sliderLine, type CheckKind } from "@/lib/checkins";
import { MOOD_COLORS } from "@/lib/pip";
import { saveCheckin, skipCheckin } from "./actions";

type Step = "sliders" | "text" | "tomorrow" | "done";

/**
 * The morning check-in and the 10pm wind-down. Collapsed: a small card with a line from Pip.
 * Open: Pip big, mirroring the sliders with set faces and its mood color; then one thing.
 */
export function CheckinFlow({
  kind,
  hello,
  pipDay,
  variant = "card",
  current = null,
  lastNight = null,
}: {
  kind: CheckKind;
  hello: string;
  pipDay: string;
  /** "bar": the always-there mood bar on Today. Sliders only, no text step. */
  variant?: "card" | "bar";
  /** Today's last check, so the bar shows it and the sliders start there. */
  current?: { mood: number; energy: number } | null;
  /** Morning only: last night's "better tomorrow", offered as the first starter. */
  lastNight?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("sliders");
  const [mood, setMood] = useState(current?.mood ?? 60);
  const [energy, setEnergy] = useState(current?.energy ?? (kind === "evening" ? 40 : 60));
  const [text, setText] = useState("");
  const [tomorrow, setTomorrow] = useState("");
  const [hidden, setHidden] = useState(false);

  const pip = step === "done" && mood >= 30 ? "happy" : pipMoodFor(mood, energy);
  const line =
    step === "sliders"
      ? sliderLine(mood, energy)
      : step === "text"
        ? goodThingPrompt(kind, mood).hint
        : step === "tomorrow"
          ? TOMORROW_PROMPT.hint
          : variant === "bar"
            ? barGoodbye(mood)
            : goodbyeLine(kind, mood);
  const prompt = goodThingPrompt(kind, mood);

  /**
   * No waiting: the screen moves on at once and the save happens in the background
   * (Christian: "it should move you to the next screen and save in the background").
   */
  function finish(t: { text?: string; tomorrow?: string } = {}) {
    window.dispatchEvent(new CustomEvent(MOOD_EVENT, { detail: { mood: pipMoodFor(mood, energy) } }));
    setStep("done");
    const saving = saveCheckin({ kind, mood, energy, text: t.text ?? "", tomorrow: t.tomorrow ?? "" });
    setTimeout(() => {
      setOpen(false);
      void saving.finally(() => router.refresh());
    }, 1800);
  }

  const afterText = () => (kind === "evening" && variant === "card" ? setStep("tomorrow") : finish({ text }));

  if (!open && variant === "bar") {
    const shown = current ? pipMoodFor(current.mood, current.energy) : "calm";
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center gap-3 rounded-full bg-chip pl-1.5 pr-4 text-left"
        aria-label={current ? `mood: ${moodWord(current.mood)}. update` : MOOD_BAR_ASK}
      >
        <PipFace mood={shown} day={pipDay} size={36} />
        <span className="flex-none text-[14px] font-semibold">{current ? moodWord(current.mood) : MOOD_BAR_ASK}</span>
        <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
          {current && (
            <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(6, current.mood)}%`, background: MOOD_COLORS[shown] }} />
          )}
        </span>
      </button>
    );
  }

  if (hidden) return null;

  if (!open) {
    return (
      <div className="flex items-center gap-3 rounded-card bg-chip p-3 pr-4">
        <PipFace mood={kind === "evening" ? "sleepy" : "calm"} day={pipDay} size={40} />
        <button type="button" onClick={() => setOpen(true)} className="min-w-0 flex-1 text-left">
          <span className="block text-[15px] font-semibold leading-snug">{hello}</span>
          <span className="block text-[13px] text-muted">{lastNight ? lastNightLine(lastNight) : kind === "morning" ? "how are you starting?" : "how was today?"}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setHidden(true);
            void skipCheckin(kind);
          }}
          className="text-[12px] font-semibold text-muted"
        >
          not now
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background" role="dialog" aria-modal="true" aria-label={kind === "morning" ? "Morning check-in" : "Wind-down"}>
      <div className="anim-pane mx-auto flex w-full max-w-md flex-1 flex-col px-7 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-semibold text-muted">{variant === "bar" ? "right now" : kind === "morning" ? "morning" : "wind-down"}</span>
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
            <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em]">{variant === "bar" ? MOOD_BAR_ASK : kind === "morning" ? "how are you starting?" : "how was today?"}</h2>
            {(
              [
                ["mood", mood, setMood, MOOD_ENDS[0], MOOD_ENDS[1]],
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
            <button
              type="button"
              onClick={() => (variant === "bar" ? finish() : setStep("text"))}
              className="h-13 min-h-12 rounded-full bg-foreground text-[16px] font-bold text-background"
            >
              {variant === "bar" ? "that's me" : "continue"}
            </button>
          </div>
        )}

        {step === "text" && (
          <div className="anim-rise mt-8 flex flex-col gap-4">
            <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em]">{prompt.ask}</h2>
            <TapOrWrite
              id="checkin-text"
              label={prompt.ask}
              value={text}
              onChange={setText}
              chips={kind === "morning" ? (lastNight ? [lastNight, ...MORNING_CHIPS] : MORNING_CHIPS) : GOOD_CHIPS}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => { setText(""); if (kind === "evening" && variant === "card") setStep("tomorrow"); else finish(); }} className="min-h-12 flex-1 rounded-full border-[1.5px] border-foreground/15 text-[15px] font-semibold">
                skip
              </button>
              <button type="button" disabled={!text.trim()} onClick={afterText} className="min-h-12 flex-[2] rounded-full bg-foreground text-[16px] font-bold text-background disabled:opacity-40">
                continue
              </button>
            </div>
          </div>
        )}

        {step === "tomorrow" && (
          <div className="anim-rise mt-8 flex flex-col gap-4">
            <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em]">{TOMORROW_PROMPT.ask}</h2>
            <TapOrWrite id="checkin-tomorrow" label={TOMORROW_PROMPT.ask} value={tomorrow} onChange={setTomorrow} chips={TOMORROW_CHIPS} />
            <div className="flex gap-2">
              <button type="button" onClick={() => finish({ text })} className="min-h-12 flex-1 rounded-full border-[1.5px] border-foreground/15 text-[15px] font-semibold">
                skip
              </button>
              <button type="button" disabled={!tomorrow.trim()} onClick={() => finish({ text, tomorrow })} className="min-h-12 flex-[2] rounded-full bg-foreground text-[16px] font-bold text-background disabled:opacity-40">
                goodnight
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <p className="anim-rise mt-8 text-center text-[14px] text-muted">
            {variant === "bar" ? "Pip matches you now." : kind === "morning" ? "it's on today's page." : "today is kept."}
          </p>
        )}
      </div>
    </div>
  );
}
