import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Products } from "./Products";

describe("Products Component", () => {
  it("renders product list correctly", () => {
    render(<Products />);
    expect(screen.getByText("Products & Catalogue")).toBeInTheDocument();
    expect(screen.getByText("Cotton Oxford Shirt - White")).toBeInTheDocument();
  });

  it("opens create product modal when clicking Create New Product button", () => {
    render(<Products />);
    const createBtn = screen.getByRole("button", { name: /create new product/i });
    fireEvent.click(createBtn);
    expect(screen.getByText("Screen #5 · Basic information, pricing, SKU and catalogue status")).toBeInTheDocument();
  });

  it("filters product list by search query", () => {
    render(<Products />);
    const searchInput = screen.getByPlaceholderText("Search by title, SKU, slug...");
    fireEvent.change(searchInput, { target: { value: "Cotton Oxford" } });
    expect(screen.getByText("Cotton Oxford Shirt - White")).toBeInTheDocument();
    expect(screen.queryByText("Slim Fit Chinos - Navy")).not.toBeInTheDocument();
  });
});
