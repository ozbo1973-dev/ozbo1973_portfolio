"use server";

import { headers } from "next/headers";
import { getUserIdByEmail } from "@/lib/auth/getUserIdByEmail";
import { auth, registerMagicLinkCapture } from "@/lib/auth/auth";
import { sendMagicLinkEmail } from "@/lib/contact/sendNotifications";

export interface SignInResult {
  success: true;
}

export async function signIn(email: string): Promise<SignInResult> {
  const normalizedEmail = email.toLowerCase();
  const userId = await getUserIdByEmail(normalizedEmail);

  if (userId) {
    const urlCapture = registerMagicLinkCapture(normalizedEmail);
    await auth.api.signInMagicLink({ body: { email: normalizedEmail, callbackURL: "/portal" }, headers: await headers() });
    const magicLinkUrl = await urlCapture;
    await sendMagicLinkEmail(normalizedEmail, magicLinkUrl);
  }

  return { success: true };
}
