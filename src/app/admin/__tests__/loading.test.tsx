import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminLoading from "../loading";

describe("AdminLoading", () => {
  it("renders the Admin Console heading", () => {
    render(<AdminLoading />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Admin Console");
  });

  it("renders skeleton placeholder elements", () => {
    render(<AdminLoading />);

    const skeletons = document.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
