import { describe, it, expect } from "vitest";
import { SECTION_IDS, NAV_HEIGHT_SCROLLED, NAV_HEIGHT_DEFAULT } from "@/lib/config";

describe("SECTION_IDS", () => {
  it("contains all five section IDs in document order", () => {
    expect(SECTION_IDS).toEqual(["home", "about", "skills", "projects", "contact"]);
  });

  it("is readonly (tuple length is exactly 5)", () => {
    expect(SECTION_IDS).toHaveLength(5);
  });
});

describe("nav height constants", () => {
  it("NAV_HEIGHT_SCROLLED is 64", () => {
    expect(NAV_HEIGHT_SCROLLED).toBe(64);
  });

  it("NAV_HEIGHT_DEFAULT is 96", () => {
    expect(NAV_HEIGHT_DEFAULT).toBe(96);
  });
});
