"use server";

import { userArchiveSubmission } from "@/lib/dal/prospects";

export interface ArchiveSubmissionResult {
  success: boolean;
  error?: string;
}

export async function archiveSubmissionAction(id: string): Promise<ArchiveSubmissionResult> {
  try {
    await userArchiveSubmission(id);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to archive submission." };
  }
}
