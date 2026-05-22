"use server";

import { z } from "zod";
import { verifyAdminSession, createAdminReply } from "@/lib/dal/admin";
import type { AdminSubmissionRecord } from "@/lib/dal/admin";

const replySchema = z.object({
  body: z.string().trim().min(1, "Reply cannot be empty").max(5000, "Reply is too long"),
});

type CreateAdminReplyResult =
  | { success: true; reply: AdminSubmissionRecord }
  | { success: false; error: string };

export async function createAdminReplyAction(
  rootId: string,
  body: string,
): Promise<CreateAdminReplyResult> {
  const adminSession = await verifyAdminSession();

  const parsed = replySchema.safeParse({ body });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const reply = await createAdminReply(rootId, parsed.data.body, adminSession);
    return { success: true, reply };
  } catch {
    return { success: false, error: "Failed to send reply." };
  }
}
