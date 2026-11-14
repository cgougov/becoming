"use server";

/** Photo failures happen on the phone; this puts the details in the Vercel logs (no image, no content). */
export async function reportPhotoError(d: { stage: string; type: string; name: string; size: number; after: number; message: string }): Promise<void> {
  console.error("[photo]", JSON.stringify({ ...d, message: d.message.slice(0, 200) }));
}
