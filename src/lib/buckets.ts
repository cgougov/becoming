/**
 * Starter buckets. Every capture is auto-sorted into one of these (M3).
 * Users will be able to rename them and add their own; these are the defaults.
 */
export type BucketSlug = "goals" | "taste" | "people";

export interface Bucket {
  slug: BucketSlug;
  name: string;
  description: string;
  examples: string[];
}

export const STARTER_BUCKETS: readonly Bucket[] = [
  {
    slug: "goals",
    name: "Goals",
    description: "What you're working toward and how it's going.",
    examples: ["gym", "work", "projects", "habits"],
  },
  {
    slug: "taste",
    name: "Taste",
    description: "Culture and art that moves you.",
    examples: ["movies", "art", "photos", "outfits", "quotes", "restaurants"],
  },
  {
    slug: "people",
    name: "People",
    description: "The people in your life and how you stay close to them.",
    examples: ["who you saw", "who to reach out to", "how to show up for someone"],
  },
] as const;

export function getBucket(slug: string): Bucket | undefined {
  return STARTER_BUCKETS.find((b) => b.slug === slug);
}
