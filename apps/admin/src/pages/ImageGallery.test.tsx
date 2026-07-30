import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageGallery } from "./ImageGallery";

describe("ImageGallery Component", () => {
  it("renders image upload dropzone and gallery grid", () => {
    render(<ImageGallery />);
    expect(screen.getByText("Image Upload & Gallery")).toBeInTheDocument();
    expect(screen.getByText("Drag & drop product images here, or click to upload")).toBeInTheDocument();
    expect(screen.getByText("shirt-front.jpg")).toBeInTheDocument();
  });

  it("allows filtering images by product", () => {
    render(<ImageGallery />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Leather Monk Strap Shoes" } });
    expect(screen.getByText("sneakers-red.jpg")).toBeInTheDocument();
    expect(screen.queryByText("shirt-front.jpg")).not.toBeInTheDocument();
  });
});
