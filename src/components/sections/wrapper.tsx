import React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  bgImage?: string;
}

function SectionWrapper({ children, bgImage }: SectionWrapperProps) {
  return (
    <section
      className={cn("w-full min-h-screen bg-background")}
      style={
        bgImage
          ? {
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      {children}
    </section>
  );
}

export default SectionWrapper;
