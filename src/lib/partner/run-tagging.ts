import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/collections";
import { PARTNER_SYSTEM } from "./character";
import { getPartnerClient } from "./client";
import { TAGGING_SCHEMA, buildTaggingPrompt, cleanTaggingResult, displayPersonName, type Tone } from "./tagging";

export interface TagOutcome {
  tone: Tone | null;
  tagged: boolean;
}

/** Find people by name for this owner, creating any that don't exist yet. Returns ids in order. */
export async function ensurePeople(supabase: SupabaseClient, ownerId: string, names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const raw of names) {
    const name = displayPersonName(raw.trim());
    const slug = slugify(name);
    if (!slug) continue;
    const { data: found } = await supabase.from("people").select("id").eq("owner_id", ownerId).eq("slug", slug).maybeSingle();
    if (found) {
      ids.push(found.id as string);
      continue;
    }
    const { data: created } = await supabase.from("people").insert({ owner_id: ownerId, slug, name }).select("id").maybeSingle();
    if (created) ids.push(created.id as string);
  }
  return ids;
}

/**
 * Read one entry and tag it. Works with a user-session client (RLS) or the service role
 * (backlog cron). Only adds AI tags; never touches tags the person set themselves.
 */
export async function tagEntryWith(supabase: SupabaseClient, ownerId: string, entryId: string): Promise<TagOutcome> {
  const { data: entry } = await supabase.from("entries").select("id, body, tagged_at").eq("id", entryId).eq("owner_id", ownerId).maybeSingle();
  if (!entry) return { tone: null, tagged: false };
  const body = (entry.body as string | null)?.trim();
  const partner = getPartnerClient();

  if (!body || !partner) {
    await supabase.from("entries").update({ tagged_at: new Date().toISOString() }).eq("id", entryId).eq("owner_id", ownerId);
    return { tone: null, tagged: false };
  }

  const [{ data: cols }, { data: people }] = await Promise.all([
    supabase.from("collections").select("id, slug, name, description").eq("owner_id", ownerId).order("position"),
    supabase.from("people").select("name").eq("owner_id", ownerId).limit(200),
  ]);
  const collections = (cols ?? []).map((c) => ({ slug: c.slug as string, name: c.name as string, description: (c.description as string | null) ?? null }));
  const knownPeople = (people ?? []).map((p) => p.name as string);

  const response = await partner.client.messages.create({
    model: partner.model,
    max_tokens: 400,
    system: PARTNER_SYSTEM,
    messages: [{ role: "user", content: buildTaggingPrompt(body, collections, knownPeople) }],
    output_config: { format: { type: "json_schema", schema: TAGGING_SCHEMA } },
  });
  const text = response.content.find((b) => b.type === "text");
  let raw: unknown = null;
  try {
    raw = text && text.type === "text" ? JSON.parse(text.text) : null;
  } catch {
    raw = null;
  }
  const result = cleanTaggingResult(raw, collections, knownPeople);

  const idBySlug = new Map((cols ?? []).map((c) => [c.slug as string, c.id as string]));
  const rows: Record<string, unknown>[] = result.collections.map((slug) => ({
    owner_id: ownerId,
    entry_id: entryId,
    kind: "collection",
    collection_id: idBySlug.get(slug),
    source: "ai",
  }));
  for (const personId of await ensurePeople(supabase, ownerId, result.people)) {
    rows.push({ owner_id: ownerId, entry_id: entryId, kind: "person", person_id: personId, source: "ai" });
  }
  if (rows.length) {
    // The unique index is on an expression, which upsert can't target: filter duplicates first.
    const { data: existing } = await supabase.from("entry_tags").select("collection_id, person_id").eq("entry_id", entryId);
    const have = new Set((existing ?? []).map((t) => (t.collection_id ?? t.person_id) as string));
    const fresh = rows.filter((r) => !have.has((r.collection_id ?? r.person_id) as string));
    if (fresh.length) await supabase.from("entry_tags").insert(fresh);
  }

  await supabase.from("entries").update({ tagged_at: new Date().toISOString(), tone: result.tone }).eq("id", entryId).eq("owner_id", ownerId);
  return { tone: result.tone, tagged: true };
}
