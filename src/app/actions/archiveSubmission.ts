"use server";

import { verifySession } from "@/lib/dal/session";
import { userArchiveSubmission } from "@/lib/dal/index";

export interface ArchiveSubmissionResult {
  success: boolean;
  error?: string;
}

export async function archiveSubmissionAction(id: string): Promise<ArchiveSubmissionResult> {
  const { userId } = await verifySession();
  try {
    await userArchiveSubmission(id, userId);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to archive submission." };
  }
}
