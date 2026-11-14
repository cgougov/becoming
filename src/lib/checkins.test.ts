import { describe, expect, it } from "vitest";
import { checkDay, checkWindow, goodThingPrompt, pipMoodFor, sliderLine } from "./checkins";

describe("checkWindow", () => {
  it("morning 5–11, wind-down 22–4, otherwise nothing", () => {
    expect(checkWindow(5)).toBe("morning");
    expect(checkWindow(10)).toBe("morning");
    expect(checkWindow(11)).toBeNull();
    expect(checkWindow(21)).toBeNull();
    expect(checkWindow(22)).toBe("evening");
    expect(checkWindow(1)).toBe("evening");
    expect(checkWindow(4)).toBeNull();
  });
});

describe("checkDay", () => {
  it("files an after-midnight wind-down under the day that just ended", () => {
    expect(checkDay("evening", "2026-11-15", 1)).toBe("2026-11-14");
    expect(checkDay("evening", "2026-11-14", 23)).toBe("2026-11-14");
    expect(checkDay("morning", "2026-11-15", 7)).toBe("2026-11-15");
    expect(checkDay("evening", "2026-03-01", 0)).toBe("2026-02-28");
  });
});

describe("Pip mirrors the sliders with set faces", () => {
  it("maps to soft, sleepy, happy, calm", () => {
    expect(pipMoodFor(10, 90)).toBe("soft");
    expect(pipMoodFor(50, 10)).toBe("sleepy");
    expect(pipMoodFor(90, 80)).toBe("happy");
    expect(pipMoodFor(50, 50)).toBe("calm");
    expect(sliderLine(10, 50)).toBe("oh no. I'm sorry.");
  });

  it("asks gently on a heavy evening", () => {
    expect(goodThingPrompt("evening", 10).ask).toBe("even a tiny good thing?");
    expect(goodThingPrompt("evening", 70).ask).toBe("one good thing from today?");
    expect(goodThingPrompt("morning", 10).ask).toBe("one thing for today?");
  });
});
