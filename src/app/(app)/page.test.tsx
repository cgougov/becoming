import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeView } from "./home-view";

describe("HomeView (capture pane)", () => {
  it("renders the app name and a sign-in hint when there is no session", () => {
    render(<HomeView />);
    expect(screen.getByRole("heading", { level: 1, name: "Becoming" })).toBeTruthy();
    expect(screen.getByText(/sign in to start capturing/i)).toBeTruthy();
  });

  it("renders the slots it is given", () => {
    render(<HomeView capture={<div>capture box</div>} today={<div>today list</div>} />);
    expect(screen.getByText("capture box")).toBeTruthy();
    expect(screen.getByText("today list")).toBeTruthy();
  });
});
