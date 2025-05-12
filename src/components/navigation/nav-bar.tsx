import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
];

function Navbar() {
  return (
    <nav className="w-full bg-slate-800 text-white border-b border-border">
      <div className="flex justify-between items-center px-4 md:px-6 lg:px-8 py-7">
        {/* Logo - Responsive sizes */}
        <div className="flex items-center gap-0.5">
          <div className="w-8 h-9 md:w-14 md:h-14 bg-primary rounded-full" />
          {/* <span className="text-3xl md:text-5xl font-normal font-['ABeeZee'] text-shadow-white">
            O
          </span> */}
          <span className="text-3xl md:text-4xl lg:text-5xl font-bold font-['Inter'] text-shadow-white">
            zBo1973
          </span>
        </div>

        {/* Navigation Links - Desktop Only */}
        <div className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-base font-bold font-['Mulish'] underline ",
                link.href === "/"
                  ? "text-primary hover:text-white"
                  : "text-white hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Contact Button - Tablet & Desktop */}
        <div className="hidden sm:block">
          <Button
            asChild
            className={cn(
              "border-2 border-primary bg-transparent hover:bg-primary/10",
              "md:h-16 md:w-72 lg:h-20 lg:w-72 rounded-[24px]"
            )}
          >
            <Link href="/contact" className="text-shadow-white">
              Contact
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button size="icon" className="lg:hidden ">
          <Menu />
          <span className="sr-only">Menu</span>
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;
