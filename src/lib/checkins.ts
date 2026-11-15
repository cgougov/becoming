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
  "good morning. I've reviewed today. promising.",
  "ah, you're awake. splendid.",
  "good morning. by my calculations, today will do.",
  "morning. I've been up for hours. figuratively.",
];
export const EVENING_HELLOS = [
  "pardon me. it's ten o'clock. wind-down time.",
  "the day is nearly done. shall we review it?",
  "if I may, it's time to close out the day.",
];

export function sliderLine(mood: number, energy: number): string {
  const m = pipMoodFor(mood, energy);
  if (m === "soft") return "oh no. I'm sorry.";
  if (m === "sleepy") return "you sound tired. I'll speak softly.";
  if (m === "happy") return energy > 60 ? "oh! splendid. most splendid." : "how lovely. noted with joy.";
  return "an ordinary day. those count too.";
}

export function goodThingPrompt(kind: CheckKind, mood: number): { ask: string; hint: string } {
  if (kind === "morning") return { ask: "one thing for today?", hint: "small is perfectly acceptable." };
  return mood < 30
    ? { ask: "even a very small good thing?", hint: "small things count. it's in my manual." }
    : { ask: "best thing since you woke up?", hint: "anything qualifies. I checked the rules." };
}

export function goodbyeLine(kind: CheckKind, mood: number): string {
  if (kind === "morning") return mood < 30 ? "gently, then. I'll be right here." : "off you go. I'll mind things here.";
  return mood < 30 ? "goodnight. tomorrow is a fresh one." : "goodnight. I'll keep everything safe.";
}

/** Tap-or-write: a few starters for each text step. Tapping fills the box; you can edit it. */
export const GOOD_CHIPS = ["a good meal", "time with someone", "got something done", "moved my body", "a quiet minute", "learned something"];
export const TOMORROW_CHIPS = ["sleep earlier", "less phone", "move more", "reach out to someone", "one thing at a time", "be patient with myself"];
export const MORNING_CHIPS = ["move my body", "call someone", "read a little", "one thing at a time"];

/** The wind-down's last question; the answer becomes tomorrow morning's reminder. */
export const TOMORROW_PROMPT = { ask: "one thing to do better tomorrow?", hint: "I'll remind you in the morning. politely." };

/** How last night's answer comes back in the morning. */
export function lastNightLine(text: string): string {
  return `from last night: ${text}`;
}

export const CHECKIN_LINES: string[] = [
  ...MORNING_HELLOS,
  ...EVENING_HELLOS,
  "oh no. I'm sorry.",
  "you sound tired. I'll speak softly.",
  "oh! splendid. most splendid.",
  "how lovely. noted with joy.",
  "an ordinary day. those count too.",
  "one thing for today?",
  "small is perfectly acceptable.",
  "even a very small good thing?",
  "small things count. it's in my manual.",
  "best thing since you woke up?",
  "anything qualifies. I checked the rules.",
  "gently, then. I'll be right here.",
  "off you go. I'll mind things here.",
  "goodnight. tomorrow is a fresh one.",
  "goodnight. I'll keep everything safe.",
  "how are you, honestly?",
  TOMORROW_PROMPT.ask,
  TOMORROW_PROMPT.hint,
  "noted. I shall adjust accordingly.",
];

/**
 * Which row an anytime check (the mood bar) updates. All day it's the daytime row ("morning"),
 * so it never uses up the 10pm wind-down; after the wind-down it updates the evening row.
 */
export function anytimeKind(localHour: number): CheckKind {
  return localHour >= 5 && localHour < 22 ? "morning" : "evening";
}

/** One plain, honest word for the mood bar (Christian: "light" read as dishonest). */
export function moodWord(mood: number): string {
  if (mood < 20) return "rough";
  if (mood < 40) return "low";
  if (mood < 60) return "okay";
  if (mood < 80) return "good";
  return "great";
}

/** The ends of the mood slider, same plain words. */
export const MOOD_ENDS = ["rough", "great"] as const;

export const MOOD_BAR_ASK = "how are you, honestly?";

export function barGoodbye(mood: number): string {
  return mood < 30 ? "gently, then. I'll be right here." : "noted. I shall adjust accordingly.";
}
