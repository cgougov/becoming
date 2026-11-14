/**
 * Pip's face (decided 2026-11-14, round 7 on the design canvas).
 * - Four face families rotate day to day so Pip stays interesting: mochi, bean, smiley, kitty.
 * - Moods switch between set faces with a bounce; they never morph.
 * - A hard day always uses Bean's soft face (Christian's favorite).
 * - The body color follows the mood, Inside Out style.
 * Pure data + pure functions, so it is testable and renderable anywhere (React, canvas, push).
 */

export type PipMood = "calm" | "happy" | "sleepy" | "soft";
export type FaceFamily = "mochi" | "bean" | "smiley" | "kitty";
export const FAMILIES: readonly FaceFamily[] = ["mochi", "bean", "smiley", "kitty"];

/** A face is a list of shapes on a 140×140 viewBox. Strokes and fills use the ink color. */
export type Shape =
  | { kind: "path"; d: string; stroke?: number; fill?: boolean }
  | { kind: "circle"; cx: number; cy: number; r: number; ring?: number }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number };

const P = (d: string, stroke = 4): Shape => ({ kind: "path", d, stroke });
const F = (d: string): Shape => ({ kind: "path", d, fill: true });
const C = (cx: number, cy: number, r: number): Shape => ({ kind: "circle", cx, cy, r });
const E = (cx: number, cy: number, rx: number, ry: number): Shape => ({ kind: "ellipse", cx, cy, rx, ry });

const BEAN_SOFT: Shape[] = [E(50, 74, 4, 5.6), E(90, 74, 4, 5.6), P("M66 90h8", 3)];

export const FACES: Record<FaceFamily, Record<PipMood, Shape[]>> = {
  mochi: {
    calm: [C(54, 72, 5.5), C(86, 72, 5.5), P("M63 85q3.5 4 7 0q3.5 4 7 0", 3.5)],
    happy: [P("M47 75q7-9 14 0"), P("M79 75q7-9 14 0"), F("M61 83q9 12 18 0z")],
    sleepy: [P("M48 74h12"), P("M80 74h12"), { kind: "circle", cx: 70, cy: 88, r: 3.2, ring: 3 }],
    soft: BEAN_SOFT,
  },
  bean: {
    calm: [E(50, 71, 4.6, 6.6), E(90, 71, 4.6, 6.6), P("M64 87q6 4 12 0", 3.5)],
    happy: [P("M43 74q7-9 14 0"), P("M83 74q7-9 14 0"), P("M64 86q6 5 12 0", 3.5)],
    sleepy: [P("M44 73h12"), P("M84 73h12"), P("M66 89h8", 3)],
    soft: BEAN_SOFT,
  },
  smiley: {
    calm: [P("M46 74q8-9 16 0"), P("M78 74q8-9 16 0"), P("M64 87q6 4 12 0", 3.5)],
    happy: [P("M46 74q8-9 16 0"), P("M78 74q8-9 16 0"), F("M60 83q10 13 20 0z")],
    sleepy: [P("M47 73q7-4 14 0"), P("M79 73q7-4 14 0"), P("M66 89h8", 3)],
    soft: BEAN_SOFT,
  },
  kitty: {
    calm: [P("M46 71q8 7 16 0"), P("M78 71q8 7 16 0"), P("M62 84q4 5 8 0q4 5 8 0", 3.5)],
    happy: [P("M46 75q8-10 16 0"), P("M78 75q8-10 16 0"), P("M60 83q5 7 10 0q5 7 10 0")],
    sleepy: [P("M47 73h14"), P("M79 73h14"), P("M64 86q3 4 6 0q3 4 6 0", 3)],
    soft: BEAN_SOFT,
  },
};

/** Inside Out: the body color is the mood. */
export const MOOD_COLORS: Record<PipMood, string> = {
  calm: "#ff8a5b", // warm coral
  happy: "#ffcf4d", // joy yellow
  sleepy: "#b9a6ff", // dusk lilac
  soft: "#7fb0ff", // gentle blue
};

/** Which family Pip wears today: stable within a day, changes day to day. */
export function familyForDay(day: string): FaceFamily {
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) >>> 0;
  return FAMILIES[h % FAMILIES.length];
}

export function faceFor(mood: PipMood, day: string): Shape[] {
  return FACES[familyForDay(day)][mood];
}

/** Resting mood from the clock and your rhythm. Never sad at you. */
export function restingMood(localHour: number, cameBackAfterAWhile: boolean): PipMood {
  if (localHour >= 0 && localHour < 5) return "sleepy";
  if (cameBackAfterAWhile) return "happy";
  return "calm";
}
