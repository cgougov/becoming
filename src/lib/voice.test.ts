import { describe, expect, it } from "vitest";
import { ALL_COMPANION_LINES } from "./companion";
import { MOMENT_ASKS, MOMENT_ENCOURAGEMENT, MOMENT_KEPT } from "./moment";

/** docs/VOICE.md, as a test: every line Pip can say must pass. */
const LINES = [...ALL_COMPANION_LINES, ...MOMENT_ASKS, ...MOMENT_ENCOURAGEMENT, ...MOMENT_KEPT];

const BANNED: [string, RegExp][] = [
  ["em/en dash", /[\u2013\u2014]/],
  ["journey", /\bjourney\b/i],
  ["you've got this", /you'?ve got this/i],
  ["remember to", /\bremember to\b/i],
  ["self-care", /self-?care/i],
  ["growth mindset", /growth mindset/i],
  ["not X, Y contrast", /\b(it'?s|this is|that'?s) not\b.*[,;.]\s*(it'?s|this is|that'?s)\b/i],
  ["therapy-speak", /it sounds like you'?re|\bvalidat|\bboundar/i],
];

describe("Pip's voice", () => {
  it("has lines to say", () => {
    expect(LINES.length).toBeGreaterThan(30);
  });

  it.each(LINES)("%s", (line) => {
    for (const [name, re] of BANNED) expect(re.test(line), `${name}: "${line}"`).toBe(false);
    expect(line.length, "short").toBeLessThanOrEqual(48);
    expect((line.match(/\?/g) ?? []).length, "one question at most").toBeLessThanOrEqual(1);
    // emoji other than ♡ (pictographs and the sparkle we used to use)
    expect(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(line.replace(/♡/g, "")), `emoji: "${line}"`).toBe(false);
  });
});
