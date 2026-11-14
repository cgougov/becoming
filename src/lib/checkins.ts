import type { PipMood } from "@/lib/pip";

/** Which check-in, if any, belongs to this local hour. The wind-down runs past midnight. */
export type CheckKind = "morning" | "evening";

export function checkWindow(localHour: number): CheckKind | null {
  if (localHour >= 5 && localHour < 11) return "morning";
  if (localHour >= 22 || localHour < 4) return "evening";
  return null;
}

/**
 * The evening check-in after midnight belongs to the day that just ended, so the wind-down at
 * 1am files under yesterday. Takes the local day string and hour; returns the day to record.
 */
export function checkDay(kind: CheckKind, localDayStr: string, localHour: number): string {
  if (kind === "evening" && localHour < 4) {
    const d = new Date(`${localDayStr}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  return localDayStr;
}

/** Pip mirrors the sliders with set faces, never a morph (round 7). */
export function pipMoodFor(mood: number, energy: number): PipMood {
  if (mood < 30) return "soft";
  if (energy < 30) return "sleepy";
  if (mood > 70) return "happy";
  return "calm";
}

/** Pip's lines (docs/VOICE.md). One per state; picked by a stable seed so it doesn't flicker. */
export const MORNING_HELLOS = [
  "good morning. today has potential. I checked.",
  "morning ♡ I have a good feeling about today.",
  "rise and shine. mostly rise.",
  "a new day! I've already tidied it for you.",
];
export const EVENING_HELLOS = ["it's wind-down time. come sit with me.", "the day is nearly done. how was it?", "lights low. let's look back, briefly."];

export function sliderLine(mood: number, energy: number): string {
  const m = pipMoodFor(mood, energy);
  if (m === "soft") return "oh no. I'm sorry.";
  if (m === "sleepy") return "you sound sleepy. so am I.";
  if (m === "happy") return energy > 60 ? "goodness, a good one!" : "oh, that is lovely.";
  return "an ordinary day. those count.";
}

export function goodThingPrompt(kind: CheckKind, mood: number): { ask: string; hint: string } {
  if (kind === "morning") return { ask: "one thing for today?", hint: "small is perfect." };
  return mood < 30 ? { ask: "even a tiny good thing?", hint: "it counts. truly." } : { ask: "one good thing from today?", hint: "small is fine." };
}

export function goodbyeLine(kind: CheckKind, mood: number): string {
  if (kind === "morning") return mood < 30 ? "gently, then. I'm here." : "off you go. I'll be right here.";
  return mood < 30 ? "goodnight. tomorrow is new." : "goodnight. I'll keep these safe.";
}

export const CHECKIN_LINES = [
  ...MORNING_HELLOS,
  ...EVENING_HELLOS,
  "oh no. I'm sorry.",
  "you sound sleepy. so am I.",
  "goodness, a good one!",
  "oh, that is lovely.",
  "an ordinary day. those count.",
  "one thing for today?",
  "small is perfect.",
  "even a tiny good thing?",
  "it counts. truly.",
  "one good thing from today?",
  "small is fine.",
  "gently, then. I'm here.",
  "off you go. I'll be right here.",
  "goodnight. tomorrow is new.",
  "goodnight. I'll keep these safe.",
];
