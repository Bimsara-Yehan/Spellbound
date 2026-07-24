import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the storefront heading", () => {
    render(<HomePage />);
    expect(screen.getByText("Spellbound storefront")).toBeInTheDocument();
  });
});
