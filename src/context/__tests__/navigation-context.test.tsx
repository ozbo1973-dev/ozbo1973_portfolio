import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/navigation-utils", () => ({
  getActiveSection: vi.fn(),
}));

import { NavigationProvider, useNavigation } from "../navigation-context";
import { getActiveSection } from "@/lib/navigation-utils";
import { NAV_HEIGHT_SCROLLED, NAV_HEIGHT_DEFAULT, SECTION_IDS } from "@/lib/config";
import type { SectionType } from "@/types";

const mockedGetActiveSection = vi.mocked(getActiveSection);

function setupDOM(scrollY = 0, heroHeight = 800) {
  Object.defineProperty(window, "scrollY", { value: scrollY, writable: true, configurable: true });

  const getElementById = vi.spyOn(document, "getElementById");

  getElementById.mockImplementation((id: string) => {
    const el = document.createElement("div");
    if (id === "home") {
      Object.defineProperty(el, "offsetHeight", { value: heroHeight, configurable: true });
      Object.defineProperty(el, "offsetTop", { value: 0, configurable: true });
    } else {
      Object.defineProperty(el, "offsetTop", { value: 800, configurable: true });
      Object.defineProperty(el, "offsetHeight", { value: 600, configurable: true });
    }
    Object.defineProperty(el, "getBoundingClientRect", {
      value: () => ({ top: 0 }),
      configurable: true,
    });
    return el;
  });

  return getElementById;
}

describe("useNavigation", () => {
  it("throws when used outside NavigationProvider", () => {
    expect(() => renderHook(() => useNavigation())).toThrow(
      "useNavigation must be used within a NavigationProvider"
    );
  });
});

describe("NavigationProvider — initial state", () => {
  beforeEach(() => {
    mockedGetActiveSection.mockReturnValue(null);
    setupDOM();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("provides activeSection defaulting to '/'", () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: NavigationProvider,
    });
    expect(result.current.activeSection).toBe("/");
  });

  it("provides isScrolled defaulting to false", () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: NavigationProvider,
    });
    expect(result.current.isScrolled).toBe(false);
  });
});

describe("NavigationProvider — scroll handler uses constants and getActiveSection", () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let capturedScrollHandler: (() => void) | null = null;

  beforeEach(() => {
    mockedGetActiveSection.mockReturnValue(null);
    setupDOM(0, 800);

    addEventListenerSpy = vi.spyOn(window, "addEventListener").mockImplementation(
      (type: string, handler: EventListenerOrEventListenerObject) => {
        if (type === "scroll") {
          capturedScrollHandler = handler as () => void;
        }
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    capturedScrollHandler = null;
  });

  it("calls getActiveSection with NAV_HEIGHT_DEFAULT when not scrolled", () => {
    renderHook(() => useNavigation(), { wrapper: NavigationProvider });

    // Fire scroll event
    act(() => {
      capturedScrollHandler?.();
    });

    expect(mockedGetActiveSection).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Array),
      NAV_HEIGHT_DEFAULT
    );
  });

  it("calls getActiveSection with NAV_HEIGHT_SCROLLED when isScrolled=true", () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: NavigationProvider,
    });

    // Force isScrolled to true
    act(() => {
      result.current.setActiveSection("/");
    });

    // Simulate scrolled past hero (scrollY > heroHeight * 0.9)
    Object.defineProperty(window, "scrollY", { value: 900, writable: true, configurable: true });

    act(() => {
      capturedScrollHandler?.();
    });

    // Now fire again after isScrolled becomes true
    act(() => {
      capturedScrollHandler?.();
    });

    const calls = mockedGetActiveSection.mock.calls;
    const scrolledCall = calls.find((c) => c[2] === NAV_HEIGHT_SCROLLED);
    expect(scrolledCall).toBeDefined();
  });

  it("passes an array derived from SECTION_IDS to getActiveSection", () => {
    renderHook(() => useNavigation(), { wrapper: NavigationProvider });

    act(() => {
      capturedScrollHandler?.();
    });

    const [, sectionsArg] = mockedGetActiveSection.mock.calls[0] ?? [];
    expect(Array.isArray(sectionsArg)).toBe(true);
    const ids = (sectionsArg as Array<{ id: string }>).map((s) => s.id);
    expect(ids).toEqual([...SECTION_IDS]);
  });
});

describe("NavigationProvider — scrollToSection uses nav height constants", () => {
  beforeEach(() => {
    mockedGetActiveSection.mockReturnValue(null);
    setupDOM(0, 800);
    vi.spyOn(window, "addEventListener").mockImplementation(() => {});
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("scrolls using NAV_HEIGHT_DEFAULT when not scrolled", () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: NavigationProvider,
    });

    act(() => {
      result.current.scrollToSection("/about");
    });

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        top: expect.any(Number),
        behavior: "smooth",
      })
    );

    const call = vi.mocked(window.scrollTo).mock.calls[0][0] as ScrollToOptions;
    // offsetPosition = getBoundingClientRect().top + scrollY - navHeight
    // = 0 + 0 - 96 = -96
    expect(call.top).toBe(-NAV_HEIGHT_DEFAULT);
  });

  it("setActiveSection updates the activeSection", () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: NavigationProvider,
    });

    act(() => {
      result.current.setActiveSection("/about");
    });

    expect(result.current.activeSection).toBe("/about" as SectionType);
  });
});
