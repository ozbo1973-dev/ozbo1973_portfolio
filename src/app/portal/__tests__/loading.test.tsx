import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PortalLoading from "../loading";

describe("PortalLoading", () => {
  it("renders the Client Portal heading", () => {
    render(<PortalLoading />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Client Portal");
  });

  it("renders skeleton placeholder elements", () => {
    render(<PortalLoading />);

    const skeletons = document.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
