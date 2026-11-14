/** The shimmer shows only for a short while after keeping, while the partner reads. */
export const READING_WINDOW_MS = 2 * 60_000;

export function isReading(taggedAt: string | null, capturedAt: string, now: Date): boolean {
  return !taggedAt && now.getTime() - new Date(capturedAt).getTime() < READING_WINDOW_MS;
}
