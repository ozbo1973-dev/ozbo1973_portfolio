"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/context/navigation-context";
import { Send } from "lucide-react";

interface ContactButtonProps {
  isScrolled: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

export function ContactButton({
  isScrolled,
  isMobile = false,
  onClick,
}: ContactButtonProps) {
  const { scrollToSection } = useNavigation();

  const handleClick = () => {
    scrollToSection("/contact");
    onClick?.();
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "border-2 border-primary hover:bg-primary/10 gap-2",
        "transition-all duration-300 bg-transparent",
        isMobile &&
          "mx-auto w-[60%] bg-slate-800 hover:bg-slate-600 rounded-[8px] mt-4",
        !isMobile &&
          cn(
            isScrolled
              ? "h-10 w-40 md:h-12 md:w-48"
              : "md:h-16 md:w-72 lg:h-20 lg:w-72",
            "rounded-[24px] text-shadow-white"
          )
      )}
    >
      <Send className="w-4 h-4 text-primary" />
      Contact
    </Button>
  );
}
