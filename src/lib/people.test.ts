import { describe, expect, it } from "vitest";
import { TONES, gradientFor, toneFor } from "./gradients";
import { dotColor } from "./collections";
import { nudgeLine, pickNudge, sinceLabel } from "./people";

const now = new Date("2026-11-14T18:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

describe("sinceLabel", () => {
  it("reads like a person would say it", () => {
    expect(sinceLabel(null, now)).toBe("not yet");
    expect(sinceLabel(daysAgo(0), now)).toBe("today");
    expect(sinceLabel(daysAgo(1), now)).toBe("yesterday");
    expect(sinceLabel(daysAgo(5), now)).toBe("5 days");
    expect(sinceLabel(daysAgo(9), now)).toBe("a week");
    expect(sinceLabel(daysAgo(21), now)).toBe("3 weeks");
    expect(sinceLabel(daysAgo(95), now)).toBe("3 months");
  });
});

describe("pickNudge", () => {
  const p = (name: string, close: boolean, d: number | null) => ({ id: name, slug: name, name, close, last: d === null ? null : daysAgo(d) });
  it("only nudges about the close circle, quiet the longest, at most one", () => {
    expect(pickNudge([p("Sam", false, 30), p("Maya", true, 3)], now)).toBeNull();
    expect(pickNudge([p("Sam", true, 8), p("Maya", true, 20), p("Jo", false, 90)], now)?.name).toBe("Maya");
    expect(pickNudge([p("Mom", true, null)], now)?.name).toBe("Mom");
  });
});

describe("nudgeLine and gradients", () => {
  it("fills the name and stays stable", () => {
    expect(nudgeLine("Maya", 0)).toBe("it's been a while since Maya. maybe say hi?");
    expect(gradientFor("lifts")).toBe(gradientFor("lifts"));
    expect(TONES).toContain(toneFor("x"));
    // a tile and its dot always match
    expect(gradientFor("lifts")).toContain(dotColor("lifts"));
  });
});

describe("collection tones", () => {
  it("gives neighbors different tones, in order, and wraps", async () => {
    const { collectionTones, toneAt, TONES } = await import("./gradients");
    const m = collectionTones([{ id: "a" }, { id: "b" }, { id: "c" }]);
    expect(m.get("a")).toBe(TONES[0]);
    expect(m.get("b")).not.toBe(m.get("a"));
    expect(new Set(TONES.map((_, i) => toneAt(i))).size).toBe(TONES.length);
    expect(toneAt(TONES.length)).toBe(TONES[0]);
  });
});

describe("reach out", () => {
  it("normalizes numbers and builds one-tap links", async () => {
    const { normalizePhone, reachLinks } = await import("./people");
    expect(normalizePhone("(609) 555-0142")).toBe("6095550142");
    expect(normalizePhone("+1 609 555 0142")).toBe("+16095550142");
    expect(normalizePhone("hi")).toBeNull();
    expect(reachLinks("+16095550142")).toEqual({ text: "sms:+16095550142", call: "tel:+16095550142", facetime: "facetime:+16095550142" });
  });
});
