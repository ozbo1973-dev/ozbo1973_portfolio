import { cn } from "@/lib/utils";
import SectionWrapper from "./wrapper";
import { SectionMainButton } from "./main-button";

export default function AboutSection() {
  return (
    <SectionWrapper id="about" title="About Me">
      {/* Header - Responsive */}

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
        {/* Image Container */}
        <div
          className={cn(
            "w-full relative overflow-hidden",
            "h-48 md:h-72 lg:h-[402px]",
            "max-w-[350px] md:max-w-[450px] lg:max-w-[550px]"
          )}
        >
          <div className="absolute md:mt-5 lg:mt-0 inset-0 bg-zinc-200" />
          <div className="absolute w-16 h-16 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Text Content */}
        <div
          className={cn(
            "w-full lg:flex-1",
            "max-w-[600px]",
            " text-xl md:text-2xl font-normal font-['Inter'] leading-7",
            "text-foreground text-center lg:text-left"
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
      <div className="w-full py-10 flex justify-center">
        <SectionMainButton href="/resume.pdf" download>
          Download Resume
        </SectionMainButton>
      </div>
    </SectionWrapper>
  );
}
