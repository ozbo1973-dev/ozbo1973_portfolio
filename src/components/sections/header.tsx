import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  children: string;
}

function SectionHeader({ children }: SectionHeaderProps) {
  // Split the text into words for desktop styling
  const words = children.split(" ");
  const styledWords = words.map((word) => (
    <span key={word}>
      <span className="text-foreground">{word.charAt(0)}</span>
      <span className="text-primary">{word.slice(1)} </span>
    </span>
  ));

  return (
    <div
      className={cn(
        "w-full flex-1",
        "min-h-14 md:min-h-16 lg:min-h-24",
        "px-4 md:px-6 lg:px-8 py-2.5",
        "bg-slate-800 lg:bg-transparent",
        "flex justify-center items-center"
      )}
    >
      <div className="flex-1 text-center">
        {/* Mobile & Tablet */}
        <h2 className="text-4xl md:text-5xl font-bold font-['Inter'] leading-[60.10px] text-primary lg:hidden">
          {children}
        </h2>
        {/* Desktop */}
        <h2 className="hidden lg:inline-block text-5xl font-bold font-['Inter'] leading-[60.10px]">
          {styledWords}
        </h2>
      </div>
    </div>
  );
}

export default SectionHeader;
