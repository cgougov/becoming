import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/collections";
import { PARTNER_SYSTEM } from "./character";
import { getPartnerClient } from "./client";
import {
  FILING_SCHEMA,
  buildFilingPrompt,
  cleanFilingResult,
  confidentAssignments,
  type FilingCollection,
  type FilingEntry,
} from "./filing";

export interface FilingSummary {
  considered: number;
  filed: number;
  proposed: string | null;
  skipped: "unconfigured" | "nothing" | null;
}

/**
 * File one user's unfiled entries. Works with either a user-session client (RLS) or the
 * service-role client (nightly cron). Applies confident assignments; creates at most one
 * partner-proposed collection and files its entries into it.
 */
export async function runFilingFor(supabase: SupabaseClient, ownerId: string, opts: { limit?: number } = {}): Promise<FilingSummary> {
  const partner = getPartnerClient();
  if (!partner) return { considered: 0, filed: 0, proposed: null, skipped: "unconfigured" };

  const [{ data: rows }, { data: cols }] = await Promise.all([
    supabase
      .from("entries")
      .select("id, body, photo_path")
      .eq("owner_id", ownerId)
      .is("collection_id", null)
      .order("captured_at", { ascending: false })
      .limit(opts.limit ?? 40),
    supabase.from("collections").select("id, slug, name, description").eq("owner_id", ownerId).order("position"),
  ]);
  const entries: FilingEntry[] = (rows ?? []).map((r) => ({ id: r.id as string, body: (r.body as string | null) ?? null, has_photo: !!r.photo_path }));
  const collections: FilingCollection[] = (cols ?? []).map((c) => ({ slug: c.slug as string, name: c.name as string, description: (c.description as string | null) ?? null }));
  if (entries.length === 0) return { considered: 0, filed: 0, proposed: null, skipped: "nothing" };

  const response = await partner.client.messages.create({
    model: partner.model,
    max_tokens: 2048,
    system: PARTNER_SYSTEM,
    messages: [{ role: "user", content: buildFilingPrompt(entries, collections) }],
    output_config: { format: { type: "json_schema", schema: FILING_SCHEMA } },
  });
  const text = response.content.find((b) => b.type === "text");
  let raw: unknown = null;
  try {
    raw = text && text.type === "text" ? JSON.parse(text.text) : null;
  } catch {
    raw = null;
  }
  const result = cleanFilingResult(raw, entries, collections);

  const idBySlug = new Map((cols ?? []).map((c) => [c.slug as string, c.id as string]));
  let filed = 0;
  for (const a of confidentAssignments(result)) {
    const collectionId = idBySlug.get(a.collection_slug as string);
    if (!collectionId) continue;
    const { error } = await supabase.from("entries").update({ collection_id: collectionId, sorted_by: "ai" }).eq("id", a.entry_id).eq("owner_id", ownerId);
    if (!error) filed++;
  }

  let proposed: string | null = null;
  const proposal = result.proposals[0];
  if (proposal) {
    const slug = slugify(proposal.name);
    if (slug && !idBySlug.has(slug)) {
      const { data: created } = await supabase
        .from("collections")
        .insert({ owner_id: ownerId, slug, name: proposal.name, description: proposal.hint || null, origin: "partner", position: collections.length })
        .select("id")
        .maybeSingle();
      if (created) {
        proposed = proposal.name;
        const { error } = await supabase
          .from("entries")
          .update({ collection_id: created.id, sorted_by: "ai" })
          .in("id", proposal.entry_ids)
          .eq("owner_id", ownerId)
          .is("collection_id", null);
        if (!error) filed += proposal.entry_ids.length;
      }
    }
  }

  return { considered: entries.length, filed, proposed, skipped: null };
}
