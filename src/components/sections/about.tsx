import { cn } from "@/lib/utils";
import SectionWrapper from "./wrapper";
import { SectionMainButton } from "./main-button";
import { UserRound } from "lucide-react";

export default function AboutSection() {
  return (
    <SectionWrapper id="about" title="About Me">
      {/* Content Container */}
      <div
        className={cn(
          "w-full",
          "px-4 md:px-8 lg:px-4",
          "py-4 md:py-1 lg:py-16",
          "flex flex-col lg:flex-row",
          "justify-center items-center lg:items-start",
          "gap-20 md:gap-12 lg:gap-36"
        )}
      >
        {/* Image Placeholder — swap for Next.js Image when ready */}
        <div
          className={cn(
            "w-full relative overflow-hidden",
            "h-48 md:h-72 lg:h-[402px]",
            "max-w-[350px] md:max-w-[450px] lg:max-w-[550px]"
          )}
        >
          <div
            className={cn(
              "absolute inset-0",
              "bg-card",
              "border-2 border-dashed border-primary/60",
              "flex flex-col items-center justify-center gap-3"
            )}
          >
            <UserRound className="text-primary/70 w-16 h-16" strokeWidth={1} />
            <span className="text-foreground/40 text-xs uppercase tracking-widest font-['Mulish']">
              Photo coming soon
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div
          className={cn(
            "w-full lg:flex-1",
            "max-w-[600px]",
            "text-xl md:text-2xl font-normal font-['Inter'] leading-7",
            "text-foreground text-center lg:text-left",
            "border-l-4 border-primary/50 pl-4 lg:pl-6"
          )}
        >
          With 20+ years of experience in solutioning problems with coding and
          automation, I blend creative problem-solving and programming expertise
          to build innovative solutions. Specializing in a variety of
          technologies, I create scalable, user-centric applications while
          actively learning to incorporate AI into modern web experiences. My
          passion lies in transforming ideas into impactful, real-world
          solutions.
        </div>
      </div>

      {/* Resume Button */}
      <SectionMainButton href="/resume.pdf" download="resume.pdf">
        Download Resume
      </SectionMainButton>
    </SectionWrapper>
  );
}
