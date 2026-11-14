"use client";

/**
 * Shrink a photo in the browser before upload: longest side ≤ 1600px, JPEG q0.82.
 * Keeps storage small and uploads fast on cellular. Two decoders, because each browser
 * fails differently: createImageBitmap first, then an <img> (Safari decodes HEIC there).
 * If neither works, returns the original and the caller decides whether it can go up as is.
 */
async function decode(file: File): Promise<{ draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; width: number; height: number; close: () => void } | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const b = await createImageBitmap(file);
      return { width: b.width, height: b.height, draw: (ctx, w, h) => ctx.drawImage(b, 0, 0, w, h), close: () => b.close() };
    } catch {
      // fall through to <img>
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { width: img.naturalWidth, height: img.naturalHeight, draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h), close: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    return null;
  }
}

export async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<File> {
  const src = await decode(file);
  if (!src || !src.width || !src.height) return file;
  try {
    const scale = Math.min(1, maxSide / Math.max(src.width, src.height));
    const w = Math.max(1, Math.round(src.width * scale));
    const h = Math.max(1, Math.round(src.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    src.draw(ctx, w, h);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;
    return new File([blob], (file.name || "photo").replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } finally {
    src.close();
  }
}
