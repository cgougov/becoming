/**
 * First open: Pip introduces itself and asks who you want to become (Christian, 2026-11-14:
 * "the onboarding should be clear about helping you be the best person you want to be").
 * Every step is skippable; nothing is required. Lines follow docs/VOICE.md.
 */
export const ONBOARDING = {
  hello: { pip: "hello. I'm Pip, at your service.", title: "I'm here to help you become who you want to be.", body: "you keep little pieces of your days. I sort them, notice things, and cheer. politely." },
  becoming: { pip: "the big question. tap all that apply.", title: "who do you want to become?", placeholder: "or say it your way" },
  keep: { pip: "I'll sort things into these.", title: "what should I keep track of?" },
  week: { pip: "small is perfect.", title: "one thing for this week?", placeholder: "run twice. finish the book." },
  notify: { pip: "I promise to be polite.", title: "can I tap you on the shoulder?", body: "8:30 to check in, once at a surprise moment, 10pm to wind down. three, at most." },
  done: { pip: "splendid. I'm thrilled, frankly.", title: "now keep one thing.", body: "anything at all. a thought, a photo, the best thing since you woke up." },
} as const;

/** Tap-to-fill sparks (kept for the free-text box). */
export const BECOMING_SPARKS = ["stronger", "calmer", "closer to my people", "more creative", "more curious", "more present"] as const;

/**
 * "who do you want to become?" as taps (Christian: "more hard coding"). Each choice may ask one
 * follow-up with set answers; the pair becomes a goal in plain words. Free text covers the rest.
 */
export interface BecomingOption {
  id: string;
  label: string;
  follow?: { ask: string; choices: string[] };
  /** The goal it becomes, given the follow-up answer. */
  goal: (answer?: string) => { text: string; horizon: "week" | "month" | "year" };
}

export const BECOMING_OPTIONS: BecomingOption[] = [
  { id: "language", label: "learn a language", follow: { ask: "which one?", choices: ["Bulgarian", "Spanish", "French", "Japanese", "Italian", "Mandarin"] }, goal: (a) => ({ text: `practice ${a ?? "a language"} most days`, horizon: "week" }) },
  { id: "lift", label: "get stronger", follow: { ask: "how often?", choices: ["2 a week", "3 a week", "4 a week", "5 a week"] }, goal: (a) => ({ text: `lift ${a ?? "3 a week"}`, horizon: "week" }) },
  { id: "read", label: "read more", follow: { ask: "how often?", choices: ["every day", "a few times a week", "a book a month"] }, goal: (a) => ({ text: a === "a book a month" ? "read a book a month" : `read ${a ?? "a few times a week"}`, horizon: a === "a book a month" ? "month" : "week" }) },
  { id: "faith", label: "grow in faith", follow: { ask: "what does that look like?", choices: ["read my Bible", "pray daily", "go to church", "read scripture"] }, goal: (a) => ({ text: `${a ?? "pray daily"}${a === "read my Bible" || a === "read scripture" ? " daily" : ""}`, horizon: "week" }) },
  { id: "art", label: "art and culture", goal: () => ({ text: "see more art and culture", horizon: "month" }) },
  { id: "scroll", label: "scroll less", goal: () => ({ text: "scroll less, live more", horizon: "week" }) },
  { id: "people", label: "closer to my people", follow: { ask: "who especially?", choices: ["family", "friends from home", "my partner", "everyone"] }, goal: (a) => ({ text: `stay close to ${a ?? "my people"}`, horizon: "month" }) },
  { id: "sleep", label: "sleep better", goal: () => ({ text: "sleep earlier", horizon: "week" }) },
  { id: "calm", label: "calmer", goal: () => ({ text: "find a calm minute each day", horizon: "week" }) },
  { id: "create", label: "make things", follow: { ask: "what kind?", choices: ["write", "draw", "music", "cook", "build"] }, goal: (a) => ({ text: `${a ?? "make"} something each week`, horizon: "week" }) },
];

export function goalsFromChoices(picked: Record<string, string | undefined>, own: string): { text: string; horizon: "week" | "month" | "year" }[] {
  const out = BECOMING_OPTIONS.filter((o) => o.id in picked).map((o) => o.goal(picked[o.id]));
  const mine = normalizeDirection(own);
  if (mine) out.push({ text: mine, horizon: "year" });
  return out;
}

/** Collections ticked by default, so nothing you keep is ever homeless. */
export const DEFAULT_COLLECTIONS = ["thoughts", "small-wins", "people"] as const;

export const MAX_DIRECTION = 120;

/** One line, your words. Null when empty or too long. */
export function normalizeDirection(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t || t.length > MAX_DIRECTION) return null;
  return t;
}

/** A spark becomes a sentence: "stronger" → "someone stronger". Your own words pass through. */
export function sparkToDirection(spark: string): string {
  return `someone ${spark}`;
}

/** What Pip says out loud (voice-tested). Bodies are supporting copy under the title. */
export const ONBOARDING_LINES: string[] = Object.values(ONBOARDING).flatMap((s) => [s.pip, s.title]);
