import { Suspense } from "react";
import { BottomBar } from "@/components/bottom-bar";
import { Companion } from "@/components/companion";
import { SwipePanes } from "@/components/swipe-panes";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* usePathname() in the bar/swipe reads URL data, which Cache Components wants inside Suspense. */}
      <Suspense fallback={<div className="flex min-h-full flex-1 flex-col">{children}</div>}>
        <SwipePanes>{children}</SwipePanes>
      </Suspense>
      <Companion />
      <Suspense>
        <BottomBar />
      </Suspense>
    </>
  );
}
