import { describe, it, expect } from "vitest";
import { getActiveSection } from "@/lib/navigation-utils";
import type { SectionId } from "@/lib/config";

type SectionDescriptor = { id: SectionId; top: number; height: number };

const HOME: SectionDescriptor = { id: "home", top: 0, height: 800 };
const ABOUT: SectionDescriptor = { id: "about", top: 800, height: 600 };
const SKILLS: SectionDescriptor = { id: "skills", top: 1400, height: 600 };

describe("getActiveSection", () => {
  it("returns null for empty sections array", () => {
    expect(getActiveSection(0, [], 64)).toBeNull();
  });

  it("returns first section when scroll is at top (scrollY=0)", () => {
    expect(getActiveSection(0, [HOME, ABOUT, SKILLS], 64)).toBe("home");
  });

  it("returns the section the scroll position lands in the middle of", () => {
    // scrollY=900, navbarHeight=64 → scrollPosition=964, inside ABOUT (800–1400)
    expect(getActiveSection(900, [HOME, ABOUT, SKILLS], 64)).toBe("about");
  });

  it("returns the next section at its exact top boundary", () => {
    // scrollY=736, navbarHeight=64 → scrollPosition=800, exactly ABOUT.top
    expect(getActiveSection(736, [HOME, ABOUT, SKILLS], 64)).toBe("about");
  });

  it("returns null when scrolled past the last section", () => {
    // scrollY=2000, navbarHeight=64 → scrollPosition=2064, past SKILLS end (2000)
    expect(getActiveSection(2000, [HOME, ABOUT, SKILLS], 64)).toBeNull();
  });
});
