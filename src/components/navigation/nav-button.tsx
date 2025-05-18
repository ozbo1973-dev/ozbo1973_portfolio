"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/context/navigation-context";
import { SectionType } from "@/types";

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href: SectionType;
  children: React.ReactNode;
  className?: string;
  variant?: "ghost" | "default" | "outline";
  isMobile?: boolean;
  setOpen?: (state: boolean) => void;
}

export function NavButton({
  href,
  children,
  className,
  variant = "ghost",
  isMobile = false,
  setOpen,
  ...props
}: NavButtonProps) {
  const { scrollToSection } = useNavigation();

  const handleNavClick = () => {
    scrollToSection(href as any);
    console.log(isMobile);
    if (isMobile && setOpen) {
      setOpen(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleNavClick}
      className={cn("transition-all duration-300", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
