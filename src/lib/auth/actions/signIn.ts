"use server";

import { headers } from "next/headers";
import { getUserByEmail } from "@/lib/auth/getUserByEmail";
import { auth, registerMagicLinkCapture } from "@/lib/auth/auth";
import { sendMagicLinkEmail } from "@/lib/contact/sendNotifications";

export interface SignInResult {
  success: true;
}

export async function signIn(email: string): Promise<SignInResult> {
  const normalizedEmail = email.toLowerCase();
  const user = await getUserByEmail(normalizedEmail);

  if (user) {
    const callbackURL = user.role === "admin" ? "/admin" : "/portal";
    const urlCapture = registerMagicLinkCapture(normalizedEmail);
    await auth.api.signInMagicLink({ body: { email: normalizedEmail, callbackURL }, headers: await headers() });
    const magicLinkUrl = await urlCapture;
    await sendMagicLinkEmail(normalizedEmail, magicLinkUrl);
  }

  return { success: true };
}
