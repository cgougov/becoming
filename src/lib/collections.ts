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
  { slug: "lifts", name: "Lifts", hint: "PRs, sessions, how the body felt" },
  { slug: "places-i-ate", name: "Places I ate", hint: "the ones worth going back to" },
  { slug: "reading", name: "Reading", hint: "books, essays, lines to keep" },
  { slug: "people", name: "People", hint: "who you saw, who to call back" },
  { slug: "ideas", name: "Ideas", hint: "projects, half-thoughts, what-ifs" },
  { slug: "outfits", name: "Outfits", hint: "what you wore, what you want" },
  { slug: "quotes", name: "Quotes", hint: "things said that stuck" },
  { slug: "art", name: "Art", hint: "paintings, photos, music that moved you" },
  { slug: "work", name: "Work", hint: "what you're building, what's next" },
  { slug: "places", name: "Places", hint: "where you've been, where you want to go" },
  { slug: "small-wins", name: "Small wins", hint: "first attempts count" },
  { slug: "questions", name: "Questions", hint: "ones that don't need an answer yet" },
] as const;

export const MAX_COLLECTION_NAME = 40;

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
export const RESERVED_SLUGS = new Set(["unsorted", "new"]);

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
export const DOT_COLORS = ["#5ad1a5", "#e0a06a", "#9c8cf0", "#7aa7ff", "#f08cab", "#f2cf5a", "#6fc3df", "#c9a0dc"] as const;

export function dotColor(slug: string | null | undefined): string {
  if (!slug) return "#c8c8d0"; // unsorted
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return DOT_COLORS[h % DOT_COLORS.length];
}
