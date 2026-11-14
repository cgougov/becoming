import Link from "next/link";
import { sinceLabel } from "@/lib/people";
import { signedPhotoUrls } from "../capture/entry-list";
import { Avatar } from "./avatar";
import { peopleWithLast } from "./people-data";

/** Your people: close circle first (ringed), then whoever you've kept about most recently. */
export async function PeopleRow({ userId }: { userId: string }) {
  const people = await peopleWithLast(userId);
  const now = new Date();
  const shown = people.slice(0, 8);
  const urls = await signedPhotoUrls(shown.map((p) => p.photo_path).filter((x): x is string => !!x));

  return (
    <section className="flex flex-col gap-3" aria-label="Your people">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[13px] font-bold text-muted">your people</h2>
        {people.length > 0 && (
          <Link href="/you/everyone" className="text-[13px] font-semibold text-muted">
            everyone →
          </Link>
        )}
      </div>
      {shown.length === 0 ? (
        <p className="text-[14px] text-muted">mention someone in what you keep and they&apos;ll appear here.</p>
      ) : (
        <ul className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-1 [scrollbar-width:none]">
          {shown.map((p) => (
            <li key={p.id} className="flex-none">
              <Link href={`/you/person/${p.slug}`} className="flex w-16 flex-col items-center gap-1.5">
                <Avatar name={p.name} slug={p.slug} url={p.photo_path ? urls.get(p.photo_path) : undefined} close={p.close} />
                <span className="w-full truncate text-center text-[13px] font-semibold">{p.name}</span>
                <span className="-mt-1 text-[11px] text-muted">{sinceLabel(p.last, now)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
