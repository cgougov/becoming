import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccountFooter, HomeView } from "./home-view";

describe("HomeView", () => {
  it("shows the app name and the three starter buckets", () => {
    render(<HomeView />);
    expect(screen.getByRole("heading", { level: 1, name: "Becoming" })).toBeTruthy();
    for (const name of ["Goals", "Taste", "People"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeTruthy();
    }
    expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull();
  });

  it("shows who is signed in and a sign-out button", () => {
    render(<HomeView account={<AccountFooter email="christian@example.com" />} />);
    expect(screen.getByText("christian@example.com")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
  });
});
