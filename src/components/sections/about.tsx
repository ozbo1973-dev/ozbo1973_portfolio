import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function About() {
  return (
    <section className="w-full min-h-screen bg-background">
      {/* Header - Responsive */}
      <div
        className={cn(
          "w-full flex-1",
          "min-h-14 md:min-h-16 lg:min-h-24",
          "px-4 md:px-6 lg:px-8 py-2.5",
          "bg-slate-800 lg:bg-background",
          "flex justify-center items-center"
        )}
      >
        <div className="flex-1 text-center">
          {/* Mobile & Tablet */}
          <h2 className="text-4xl md:text-5xl font-bold font-['Inter'] leading-[60.10px] text-primary lg:hidden">
            About Me
          </h2>
          {/* Desktop */}
          <h2 className="hidden lg:inline-block text-5xl font-bold font-['Inter'] leading-[60.10px]">
            <span className="text-foreground">A</span>
            <span className="text-primary">bout </span>
            <span className="text-foreground">M</span>
            <span className="text-primary">e</span>
          </h2>
        </div>
      </div>

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
        <Button
          asChild
          variant="default"
          className={cn(
            "bg-primary hover:bg-primary/90",
            "h-8 lg:h-12",
            "w-full md:w-96 lg:w-[500px]",
            "max-w-80 md:max-w-96 lg:max-w-[500px]",
            "rounded-3xl",
            "text-2xl font-bold font-['Mulish']"
          )}
        >
          <a href="/resume.pdf" download>
            Download Resume
          </a>
        </Button>
      </div>
    </section>
  );
}
