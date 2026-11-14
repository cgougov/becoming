import { TONES, toneFor } from "./gradients";
/**
 * Collections are the user's own places for things: chosen on first open from these
 * suggestions, added in their own words, and later proposed by the partner.
 * (Decided 2026-11-12: emergent, not a fixed taxonomy.)
 */
export interface SuggestedCollection {
  slug: string;
  name: string;
  hint: string;
}

export const SUGGESTED_COLLECTIONS: readonly SuggestedCollection[] = [
  { slug: "thoughts", name: "Thoughts", hint: "loose thoughts. no filing needed." },
  { slug: "lifts", name: "Lifts", hint: "heavy things, lifted." },
  { slug: "places-i-ate", name: "Places I ate", hint: "good bites only." },
  { slug: "reading", name: "Reading", hint: "words, consumed." },
  { slug: "people", name: "People", hint: "your favorite humans." },
  { slug: "ideas", name: "Ideas", hint: "brain sparks. unfiltered." },
  { slug: "outfits", name: "Outfits", hint: "fits, documented." },
  { slug: "quotes", name: "Quotes", hint: "someone said a good thing." },
  { slug: "art", name: "Art", hint: "pretty things. noted." },
  { slug: "work", name: "Work", hint: "stuff you're making." },
  { slug: "places", name: "Places", hint: "been there. or will." },
  { slug: "small-wins", name: "Small wins", hint: "tiny victories. still count." },
  { slug: "questions", name: "Questions", hint: "no answers required." },
] as const;

export const MAX_COLLECTION_NAME = 40;

/** What an empty tile says: the cute hint for a suggested collection, else its own words. */
export function emptyTileLine(slug: string, description: string | null): string {
  return SUGGESTED_COLLECTIONS.find((c) => c.slug === slug)?.hint ?? description ?? "nothing yet.";
}

/** URL- and DB-safe slug from a user-typed name. Returns null if nothing usable remains. */
export function slugify(name: string): string | null {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || null;
}

/** Clean a user-typed collection name. Null if empty after trimming or too long. */
export function normalizeCollectionName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name || name.length > MAX_COLLECTION_NAME) return null;
  return name;
}

/** Reserved slugs that can't be collection names (they're routes). */
export const RESERVED_SLUGS = new Set(["unsorted", "new", "person", "everyone", "goal"]);

/**
 * Turn the first-open choices into rows to insert. Dedupes by slug, keeps the
 * user's order, skips reserved and empty names.
 */
export function buildInitialCollections(
  chosenSuggestionSlugs: string[],
  customNames: string[],
): { slug: string; name: string; description: string | null; origin: "suggested" | "user"; position: number }[] {
  const out: ReturnType<typeof buildInitialCollections> = [];
  const seen = new Set<string>();

  for (const slug of chosenSuggestionSlugs) {
    const s = SUGGESTED_COLLECTIONS.find((c) => c.slug === slug);
    if (!s || seen.has(s.slug)) continue;
    seen.add(s.slug);
    out.push({ slug: s.slug, name: s.name, description: s.hint, origin: "suggested", position: out.length });
  }
  for (const raw of customNames) {
    const name = normalizeCollectionName(raw);
    const slug = name ? slugify(name) : null;
    if (!name || !slug || seen.has(slug) || RESERVED_SLUGS.has(slug)) continue;
    seen.add(slug);
    out.push({ slug, name, description: null, origin: "user", position: out.length });
  }
  return out;
}

/**
 * A collection's dot color. Deterministic from the slug until the user picks one
 * (a `color` column can come later; the UI only needs a stable, pleasant hue).
 */
/** Dots and tiles share one palette (src/lib/gradients.ts), so a dot always matches its tile. */
export const DOT_COLORS = TONES;

export function dotColor(slug: string | null | undefined): string {
  if (!slug) return "#c8c8d0"; // unsorted
  return toneFor(slug);
}
