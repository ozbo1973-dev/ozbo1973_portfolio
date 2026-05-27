import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export const verifySession = cache(async (): Promise<{ userId: string; email: string; name: string }> => {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/");
  return { userId: session.session.userId, email: session.user.email, name: session.user.name ?? "" };
});
