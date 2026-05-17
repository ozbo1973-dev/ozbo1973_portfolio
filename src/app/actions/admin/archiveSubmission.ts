"use server";

import { verifyAdminSession, archiveSubmission } from "@/lib/dal/admin";

export interface ArchiveSubmissionResult {
  success: boolean;
  error?: string;
}

export async function archiveSubmissionAction(id: string): Promise<ArchiveSubmissionResult> {
  try {
    await verifyAdminSession();
    await archiveSubmission(id);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { success: false, error: "Failed to archive submission" };
  }
}
