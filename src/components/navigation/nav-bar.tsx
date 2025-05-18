"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/context/navigation-context";
import { navLinks } from "@/lib/config";
import { MobileMenu } from "./mobile-menu";
import { ContactButton } from "./contact-button";
import { NavButton } from "./nav-button";
import { SectionType } from "@/types";

function Navbar() {
  const { activeSection, isScrolled, scrollToSection } = useNavigation();

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "w-full bg-slate-800 text-white border-b border-border",
        "transition-all duration-300 ease-in-out",
        isScrolled ? "h-16" : "h-24"
      )}
    >
      <div
        className={cn(
          "container mx-auto flex justify-between items-center h-full",
          "px-4 md:px-6 lg:px-8"
        )}
      >
        {" "}
        {/* Logo - Responsive sizes */}
        <button
          onClick={() => scrollToSection("/")}
          className="flex items-center gap-0.5 hover:opacity-80 transition-opacity"
        >
          <div
            className={cn(
              "bg-primary rounded-full transition-all duration-300",
              isScrolled ? "w-8 h-8 md:w-10 md:h-10" : "w-8 h-9 md:w-14 md:h-14"
            )}
          />
          <span
            className={cn(
              "font-bold font-['Inter'] text-shadow-white transition-all duration-300",
              isScrolled
                ? "text-xl md:text-2xl lg:text-3xl"
                : "text-3xl md:text-4xl lg:text-5xl"
            )}
          >
            zBo1973
          </span>
        </button>
        {/* Navigation Links - Desktop Only */}
        <div className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => {
            if (link.href !== "/")
              return (
                <NavButton
                  key={link.href}
                  href={link.href as SectionType}
                  className={cn(
                    "font-bold font-['Mulish']",
                    isScrolled ? "text-sm" : "text-base",
                    activeSection === link.href
                      ? "text-primary"
                      : "text-white hover:text-primary",
                    "transition-colors duration-200"
                  )}
                >
                  {link.label}
                </NavButton>
              );
          })}
        </div>{" "}
        {/* Contact Button - Tablet & Desktop */}
        <div className="hidden sm:block">
          <ContactButton isScrolled={isScrolled} />
        </div>{" "}
        {/* Mobile Menu */}
        <MobileMenu isScrolled={isScrolled} />
      </div>
    </nav>
  );
}

export default Navbar;
