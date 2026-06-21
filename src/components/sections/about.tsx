import Image from "next/image";
import { cn } from "@/lib/utils";
import SectionWrapper from "./wrapper";
import { SectionMainButton } from "./main-button";
import { SECTION_IDS } from "@/lib/config";

export default function AboutSection() {
  return (
    <SectionWrapper id={SECTION_IDS[1]} title="About Me">
      {/* Content Container */}
      <div
        className={cn(
          "w-full",
          "px-4 md:px-8 lg:px-4",
          "py-4 md:py-1 lg:py-16",
          "flex flex-col lg:flex-row",
          "justify-center items-center",
          "gap-20 md:gap-12 lg:gap-36",
        )}
      >
        {/* Portrait */}
        <div
          className={cn(
            "relative shrink-0",
            "w-full h-48 md:h-72 lg:h-[402px]",
            "max-w-[350px] md:max-w-[450px] lg:max-w-[550px]",
          )}
        >
          <div
            aria-hidden
            className={cn(
              "absolute -inset-2 lg:-inset-3",
              "translate-x-3 translate-y-3 lg:translate-x-4 lg:translate-y-4",
              "bg-primary/20 rounded-sm",
            )}
          />
          <Image
            src="/images/bovero-headshot.png"
            alt="Brady Bovero headshot"
            fill
            sizes="(max-width: 768px) 350px, (max-width: 1024px) 450px, 550px"
            priority
            className="relative object-cover object-top rounded-sm ring-1 ring-primary/30"
          />
        </div>

        {/* Text Content */}
        <div
          className={cn(
            "w-full lg:flex-1",
            "max-w-[600px]",
            "text-xl md:text-2xl font-normal font-['Inter'] leading-7",
            "text-foreground text-center lg:text-left",
            "border-l-4 border-primary/50 pl-4 lg:pl-6",
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
