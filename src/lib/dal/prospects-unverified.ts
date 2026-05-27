import "server-only";
import connectDB from "@/lib/db/connect";
import ProspectiveCustomer from "@/lib/models/ProspectiveCustomer";

// Functions in this module intentionally do not call verifySession().
//
// updateProspectUserId — called during the unauthenticated magic-link capture flow
//   (ADR-0003). No session exists yet; the user authenticates after this point.
//
// deleteAllSubmissionsByUser — called from the auth-system cascade in
//   dal/users.ts::deleteUser. BetterAuth is the authority here, not a
//   user-scoped session. See ADR-0009 (forthcoming) for the general rule.

export async function updateProspectUserId(id: string, userId: string): Promise<void> {
  await connectDB();
  await ProspectiveCustomer.findByIdAndUpdate(id, { userId });
}

export async function deleteAllSubmissionsByUser(userId: string): Promise<number> {
  await connectDB();
  const result = await ProspectiveCustomer.deleteMany({ userId });
  return result.deletedCount;
}
