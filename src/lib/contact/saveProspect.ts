import { createProspect, type ProspectData, type ProspectRecord } from "@/lib/dal";

export async function saveProspect(data: ProspectData): Promise<ProspectRecord> {
  return createProspect(data);
}
