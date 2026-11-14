/**
 * Nightly filing: which collection does each kept thing belong to? Pure prompt building and
 * result parsing live here so they can be unit-tested without the API.
 */
export interface FilingEntry {
  id: string;
  body: string | null;
  has_photo: boolean;
}

export interface FilingCollection {
  slug: string;
  name: string;
  description: string | null;
}

export interface FilingAssignment {
  entry_id: string;
  collection_slug: string | null; // null = leave it for the person
  confidence: number; // 0–1
}

export interface FilingProposal {
  name: string;
  hint: string;
  entry_ids: string[];
}

export interface FilingResult {
  assignments: FilingAssignment[];
  proposals: FilingProposal[];
}

/** Below this, the partner leaves the entry unfiled rather than guess. */
export const FILE_THRESHOLD = 0.6;
/** A proposed collection needs at least this many entries to be worth making. */
export const PROPOSAL_MIN_ENTRIES = 3;

export const FILING_SCHEMA = {
  type: "object",
  properties: {
    assignments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          entry_id: { type: "string" },
          collection_slug: { type: ["string", "null"] },
          confidence: { type: "number" },
        },
        required: ["entry_id", "collection_slug", "confidence"],
        additionalProperties: false,
      },
    },
    proposals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          hint: { type: "string" },
          entry_ids: { type: "array", items: { type: "string" } },
        },
        required: ["name", "hint", "entry_ids"],
        additionalProperties: false,
      },
    },
  },
  required: ["assignments", "proposals"],
  additionalProperties: false,
} as const;

export function buildFilingPrompt(entries: FilingEntry[], collections: FilingCollection[]): string {
  const cols = collections.length
    ? collections.map((c) => `- ${c.slug}: ${c.name}${c.description ? ` — ${c.description}` : ""}`).join("\n")
    : "(none yet)";
  const items = entries
    .map((e) => `- id ${e.id}: ${e.body ? JSON.stringify(e.body) : "(no text)"}${e.has_photo ? " [has a photo]" : ""}`)
    .join("\n");
  return `The person keeps things in collections they named themselves. File each kept thing into the collection it clearly belongs to.

Their collections (use the slug):
${cols}

Things kept today, not yet filed:
${items}

Rules:
- Use only the slugs listed. If nothing fits clearly, set collection_slug to null; the person will file it. Never force a fit.
- confidence is your honest 0–1 estimate that the person would file it there themselves.
- If three or more unfiled things share a theme that none of the collections covers, propose ONE new collection in plain, short words the person might use ("places I ate", not "Culinary experiences"), with the entry ids it would hold. Otherwise propose nothing.
- A photo with no text can only be filed if the collections make it obvious (e.g. only one collection is visual); otherwise null.`;
}

/** Validate and clean what came back. Drops anything that doesn't refer to real entries/collections. */
export function cleanFilingResult(raw: unknown, entries: FilingEntry[], collections: FilingCollection[]): FilingResult {
  const entryIds = new Set(entries.map((e) => e.id));
  const slugs = new Set(collections.map((c) => c.slug));
  const r = (raw ?? {}) as Partial<FilingResult>;

  const seen = new Set<string>();
  const assignments: FilingAssignment[] = [];
  for (const a of Array.isArray(r.assignments) ? r.assignments : []) {
    if (!a || typeof a.entry_id !== "string" || !entryIds.has(a.entry_id) || seen.has(a.entry_id)) continue;
    seen.add(a.entry_id);
    const slug = typeof a.collection_slug === "string" && slugs.has(a.collection_slug) ? a.collection_slug : null;
    const confidence = typeof a.confidence === "number" && Number.isFinite(a.confidence) ? Math.min(1, Math.max(0, a.confidence)) : 0;
    assignments.push({ entry_id: a.entry_id, collection_slug: slug, confidence });
  }

  const proposals: FilingProposal[] = [];
  for (const p of Array.isArray(r.proposals) ? r.proposals : []) {
    if (!p || typeof p.name !== "string" || !p.name.trim()) continue;
    const ids = Array.isArray(p.entry_ids) ? [...new Set(p.entry_ids.filter((id): id is string => typeof id === "string" && entryIds.has(id)))] : [];
    if (ids.length < PROPOSAL_MIN_ENTRIES) continue;
    proposals.push({ name: p.name.trim().slice(0, 40), hint: typeof p.hint === "string" ? p.hint.trim().slice(0, 80) : "", entry_ids: ids });
    break; // one proposal a night, by design
  }

  return { assignments, proposals };
}

/** Which assignments are confident enough to apply without asking. */
export function confidentAssignments(result: FilingResult): FilingAssignment[] {
  return result.assignments.filter((a) => a.collection_slug !== null && a.confidence >= FILE_THRESHOLD);
}
