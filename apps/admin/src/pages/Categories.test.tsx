import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Categories } from "./Categories";

describe("Categories Component", () => {
  it("renders category hierarchy correctly", () => {
    render(<Categories />);
    expect(screen.getByText("Category Management")).toBeInTheDocument();
    expect(screen.getByText("Menswear")).toBeInTheDocument();
    expect(screen.getByText("Womenswear")).toBeInTheDocument();
  });

  it("opens add category modal when clicking Add Root Category", () => {
    render(<Categories />);
    const addButton = screen.getByText("Add Root Category");
    fireEvent.click(addButton);
    expect(screen.getByText("Add New Category")).toBeInTheDocument();
  });
});
