"use server";

import { redirect } from "next/navigation";
import { buildInitialCollections } from "@/lib/collections";
import { createClient } from "@/lib/supabase/server";

export async function completeSetup(formData: FormData): Promise<void> {
  const chosen = formData.getAll("suggested").map(String);
  const custom = formData.getAll("custom").map(String);
  const rows = buildInitialCollections(chosen, custom);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (rows.length > 0) {
    const { error } = await supabase
      .from("collections")
      .upsert(rows.map((r) => ({ ...r, owner_id: user.id })), { onConflict: "owner_id,slug", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }
  const { error } = await supabase.from("profiles").update({ setup_completed_at: new Date().toISOString() }).eq("id", user.id);
  if (error) throw new Error(error.message);

  redirect("/");
}
