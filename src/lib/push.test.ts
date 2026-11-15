import { describe, expect, it } from "vitest";
import { EVENING_AT, MORNING_AT, dueNotifications, localMinutes, pushMessage, type DueInput } from "./push";

const base = (o: Partial<DueInput> = {}): DueInput => ({
  localMinutes: 12 * 60,
  now: new Date("2026-11-15T17:00:00Z"),
  sent: new Set(),
  morningDone: false,
  eveningDone: false,
  moment: null,
  ...o,
});

describe("dueNotifications", () => {
  it("sends the morning nudge at 8:30, once, only if not checked", () => {
    expect(dueNotifications(base({ localMinutes: MORNING_AT + 2 }))).toEqual(["morning"]);
    expect(dueNotifications(base({ localMinutes: MORNING_AT + 2, morningDone: true }))).toEqual([]);
    expect(dueNotifications(base({ localMinutes: MORNING_AT + 2, sent: new Set(["morning"]) }))).toEqual([]);
    expect(dueNotifications(base({ localMinutes: MORNING_AT - 5 }))).toEqual([]);
    expect(dueNotifications(base({ localMinutes: MORNING_AT + 60 }))).toEqual([]);
  });
  it("sends the wind-down at 10pm", () => {
    expect(dueNotifications(base({ localMinutes: EVENING_AT }))).toEqual(["evening"]);
    expect(dueNotifications(base({ localMinutes: EVENING_AT, eveningDone: true }))).toEqual([]);
  });
  it("sends the moment when it arrives, never late", () => {
    const now = new Date("2026-11-15T17:00:00Z");
    const at = (minAgo: number) => ({ at: new Date(now.getTime() - minAgo * 60_000), status: "scheduled" as const });
    expect(dueNotifications(base({ now, moment: at(2) }))).toEqual(["moment"]);
    expect(dueNotifications(base({ now, moment: at(-10) }))).toEqual([]);
    expect(dueNotifications(base({ now, moment: at(40) }))).toEqual([]);
    expect(dueNotifications(base({ now, moment: { ...at(2), status: "kept" } }))).toEqual([]);
    expect(dueNotifications(base({ now, moment: at(2), sent: new Set(["moment"]) }))).toEqual([]);
  });
});

describe("push helpers", () => {
  it("reads local minutes", () => {
    expect(localMinutes(new Date("2026-11-15T13:30:00Z"), "America/New_York")).toBe(8 * 60 + 30);
  });
  it("speaks as Pip", () => {
    const m = pushMessage("moment", 3);
    expect(m.title).toBe("Pip");
    expect(m.body.length).toBeGreaterThan(0);
    expect(m.url).toBe("/");
  });
});

describe("morning carries last night's note", () => {
  it("says it back, politely", () => {
    expect(pushMessage("morning", 1, "less phone").body).toBe("good morning. from last night: less phone");
  });
});
