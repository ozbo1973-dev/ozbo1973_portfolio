"use server";

import { verifySession } from "@/lib/dal/prospects";
import { deleteSubmission } from "@/lib/dal/index";

export interface DeleteSubmissionResult {
  success: boolean;
  blocked?: boolean;
  error?: string;
}

export async function deleteSubmissionAction(id: string): Promise<DeleteSubmissionResult> {
  const { userId } = await verifySession();
  const outcome = await deleteSubmission(id, userId);
  if ("blocked" in outcome && outcome.blocked) {
    return { success: false, blocked: true, error: "Cannot delete: admin replies exist. Archive instead." };
  }
  if (!outcome.deleted) return { success: false, error: "Submission not found" };
  return { success: true };
}
