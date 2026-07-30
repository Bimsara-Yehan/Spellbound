import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the sign in screen when unauthenticated", () => {
    render(<App />);
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
  });
});
