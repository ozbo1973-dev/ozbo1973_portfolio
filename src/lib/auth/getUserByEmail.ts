import { db } from "@/lib/auth/auth";

export async function getUserByEmail(
  email: string
): Promise<{ id: string; role: string | null; emailVerified: boolean } | null> {
  const user = await db.collection("user").findOne({ email });
  if (!user) return null;
  return {
    id: user._id.toString(),
    role: (user.role as string) ?? null,
    emailVerified: Boolean(user.emailVerified),
  };
}
