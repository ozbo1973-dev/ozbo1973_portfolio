"use client";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/context/navigation-context";
import { navLinks } from "@/lib/config";
import { authClient } from "@/lib/auth/auth-client";
import { MobileMenu } from "./mobile-menu";
import { ContactButton } from "./contact-button";
import { NavButton } from "./nav-button";
import { SignOutButton } from "./sign-out-button";
import { usePathname } from "next/navigation";

function Navbar() {
  const { activeSection, isScrolled } = useNavigation();
  const { data: session } = authClient.useSession();
  const path = usePathname();

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "w-full bg-card text-white border-b border-border",
        "transition-all duration-300 ease-in-out",
        isScrolled ? "h-16" : "h-24",
      )}
    >
      <div
        className={cn(
          "container mx-auto flex justify-between items-center h-full",
          "px-4 md:px-6 lg:px-8",
        )}
      >
        {/* Logo - Responsive sizes */}
        <Link
          href="/"
          className="flex items-center gap-0.5 hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <Image
              src="/images/logo.svg"
              alt="OzBo1973 Logo"
              width={isScrolled ? 32 : 56}
              height={isScrolled ? 32 : 56}
              className={cn(
                "transition-all duration-300",
                isScrolled
                  ? "w-8 h-8 md:w-10 md:h-10"
                  : "w-8 h-9 md:w-14 md:h-14",
              )}
              priority
            />
          </div>
          <span
            className={cn(
              "font-bold font-['Inter'] text-shadow-white transition-all duration-300",
              isScrolled
                ? "text-xl md:text-2xl lg:text-3xl"
                : "text-3xl md:text-4xl lg:text-5xl",
            )}
          >
            zBo1973
          </span>
        </Link>
        {/* Navigation Links - Desktop Only */}
        <div className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => {
            if (link.href !== "/")
              return (
                <NavButton
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "font-bold font-['Mulish']",
                    isScrolled ? "text-sm" : "text-base",
                    activeSection === link.href
                      ? "text-primary"
                      : "text-white hover:text-primary",
                    "transition-colors duration-200",
                  )}
                >
                  {link.label}
                </NavButton>
              );
          })}
        </div>
        {/* Right side: Sign Out (when session active) + Contact Button if not on /portal page - Desktop only */}
        <div className="hidden lg:flex items-center gap-4">
          {session && (
            <>
              <NavButton
                className={cn(
                  path === "/portal" ? "text-primary" : "text-white",
                )}
                href="/portal"
              >
                My Portal
              </NavButton>
              <SignOutButton />
            </>
          )}

          {!session && path === "/" && (
            <ContactButton isScrolled={isScrolled} />
          )}
          {!session && path !== "/sign-in" && (
            <NavButton href={"/sign-in"}>Sign In</NavButton>
          )}
        </div>
        {/* Mobile Menu */}
        <MobileMenu isScrolled={isScrolled} />
      </div>
    </nav>
  );
}

export default Navbar;
