"use server";

import { verifySession } from "@/lib/dal/prospects";
import { deleteUser } from "@/lib/dal/users";

export interface DeleteAccountResult {
  success: boolean;
  error?: string;
}

export async function deleteAccountAction(): Promise<DeleteAccountResult> {
  try {
    const { userId } = await verifySession();
    await deleteUser(userId);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
