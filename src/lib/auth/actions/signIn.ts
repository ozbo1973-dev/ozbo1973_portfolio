"use server";

import { headers } from "next/headers";
import { getUserIdByEmail } from "@/lib/auth/getUserIdByEmail";
import { auth, registerMagicLinkCapture } from "@/lib/auth/auth";
import { sendMagicLinkEmail } from "@/lib/contact/sendNotifications";

export interface SignInResult {
  success: true;
}

export async function signIn(email: string): Promise<SignInResult> {
  const userId = await getUserIdByEmail(email);

  if (userId) {
    const urlCapture = registerMagicLinkCapture(email);
    await auth.api.signInMagicLink({ body: { email, callbackURL: "/portal" }, headers: await headers() });
    const magicLinkUrl = await urlCapture;
    await sendMagicLinkEmail(email, magicLinkUrl);
  }

  return { success: true };
}
