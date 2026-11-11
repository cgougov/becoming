"use server";

import { headers } from "next/headers";
import { normalizeEmail, safeNextPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { status: "idle" } | { status: "sent"; email: string } | { status: "error"; message: string };

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!email) return { status: "error", message: "That doesn't look like an email address." };

  const next = safeNextPath(String(formData.get("next") ?? ""));
  const h = await headers();
  const origin = h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });

  if (error) return { status: "error", message: error.message };
  return { status: "sent", email };
}
