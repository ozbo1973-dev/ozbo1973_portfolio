import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionMainButtonProps {
  children: React.ReactNode;
  href: string;
  download?: boolean;
}

export function SectionMainButton({
  children,
  href,
  download,
}: SectionMainButtonProps) {
  return (
    <div className="w-full py-10 flex justify-center">
      <Button
        asChild
        variant="default"
        className={cn(
          "bg-primary hover:bg-primary/90",
          "h-8 lg:h-12",
          "w-full md:w-96 lg:w-[500px]",
          "max-w-60 md:max-w-96 lg:max-w-[500px]",
          "rounded-2xl",
          "text-2xl font-bold font-['Mulish']"
        )}
      >
        <a href={href} {...(download && { download })}>
          {children}
        </a>
      </Button>
    </div>
  );
}
