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
        "bg-transparent",
        "flex justify-center items-center"
      )}
    >
      <div className="flex-1 text-center border-b-4 border-slate-800 lg:border-b-0 ">
        <h2
          className={cn(
            "text-4xl font-bold font-['Inter'] leading-[60.10px] text-primary",
            " md:text-5xl ",
            "lg:inline-block"
          )}
        >
          {styledWords}
        </h2>
      </div>
    </div>
  );
}

export default SectionHeader;
