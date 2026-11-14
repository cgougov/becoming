import Link from "next/link";
import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { sinceLabel } from "@/lib/people";
import { requireUser } from "@/lib/session";
import { signedPhotoUrls } from "../../capture/entry-list";
import { Avatar } from "../avatar";
import { peopleWithLast } from "../people-data";

export default function EveryonePage() {
  return (
    <Pane big title="your people" subtitle="everyone you've kept something about.">
      <Suspense fallback={<p className="text-sm text-muted">loading…</p>}>
        <Everyone />
      </Suspense>
    </Pane>
  );
}

async function Everyone() {
  const session = await requireUser();
  if (!session) return null;
  const people = await peopleWithLast(session.user.id);
  const urls = await signedPhotoUrls(people.map((p) => p.photo_path).filter((x): x is string => !!x));
  const now = new Date();
  return (
    <>
      <Link href="/you" className="-mt-4 text-sm text-muted underline-offset-2 hover:underline">
        ← yours
      </Link>
      {people.length === 0 ? (
        <p className="text-[14px] text-muted">mention someone in what you keep and they&apos;ll appear here.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-foreground/[0.07]">
          {people.map((p) => (
            <li key={p.id}>
              <Link href={`/you/person/${p.slug}`} className="flex items-center gap-3 py-3">
                <Avatar name={p.name} slug={p.slug} url={p.photo_path ? urls.get(p.photo_path) : undefined} size={44} close={p.close} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[16px] font-semibold">{p.name}</span>
                  <span className="text-[12px] text-muted">
                    {p.count} {p.count === 1 ? "thing" : "things"} · last {sinceLabel(p.last, now)}
                  </span>
                </span>
                {p.close && <span className="text-[12px] font-bold text-accent">♡</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
