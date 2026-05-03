import { SectionId } from "@/lib/config";

/* Leaving as routes so it can be used as route or section div */
export type SectionType = "/" | `/${Exclude<SectionId, "home">}`;
