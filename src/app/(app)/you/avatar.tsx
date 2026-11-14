import { gradientFor } from "@/lib/gradients";

/** A person's circle: their photo if you added one, otherwise a soft gradient and an initial. */
export function Avatar({ name, slug, url, size = 56, close = false }: { name: string; slug: string; url?: string; size?: number; close?: boolean }) {
  return (
    <span
      className={`relative flex flex-none items-center justify-center overflow-hidden rounded-full font-bold text-white ${close ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}
      style={{ width: size, height: size, background: url ? undefined : gradientFor(slug), fontSize: size * 0.38 }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
}
