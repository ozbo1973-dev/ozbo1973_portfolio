import connectDB from "@/lib/db/connect";
import ProspectiveCustomer from "@/lib/models/ProspectiveCustomer";
import { buildUserThreads } from "@/lib/dal/prospects";
import type { ProspectRecord, UserThread } from "@/lib/dal/prospects";

export type { ProspectData, ProspectRecord, UserThread, UserThreadRecord } from "@/lib/dal/prospects";
export { createProspect, getThreadsByUserId } from "@/lib/dal/prospects";

export async function getSubmissionsByUserId(userId: string): Promise<ProspectRecord[]> {
  await connectDB();
  const docs = await ProspectiveCustomer.find({ userId });

  return docs.map((doc) => ({
    id: doc._id.toString(),
    userId: doc.userId,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}

export type DeleteSubmissionOutcome =
  | { deleted: true }
  | { deleted: false; blocked?: true };

export async function deleteSubmission(id: string, userId: string): Promise<DeleteSubmissionOutcome> {
  await connectDB();
  const adminReplies = await ProspectiveCustomer.find({
    parentId: id,
    userId: { $ne: userId },
  });
  if (adminReplies.length > 0) {
    return { deleted: false, blocked: true };
  }
  const deleted = await ProspectiveCustomer.findOneAndDelete({ _id: id, userId });
  return { deleted: deleted !== null };
}

export async function userArchiveSubmission(id: string, _userId: string): Promise<void> {
  await connectDB();
  const archivedAt = new Date();
  await Promise.all([
    ProspectiveCustomer.findByIdAndUpdate(id, { archivedAt }),
    ProspectiveCustomer.updateMany({ parentId: id }, { archivedAt }),
  ]);
}

export async function getArchivedThreadsByUserId(userId: string): Promise<UserThread[]> {
  await connectDB();

  const rootDocs = await ProspectiveCustomer.find({
    userId,
    archivedAt: { $ne: null },
    parentId: null,
  }).sort({ archivedAt: -1 });

  return buildUserThreads(rootDocs);
}

