/** Morning intention rules. Pure so they're testable; the UI just asks. */

/** The line shows on Keep only in the morning window, unless an intention already exists today. */
export const MORNING_START = 5;
export const MORNING_END = 11; // exclusive

export function showIntentionPrompt(localHour: number, hasIntentionToday: boolean): boolean {
  if (hasIntentionToday) return true; // pinned all day once set
  return localHour >= MORNING_START && localHour < MORNING_END;
}

export const MAX_INTENTION = 120;

export function normalizeIntention(raw: string): string | null {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t || t.length > MAX_INTENTION) return null;
  return t;
}
