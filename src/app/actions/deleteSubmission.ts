"use server";

import { verifySession } from "@/lib/dal/prospects";
import { deleteSubmission } from "@/lib/dal/index";

export interface DeleteSubmissionResult {
  success: boolean;
  error?: string;
}

export async function deleteSubmissionAction(id: string): Promise<DeleteSubmissionResult> {
  const { userId } = await verifySession();
  const deleted = await deleteSubmission(id, userId);
  if (!deleted) return { success: false, error: "Submission not found" };
  return { success: true };
}
