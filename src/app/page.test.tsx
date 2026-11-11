import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("shows the app name and the three starter buckets", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "Becoming" })).toBeTruthy();
    for (const name of ["Goals", "Taste", "People"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeTruthy();
    }
  });
});
