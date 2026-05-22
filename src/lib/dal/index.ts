import connectDB from "@/lib/db/connect";
import ProspectiveCustomer from "@/lib/models/ProspectiveCustomer";

export type { ProspectData, ProspectRecord, UserThread, UserThreadRecord } from "@/lib/dal/prospects";
export { createProspect, getThreadsByUserId } from "@/lib/dal/prospects";

export async function getSubmissionsByUserId(userId: string): Promise<import("@/lib/dal/prospects").ProspectRecord[]> {
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

export async function updateProspectUserId(id: string, userId: string): Promise<void> {
  await connectDB();
  await ProspectiveCustomer.findByIdAndUpdate(id, { userId });
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

export async function getArchivedThreadsByUserId(userId: string): Promise<import("@/lib/dal/prospects").UserThread[]> {
  await connectDB();

  const rootDocs = await ProspectiveCustomer.find({
    userId,
    archivedAt: { $ne: null },
    parentId: null,
  }).sort({ archivedAt: -1 });

  if (rootDocs.length === 0) return [];

  const rootIds = rootDocs.map((d) => d._id);
  const replyDocs = await ProspectiveCustomer.find({
    parentId: { $in: rootIds },
  }).sort({ createdAt: 1 });

  const replyMap = new Map<string, import("@/lib/dal/prospects").UserThreadRecord[]>();
  for (const reply of replyDocs) {
    const pid = reply.parentId?.toString();
    if (!pid) continue;
    if (!replyMap.has(pid)) replyMap.set(pid, []);
    replyMap.get(pid)!.push({
      id: reply._id.toString(),
      userId: reply.userId,
      description: reply.description,
      createdAt: reply.createdAt,
    });
  }

  return rootDocs.map((doc) => {
    const id = doc._id.toString();
    const replies = replyMap.get(id) ?? [];
    const latestReply = replies[replies.length - 1];
    return {
      root: {
        id,
        userId: doc.userId,
        description: doc.description,
        createdAt: doc.createdAt,
      },
      replies,
      latestActivity: latestReply ? latestReply.createdAt : doc.createdAt,
    };
  });
}

export async function deleteAllSubmissionsByUser(userId: string): Promise<number> {
  await connectDB();
  const result = await ProspectiveCustomer.deleteMany({ userId });
  return result.deletedCount;
}
