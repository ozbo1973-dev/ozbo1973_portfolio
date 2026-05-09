"use server";

import { headers } from "next/headers";
import { getUserIdByEmail } from "@/lib/auth/getUserIdByEmail";
import { auth } from "@/lib/auth/auth";

export interface SignInResult {
  success: true;
}

export async function signIn(email: string): Promise<SignInResult> {
  const userId = await getUserIdByEmail(email);

  if (userId) {
    await auth.api.signInMagicLink({ body: { email }, headers: await headers() });
  }

  return { success: true };
}
