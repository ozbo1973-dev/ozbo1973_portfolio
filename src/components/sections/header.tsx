import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  children: string;
}

function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "w-full flex-1",
        "min-h-14 md:min-h-16 lg:min-h-24",
        "px-4 md:px-6 lg:px-8 py-2.5",
        "bg-transparent",
        "flex justify-center items-center"
      )}
    >
      <div className="flex-1 text-center">
        <h2
          className={cn(
            "text-4xl font-bold font-[family-name:var(--font-playfair)] leading-[60.10px] text-primary",
            "md:text-5xl",
            "lg:inline-block"
          )}
        >
          {children}
        </h2>
        <div className="h-1 w-16 bg-primary mx-auto mt-2" />
      </div>
    </div>
  );
}

export default SectionHeader;
