"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  isMobile?: boolean;
  setOpen?: (state: boolean) => void;
}

export function NavButton({
  href,
  children,
  className,
  isMobile = false,
  setOpen,
}: NavButtonProps) {
  const handleClick = () => {
    if (isMobile && setOpen) {
      setOpen(false);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn("transition-all duration-300", className)}
    >
      {children}
    </Link>
  );
}
