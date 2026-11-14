/**
 * First open: Pip introduces itself and asks who you want to become (Christian, 2026-11-14:
 * "the onboarding should be clear about helping you be the best person you want to be").
 * Every step is skippable; nothing is required. Lines follow docs/VOICE.md.
 */
export const ONBOARDING = {
  hello: { pip: "hi. I'm Pip.", title: "I'm here to help you become who you want to be.", body: "you keep little pieces of your days. I sort them, notice things, and cheer. quietly." },
  becoming: { pip: "the big question. no pressure.", title: "who do you want to become?", placeholder: "someone who reads more and calls home" },
  keep: { pip: "I'll sort things into these.", title: "what should I keep track of?" },
  week: { pip: "small is perfect.", title: "one thing for this week?", placeholder: "run twice. finish the book." },
  notify: { pip: "I promise to be polite.", title: "can I tap you on the shoulder?", body: "8:30 to check in, once at a surprise moment, 10pm to wind down. three, at most." },
  done: { pip: "lovely. I'm thrilled, frankly.", title: "now keep one thing.", body: "anything at all. a thought, a photo, what's in front of you." },
} as const;

/** Tap-to-fill sparks for "who do you want to become?" Starting points, not a quiz. */
export const BECOMING_SPARKS = ["stronger", "calmer", "closer to my people", "more creative", "more curious", "more present"] as const;

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
