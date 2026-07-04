import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalLoading() {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1
          className={cn(
            "text-3xl md:text-4xl font-bold mb-2",
            "font-[family-name:var(--font-playfair)]",
            "text-primary",
          )}
        >
          Client Portal
        </h1>
        <p className="text-muted-foreground font-['Mulish'] mb-10">
          Your submitted inquiries are shown below.
        </p>

        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
