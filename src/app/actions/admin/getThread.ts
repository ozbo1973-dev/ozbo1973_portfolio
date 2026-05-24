"use server";

import { verifyAdminSession, getThread } from "@/lib/dal/admin";
import type { AdminThread } from "@/lib/dal/admin";

type GetThreadResult =
  | { success: true; thread: AdminThread }
  | { success: false; error: string };

export async function getThreadAction(rootId: string): Promise<GetThreadResult> {
  await verifyAdminSession();

  const thread = await getThread(rootId);
  if (!thread) {
    return { success: false, error: "Thread not found." };
  }

  return { success: true, thread };
}
