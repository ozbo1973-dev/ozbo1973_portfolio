"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { SectionType } from "@/types";

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

      // Update active section based on scroll position
      const sections = ["home", "about", "skills", "projects", "contact"];
      const scrollPosition = window.scrollY + (isScrolled ? 64 : 96); // Account for navbar height

      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          return scrollPosition >= offsetTop && scrollPosition < offsetBottom;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(
          currentSection === "home"
            ? "/"
            : (`/${currentSection}` as SectionType)
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
      const navHeight = isScrolled ? 64 : 96; // 4rem or 6rem in pixels
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
