"use server";

import { deleteSubmission } from "@/lib/dal/prospects";

export interface DeleteSubmissionResult {
  success: boolean;
  blocked?: boolean;
  error?: string;
}

export async function deleteSubmissionAction(id: string): Promise<DeleteSubmissionResult> {
  const outcome = await deleteSubmission(id);
  if ("blocked" in outcome && outcome.blocked) {
    return { success: false, blocked: true, error: "Cannot delete: admin replies exist. Archive instead." };
  }
  if (!outcome.deleted) return { success: false, error: "Submission not found" };
  return { success: true };
}
