import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section
      className={cn(
        "w-full min-h-screen bg-background/90",
        "bg-[url('/images/hero-bg.png')] bg-cover bg-center bg-no-repeat"
      )}
    >
      <div className="container relative z-10 mx-auto px-4 py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Text Content */}
        <div className="flex-1 max-w-[720px] space-y-8 sm:space-y-14 lg:space-y-24">
          {/* Heading */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold font-['Inter'] leading-tight">
              <span className="text-primary">Hello I'm Brady,</span>{" "}
              <span className="text-foreground">Freelance Developer</span>
            </h1>

            <p className="text-xl xs:text-2xl sm:text-3xl font-normal font-['Mulish'] leading-relaxed">
              <span className="text-primary">Solving problems</span>
              <span className="text-foreground">
                {" "}
                with precision—building modern, scalable solutions using{" "}
              </span>
              <span className="text-primary">React, Next.js,</span>
              <span className="text-foreground">
                {" "}
                and AI-powered innovation.
              </span>
            </p>
          </div>

          {/* Buttons */}
          <div
            className={cn(
              "flex flex-col xs:flex-row gap-4",
              "justify-center xs:justify-start",
              "w-full max-w-[320px] xs:max-w-none mx-auto xs:mx-0"
            )}
          >
            <Button
              asChild
              variant="default"
              size="lg"
              className={cn(
                "w-full xs:w-auto",
                "h-14",
                "px-8",
                "text-base font-medium"
              )}
            >
              <Link href="/projects">View Projects</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className={cn(
                "w-full xs:w-auto",
                "h-14",
                "px-8",
                "text-base font-medium"
              )}
            >
              <Link href="/contact">Hire Me</Link>
            </Button>
          </div>
        </div>

        {/* Image/Placeholder - Only visible on desktop */}
        <div className="hidden lg:block w-[513.55px] h-72 relative">
          <div className="w-full h-full bg-primary absolute top-0 left-0" />
        </div>
      </div>
    </section>
  );
}
