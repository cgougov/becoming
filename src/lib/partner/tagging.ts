/**
 * Live tagging: as you keep something, the partner reads it and suggests tags (collections you
 * already have, people you named) and how it reads (hard / neutral / good). Pure prompt building
 * and result cleaning live here so they can be unit-tested without the API.
 */
export interface TagCollection {
  slug: string;
  name: string;
  description: string | null;
}

export type Tone = "hard" | "neutral" | "good";

export interface TagDirection {
  key: string; // short key shown to the model ("g1"), mapped back to an id by the caller
  text: string;
  horizon: string;
}

export interface TaggingResult {
  collections: string[]; // slugs, existing only
  people: string[]; // names as the person wrote them
  tone: Tone;
  directions: string[]; // direction keys, existing only
}

export const MAX_DIRECTION_LINKS = 2;

export const MAX_COLLECTION_TAGS = 2;
export const MAX_PEOPLE_TAGS = 4;
export const MAX_PERSON_NAME = 40;
/** Where things go when nothing else fits, if you have it. Nothing is ever left homeless. */
export const CATCH_ALL_SLUG = "thoughts";

export const TAGGING_SCHEMA = {
  type: "object",
  properties: {
    collections: { type: "array", items: { type: "string" } },
    people: { type: "array", items: { type: "string" } },
    tone: { type: "string", enum: ["hard", "neutral", "good"] },
    directions: { type: "array", items: { type: "string" } },
  },
  required: ["collections", "people", "tone", "directions"],
  additionalProperties: false,
} as const;

export function buildTaggingPrompt(body: string, collections: TagCollection[], knownPeople: string[], directions: TagDirection[] = []): string {
  const goals = directions.length ? directions.map((d) => `- ${d.key}: ${d.text} (this ${d.horizon})`).join("\n") : "(none yet)";
  const cols = collections.length
    ? collections.map((c) => `- ${c.slug}: ${c.name}${c.description ? ` (${c.description})` : ""}`).join("\n")
    : "(none yet)";
  const people = knownPeople.length ? knownPeople.join(", ") : "(none yet)";
  return `Someone just kept this in their personal scrapbook:
${JSON.stringify(body)}

Their collections (use the slug):
${cols}

People they've mentioned before: ${people}

Who they're trying to become (use the key):
${goals}

Return:
- collections: the slugs this clearly belongs in, at most ${MAX_COLLECTION_TAGS}. Only slugs listed above. If none fits clearly, return [].
- people: every person they mention by name or by how they refer to them ("mom", "my roommate"). Use the exact name they wrote. If it matches someone they've mentioned before, use that spelling. Never invent anyone. Return [] if no one.
- directions: the keys of goals this is a step toward (practice, progress, or effort, even a small one), at most ${MAX_DIRECTION_LINKS}. A run counts toward "get stronger"; a call home counts toward "closer to family". Return [] if it's unrelated.
- tone: "hard" if it reads as a hard moment for them (a loss, a failure, stress, sadness), "good" if clearly a good one, otherwise "neutral".`;
}

/** Validate what came back. Drops unknown slugs, trims and dedupes names, defaults tone. */
export function cleanTaggingResult(raw: unknown, collections: TagCollection[], knownPeople: string[], directions: TagDirection[] = []): TaggingResult {
  const r = (raw ?? {}) as Partial<TaggingResult>;
  const slugs = new Set(collections.map((c) => c.slug));
  const outCols: string[] = [];
  for (const s of Array.isArray(r.collections) ? r.collections : []) {
    if (typeof s === "string" && slugs.has(s) && !outCols.includes(s)) outCols.push(s);
    if (outCols.length >= MAX_COLLECTION_TAGS) break;
  }

  const known = new Map(knownPeople.map((n) => [n.toLowerCase(), n]));
  const outPeople: string[] = [];
  const seen = new Set<string>();
  for (const n of Array.isArray(r.people) ? r.people : []) {
    if (typeof n !== "string") continue;
    const name = n.trim().replace(/\s+/g, " ");
    if (!name || name.length > MAX_PERSON_NAME) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    outPeople.push(known.get(key) ?? name);
    if (outPeople.length >= MAX_PEOPLE_TAGS) break;
  }

  if (outCols.length === 0 && slugs.has(CATCH_ALL_SLUG)) outCols.push(CATCH_ALL_SLUG);

  const tone: Tone = r.tone === "hard" || r.tone === "good" ? r.tone : "neutral";
  const keys = new Set(directions.map((d) => d.key));
  const outDirs: string[] = [];
  for (const k of Array.isArray(r.directions) ? r.directions : []) {
    if (typeof k === "string" && keys.has(k) && !outDirs.includes(k)) outDirs.push(k);
    if (outDirs.length >= MAX_DIRECTION_LINKS) break;
  }

  return { collections: outCols, people: outPeople, tone, directions: outDirs };
}

/** Display form of a person's name: capitalize the first letter, keep the rest as written. */
export function displayPersonName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
