"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { SectionType } from "@/types";
import { SECTION_IDS, NAV_HEIGHT_SCROLLED, NAV_HEIGHT_DEFAULT } from "@/lib/config";
import { getActiveSection } from "@/lib/navigation-utils";
import type { SectionDescriptor } from "@/lib/navigation-utils";

interface NavigationContextType {
  activeSection: SectionType;
  isScrolled: boolean;
  setActiveSection: (section: SectionType) => void;
  scrollToSection: (section: SectionType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSection, setActiveSection] = useState<SectionType>("/");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we're scrolled past the hero section
      const heroSection = document.getElementById("home");
      if (heroSection) {
        const heroHeight = heroSection.offsetHeight;
        const scrolled = window.scrollY > heroHeight * 0.9;
        setIsScrolled(scrolled);
      }

      // Build section descriptors from DOM and delegate to pure function
      const navbarHeight = isScrolled ? NAV_HEIGHT_SCROLLED : NAV_HEIGHT_DEFAULT;
      const sectionDescriptors: SectionDescriptor[] = SECTION_IDS.flatMap((id) => {
        const el = document.getElementById(id);
        if (!el) return [];
        return [{ id, top: el.offsetTop, height: el.offsetHeight }];
      });

      const activeSectionId = getActiveSection(window.scrollY, sectionDescriptors, navbarHeight);

      if (activeSectionId) {
        setActiveSection(
          activeSectionId === "home"
            ? "/"
            : (`/${activeSectionId}` as SectionType)
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll position
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  const scrollToSection = (section: SectionType) => {
    const element = document.getElementById(section.replace("/", "") || "home");
    if (element) {
      const navHeight = isScrolled ? NAV_HEIGHT_SCROLLED : NAV_HEIGHT_DEFAULT;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(section);
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        activeSection,
        isScrolled,
        setActiveSection,
        scrollToSection,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
