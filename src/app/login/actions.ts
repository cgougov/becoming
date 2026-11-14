"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeEmail, normalizeOtp, safeNextPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export type LoginState =
  | { status: "idle" }
  | { status: "sent"; email: string; next: string }
  | { status: "error"; message: string; email?: string; next?: string };

/**
 * Email a sign-in code (and a link). The code is the reliable path on a phone: a link only works
 * in the same browser that asked for it, and iOS keeps the Home Screen app, Safari and mail apps
 * apart. Some school mail scanners also open links before you do, which uses them up.
 */
export async function sendCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
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
  return { status: "sent", email, next };
}

export async function verifyCode(prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const token = normalizeOtp(String(formData.get("code") ?? ""));
  const next = safeNextPath(String(formData.get("next") ?? ""));
  if (!email) return { status: "error", message: "Start again with your email." };
  if (!token) return { status: "error", message: "Type the code from the email.", email, next };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { status: "error", message: "That code didn't work. Check the newest email, or send a new one.", email, next };
  redirect(next);
}
