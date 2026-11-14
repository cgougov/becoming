import Link from "next/link";
import { PipFace } from "@/components/pip-face";
import { localDay } from "@/lib/entries/time";
import { nudgeLine, pickNudge } from "@/lib/people";
import { peopleWithLast } from "./you/people-data";

/** At most one gentle line from Pip about someone in your close circle who's gone quiet. */
export async function PeopleNudge({ userId, timeZone }: { userId: string; timeZone: string }) {
  const now = new Date();
  const person = pickNudge(await peopleWithLast(userId), now);
  if (!person) return null;
  const day = localDay(now, timeZone);
  const seed = [...day].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <Link href={`/you/person/${person.slug}`} className="flex items-center gap-3 rounded-card bg-chip p-3 pr-4">
      <PipFace mood="calm" day={day} size={32} />
      <span className="text-[14px] font-semibold leading-snug">{nudgeLine(person.name, seed)}</span>
    </Link>
  );
}
