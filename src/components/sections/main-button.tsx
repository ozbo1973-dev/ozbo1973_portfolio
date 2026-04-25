import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionMainButtonProps {
  children: React.ReactNode;
  href: string;
  download?: string;
}

export function SectionMainButton({
  children,
  href,
  download,
}: SectionMainButtonProps) {
  return (
    <div className="w-full py-10 flex justify-center">
      <a
        href={href}
        download={download}
        className={cn(
          buttonVariants({ variant: "default" }),
          "bg-primary hover:bg-primary/90",
          "h-8 lg:h-12",
          "w-full md:w-96 lg:w-[500px]",
          "max-w-60 md:max-w-96 lg:max-w-[500px]",
          "rounded-2xl",
          "text-2xl font-bold font-['Mulish']"
        )}
      >
        {children}
      </a>
    </div>
  );
}
