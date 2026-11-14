import Anthropic from "@anthropic-ai/sdk";

/**
 * The one place that knows which model we talk to (PRODUCT.md: "the partner's intelligence is
 * swappable"). Server-side only. Returns null when unconfigured so callers can degrade.
 */
export function getPartnerClient(): { client: Anthropic; model: string } | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return { client: new Anthropic({ apiKey }), model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5" };
}
