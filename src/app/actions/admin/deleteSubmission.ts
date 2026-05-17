"use server";

import { verifyAdminSession, adminDeleteSubmission } from "@/lib/dal/admin";

export interface AdminDeleteSubmissionResult {
  success: boolean;
  error?: string;
}

export async function adminDeleteSubmissionAction(id: string): Promise<AdminDeleteSubmissionResult> {
  try {
    await verifyAdminSession();
    await adminDeleteSubmission(id);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { success: false, error: "Failed to delete submission" };
  }
}
