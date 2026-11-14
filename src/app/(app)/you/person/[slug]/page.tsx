import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { PhotoPicker } from "@/components/photo-picker";
import { tagOptions, withTags } from "@/lib/entries/tags";
import { sinceLabel } from "@/lib/people";
import { requireUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ENTRY_FIELDS, EntryList, signedPhotoUrls, type EntryRow } from "../../../capture/entry-list";
import { setPersonPhoto } from "../../actions";
import { Avatar } from "../../avatar";
import { CloseToggle, PersonNote } from "../../person-client";

export default function PersonPage({ params }: PageProps<"/you/person/[slug]">) {
  return (
    <Suspense fallback={<Pane big title="…">{null}</Pane>}>
      <PersonBody params={params} />
    </Suspense>
  );
}

/** A person's page: everything you've kept about them, and a place to remember what to ask. */
async function PersonBody({ params }: Pick<PageProps<"/you/person/[slug]">, "params">) {
  const { slug } = await params;
  const session = await requireUser();
  if (!session) return null;
  const { user, timeZone } = session;
  const supabase = await createClient();

  const { data: person } = await supabase
    .from("people")
    .select("id, slug, name, close, note, photo_path")
    .eq("owner_id", user.id)
    .eq("slug", slug)
    .maybeSingle();
  if (!person) notFound();

  const { data: tagRows } = await supabase.from("entry_tags").select("entry_id").eq("owner_id", user.id).eq("person_id", person.id);
  const ids = (tagRows ?? []).map((t) => t.entry_id as string);
  const [{ data }, options, urls] = await Promise.all([
    ids.length
      ? supabase.from("entries").select(ENTRY_FIELDS).in("id", ids).order("captured_at", { ascending: false }).limit(200)
      : Promise.resolve({ data: [] }),
    tagOptions(user.id),
    signedPhotoUrls(person.photo_path ? [person.photo_path as string] : []),
  ]);
  const entries = await withTags(user.id, (data ?? []) as Omit<EntryRow, "tags">[]);
  const last = entries[0] ? new Date(entries[0].captured_at) : null;

  return (
    <Pane big title={person.name as string} subtitle={`last kept: ${sinceLabel(last, new Date())} · ${entries.length} ${entries.length === 1 ? "thing" : "things"}`}>
      <div className="-mt-4 flex items-center justify-between text-sm text-muted">
        <Link href="/you" className="underline-offset-2 hover:underline">
          ← yours
        </Link>
        <PhotoPicker userId={user.id} onPath={setPersonPhoto.bind(null, person.id as string)} label="add a photo" className="font-semibold" />
      </div>
      <div className="flex items-center gap-4">
        <Avatar name={person.name as string} slug={person.slug as string} url={person.photo_path ? urls.get(person.photo_path as string) : undefined} size={72} close={!!person.close} />
        <CloseToggle id={person.id as string} close={!!person.close} />
      </div>
      <PersonNote id={person.id as string} note={(person.note as string | null) ?? ""} />
      <section className="flex flex-col gap-1" aria-label={`Things about ${person.name}`}>
        <h2 className="text-[13px] font-bold text-muted">from your days</h2>
        <EntryList entries={entries} timeZone={timeZone} options={options} showDate empty="nothing kept about them yet." />
      </section>
    </Pane>
  );
}
