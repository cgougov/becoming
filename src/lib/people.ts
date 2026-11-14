/** People helpers: when you last kept something about someone, and Pip's gentle nudges. */

export function sinceLabel(last: Date | null, now: Date): string {
  if (!last) return "not yet";
  const days = Math.floor((now.getTime() - last.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days`;
  if (days < 14) return "a week";
  if (days < 60) return `${Math.floor(days / 7)} weeks`;
  return `${Math.floor(days / 30)} months`;
}

/** Close-circle people go quiet after this many days without anything kept about them. */
export const NUDGE_AFTER_DAYS = 7;

export interface PersonLast {
  id: string;
  slug: string;
  name: string;
  close: boolean;
  last: Date | null;
}

/** The one person Pip might mention: the close-circle person quiet the longest. Never more than one. */
export function pickNudge(people: PersonLast[], now: Date): PersonLast | null {
  const quiet = people
    .filter((p) => p.close)
    .filter((p) => !p.last || now.getTime() - p.last.getTime() >= NUDGE_AFTER_DAYS * 86_400_000)
    .sort((a, b) => (a.last?.getTime() ?? 0) - (b.last?.getTime() ?? 0));
  return quiet[0] ?? null;
}

/** Pip's nudge lines (docs/VOICE.md). `{name}` is filled in. */
export const NUDGE_LINES = [
  "it's been a while since {name}. maybe say hi?",
  "I miss hearing about {name}. do you?",
  "{name} has been quiet on my pages.",
  "a little hello to {name}, perhaps?",
];

export function nudgeLine(name: string, seed: number): string {
  return NUDGE_LINES[seed % NUDGE_LINES.length].replace("{name}", name);
}

/** Digits only, keeping a leading +. Null if it isn't a plausible number. */
export function normalizePhone(raw: string): string | null {
  const t = raw.trim();
  const digits = t.replace(/\D/g, "");
  if (digits.length < 3 || digits.length > 20) return null;
  return (t.startsWith("+") ? "+" : "") + digits;
}

/** One-tap ways to reach someone. Opens Messages / Phone / FaceTime on iPhone. */
export function reachLinks(phone: string): { text: string; call: string; facetime: string } {
  return { text: `sms:${phone}`, call: `tel:${phone}`, facetime: `facetime:${phone}` };
}
