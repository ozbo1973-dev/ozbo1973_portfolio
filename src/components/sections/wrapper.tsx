"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/context/navigation-context";
import SectionHeader from "./header";

interface SectionWrapperProps {
  children: React.ReactNode;
  bgImage?: string;
  id?: string;
  title?: string;
}

function SectionWrapper({ children, bgImage, id, title }: SectionWrapperProps) {
  const { isScrolled } = useNavigation();

  return (
    <section
      id={id}
      className={cn("w-full min-h-screen bg-background", "scroll-mt-24")}
      style={{
        ...(bgImage
          ? {
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : {}),
        paddingTop: isScrolled ? "4rem" : "6rem",
      }}
    >
      {title && <SectionHeader>{title}</SectionHeader>}
      {children}
    </section>
  );
}

export default SectionWrapper;
