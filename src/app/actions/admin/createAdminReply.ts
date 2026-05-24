"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { verifyAdminSession, createAdminReply, getRootSubmissionOwner } from "@/lib/dal/admin";
import type { AdminSubmissionRecord } from "@/lib/dal/admin";
import { auth, registerMagicLinkCapture } from "@/lib/auth/auth";
import { sendReplyNotification } from "@/lib/contact/sendNotifications";

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

    const owner = await getRootSubmissionOwner(rootId);
    if (owner) {
      const h = await headers();
      const urlCapture = registerMagicLinkCapture(owner.email);
      await auth.api.signInMagicLink({ body: { email: owner.email, callbackURL: "/portal" }, headers: h });
      const magicLinkUrl = await urlCapture;
      sendReplyNotification({ to: owner.email, senderName: adminSession.name, replyBody: parsed.data.body, magicLinkUrl }).catch(
        (err) => console.error("Failed to send reply notification:", err)
      );
    }

    return { success: true, reply };
  } catch {
    return { success: false, error: "Failed to send reply." };
  }
}
