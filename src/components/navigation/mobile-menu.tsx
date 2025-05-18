"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/context/navigation-context";
import { navLinks } from "@/lib/config";
import { Menu } from "lucide-react";
import { ContactButton } from "./contact-button";
import { NavButton } from "./nav-button";
import { SectionType } from "@/types";

export function MobileMenu({ isScrolled }: { isScrolled: boolean }) {
  const { activeSection } = useNavigation();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className={cn("lg:hidden", isScrolled ? "h-8 w-8" : "h-10 w-10")}
        >
          <Menu
            className={cn(
              "transition-all duration-300",
              isScrolled ? "h-5 w-5" : "h-6 w-6"
            )}
          />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Menu</SheetTitle>
          <SheetDescription>Click option below to navigate</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-6">
          {navLinks.map((link) => (
            <NavButton
              key={link.href}
              setOpen={setOpen}
              isMobile={true}
              href={link.href as SectionType}
              variant="ghost"
              className={cn(
                "w-full justify-start text-lg gap-3",
                activeSection === link.href
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-primary/10"
              )}
            >
              {link.icon && (
                <link.icon
                  className={cn(
                    "w-5 h-5",
                    activeSection === link.href
                      ? "text-primary"
                      : "text-primary/70"
                  )}
                />
              )}
              {link.label}
            </NavButton>
          ))}{" "}
          <ContactButton
            isScrolled={isScrolled}
            isMobile={true}
            onClick={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
