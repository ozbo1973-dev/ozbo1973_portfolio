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
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { ContactButton } from "./contact-button";
import { NavButton } from "./nav-button";
import { LogIn } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

export function MobileMenu({ isScrolled }: { isScrolled: boolean }) {
  const { activeSection } = useNavigation();
  const [open, setOpen] = React.useState(false);
  const { data: session } = authClient.useSession();
  const path = usePathname();
  const portalHref = session?.user.role === "admin" ? "/admin" : "/portal";

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
              isScrolled ? "h-5 w-5" : "h-6 w-6",
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
              href={link.href}
              className={cn(
                "w-full ml-5 justify-start text-lg gap-3",
                activeSection === link.href
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-primary/10",
              )}
            >
              {link.icon && (
                <link.icon
                  className={cn(
                    "w-5 h-5",
                    activeSection === link.href
                      ? "text-primary"
                      : "text-primary/70",
                  )}
                />
              )}
              {link.label}
            </NavButton>
          ))}
          {!session && path !== "/sign-in" && (
            <NavButton
              href="/sign-in"
              setOpen={setOpen}
              isMobile={true}
              className="w-full ml-5 justify-start text-lg gap-3 hover:bg-primary/10"
            >
              <LogIn className="w-5 h-5 text-primary" />
              Sign In
            </NavButton>
          )}

          {session && (
            <>
              <NavButton
                href={portalHref}
                setOpen={setOpen}
                isMobile={true}
                className="w-full ml-5 justify-start text-lg gap-3 hover:bg-primary/10"
              >
                My Portal
              </NavButton>
              <SignOutButton />
            </>
          )}

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
