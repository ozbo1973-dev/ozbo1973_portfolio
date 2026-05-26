"use server";

import { z } from "zod";
import { verifySession } from "@/lib/dal/session";
import { createUserReply } from "@/lib/dal/prospects";
import type { UserThreadRecord } from "@/lib/dal/prospects";
import { sendReplyNotification } from "@/lib/contact/sendNotifications";

const replySchema = z.object({
  body: z.string().trim().min(1, "Reply cannot be empty").max(5000, "Reply is too long"),
});

type CreateUserReplyResult =
  | { success: true; reply: UserThreadRecord }
  | { success: false; error: string };

export async function createUserReplyAction(
  rootId: string,
  body: string,
): Promise<CreateUserReplyResult> {
  const session = await verifySession();

  const parsed = replySchema.safeParse({ body });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const reply = await createUserReply(rootId, session.userId, parsed.data.body);
    sendReplyNotification({
      to: process.env.NOTIFICATION_EMAIL!,
      senderName: session.name,
      replyBody: parsed.data.body,
    }).catch(() => {});
    return { success: true, reply };
  } catch {
    return { success: false, error: "Failed to send reply." };
  }
}
