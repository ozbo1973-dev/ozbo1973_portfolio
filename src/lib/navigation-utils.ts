import type { SectionId } from "@/lib/config";

export type SectionDescriptor = { id: SectionId; top: number; height: number };

export function getActiveSection(
  scrollY: number,
  sections: SectionDescriptor[],
  navbarHeight: number
): SectionId | null {
  const scrollPosition = scrollY + navbarHeight;
  const match = sections.find(
    (s) => scrollPosition >= s.top && scrollPosition < s.top + s.height
  );
  return match?.id ?? null;
}
