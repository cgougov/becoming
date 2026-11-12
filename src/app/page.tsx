import { Suspense } from "react";
import { getUser } from "@/lib/supabase/server";
import { AccountFooter, HomeView } from "./home-view";

export default function Home() {
  return (
    <HomeView
      account={
        <Suspense>
          <Account />
        </Suspense>
      }
    />
  );
}

async function Account() {
  const user = await getUser();
  return <AccountFooter email={user?.email} />;
}
