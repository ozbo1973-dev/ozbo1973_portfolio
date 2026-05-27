import { deleteAllSubmissionsByUser } from "@/lib/dal/prospects-unverified";
import { auth } from "@/lib/auth/auth";

export async function deleteUser(userId: string): Promise<void> {
  await deleteAllSubmissionsByUser(userId);
  const ctx = await auth.$context;
  await ctx.internalAdapter.deleteUser(userId);
}
