import { Pane } from "@/components/pane";
import { StartForm } from "./start-form";

/** First open. One question from the partner; collections in the user's words. */
export default function StartPage() {
  return (
    <Pane title="What do you want to keep track of?" subtitle="Pick a few, or say it your way. This shapes what you'll see.">
      <StartForm />
    </Pane>
  );
}
