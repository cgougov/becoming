import { connection } from "next/server";
import { Suspense } from "react";
import { localDay } from "@/lib/entries/time";
import { StartForm } from "./start-form";

/** First open: Pip says hi, asks who you want to become, and gets you to your first keep. */
export default function StartPage() {
  return (
    <Suspense>
      <Start />
    </Suspense>
  );
}

async function Start() {
  await connection();
  return <StartForm pipDay={localDay(new Date(), "America/New_York")} />;
}
