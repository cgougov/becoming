import { describe, expect, it } from "vitest";
import { adjacentPane, classifySwipe, paneIndexForPath } from "./panes";

describe("paneIndexForPath", () => {
  it("maps paths to panes, including nested collection pages", () => {
    expect(paneIndexForPath("/")).toBe(0);
    expect(paneIndexForPath("/you")).toBe(1);
    expect(paneIndexForPath("/you/goals")).toBe(1);
    expect(paneIndexForPath("/reflect")).toBe(2);
    expect(paneIndexForPath("/login")).toBe(-1);
  });
});

describe("adjacentPane", () => {
  it("swipe left moves right, and stops at the ends", () => {
    expect(adjacentPane("/", "left")).toBe("/you");
    expect(adjacentPane("/you", "left")).toBe("/reflect");
    expect(adjacentPane("/reflect", "left")).toBeNull();
    expect(adjacentPane("/", "right")).toBeNull();
    expect(adjacentPane("/you/taste", "right")).toBe("/");
  });
});

describe("classifySwipe", () => {
  it("accepts a clear horizontal swipe away from the edges", () => {
    expect(classifySwipe(-120, 10, 200, 390)).toBe("left");
    expect(classifySwipe(120, -20, 200, 390)).toBe("right");
  });

  it("ignores edge swipes (iOS back gesture), short moves, and diagonal scrolls", () => {
    expect(classifySwipe(-120, 0, 10, 390)).toBeNull();
    expect(classifySwipe(-120, 0, 385, 390)).toBeNull();
    expect(classifySwipe(-40, 0, 200, 390)).toBeNull();
    expect(classifySwipe(-100, 80, 200, 390)).toBeNull();
  });
});
