import "server-only";
import { verifySession } from "@/lib/dal/session";
import connectDB from "@/lib/db/connect";
import ProspectiveCustomer from "@/lib/models/ProspectiveCustomer";

export interface ProspectData {
  userId: string;
  description: string;
  parentId?: string;
}

export interface ProspectRecord {
  id: string;
  userId: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserThreadRecord {
  id: string;
  userId: string;
  description: string;
  createdAt: Date;
}

export interface UserThread {
  root: UserThreadRecord;
  replies: UserThreadRecord[];
  latestActivity: Date;
}

export async function createProspect(data: ProspectData): Promise<ProspectRecord> {
  await connectDB();
  const doc = await ProspectiveCustomer.create(data);
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getSubmissionsByUserId(): Promise<ProspectRecord[]> {
  const { userId } = await verifySession();
  await connectDB();
  const docs = await ProspectiveCustomer.find({ userId }).sort({ createdAt: -1 });

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

function toUserThreadRecord(doc: {
  _id: { toString(): string };
  userId: string;
  description: string;
  createdAt: Date;
}): UserThreadRecord {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    description: doc.description,
    createdAt: doc.createdAt,
  };
}

export async function buildUserThreads(rootDocs: Array<{
  _id: { toString(): string };
  userId: string;
  description: string;
  createdAt: Date;
}>): Promise<UserThread[]> {
  if (rootDocs.length === 0) return [];

  const rootIds = rootDocs.map((d) => d._id);
  const replyDocs = await ProspectiveCustomer.find({
    parentId: { $in: rootIds },
  }).sort({ createdAt: 1 });

  const replyMap = new Map<string, UserThreadRecord[]>();
  for (const reply of replyDocs) {
    const pid = reply.parentId?.toString();
    if (!pid) continue;
    if (!replyMap.has(pid)) replyMap.set(pid, []);
    replyMap.get(pid)!.push(toUserThreadRecord(reply));
  }

  return rootDocs.map((doc) => {
    const root = toUserThreadRecord(doc);
    const replies = replyMap.get(root.id) ?? [];
    const latestReply = replies[replies.length - 1];
    return {
      root,
      replies,
      latestActivity: latestReply ? latestReply.createdAt : doc.createdAt,
    };
  });
}

export async function getThreadsByUserId(userId: string): Promise<UserThread[]> {
  await connectDB();

  const rootDocs = await ProspectiveCustomer.find({
    userId,
    archivedAt: null,
    parentId: null,
  }).sort({ createdAt: -1 });

  const threads = await buildUserThreads(rootDocs);
  return threads.sort((a, b) => b.latestActivity.getTime() - a.latestActivity.getTime());
}

export type DeleteSubmissionOutcome =
  | { deleted: true }
  | { deleted: false; blocked?: true };

export async function deleteSubmission(id: string): Promise<DeleteSubmissionOutcome> {
  const { userId } = await verifySession();
  await connectDB();
  const adminReplies = await ProspectiveCustomer.find({
    parentId: id,
    userId: { $ne: userId },
  });
  if (adminReplies.length > 0) {
    return { deleted: false, blocked: true };
  }
  const deleted = await ProspectiveCustomer.findOneAndDelete({ _id: id, userId });
  if (deleted !== null) {
    await ProspectiveCustomer.deleteMany({ parentId: id, userId });
  }
  return { deleted: deleted !== null };
}

export async function userArchiveSubmission(id: string): Promise<void> {
  const { userId } = await verifySession();
  await connectDB();
  const archivedAt = new Date();
  const root = await ProspectiveCustomer.findOneAndUpdate(
    { _id: id, userId },
    { archivedAt },
  );
  if (!root) return;
  await ProspectiveCustomer.updateMany({ parentId: id }, { archivedAt });
}

export async function getArchivedThreadsByUserId(): Promise<UserThread[]> {
  const { userId } = await verifySession();
  await connectDB();

  const rootDocs = await ProspectiveCustomer.find({
    userId,
    archivedAt: { $ne: null },
    parentId: null,
  }).sort({ archivedAt: -1 });

  return buildUserThreads(rootDocs);
}

export async function createUserReply(
  rootId: string,
  userId: string,
  body: string,
): Promise<UserThreadRecord> {
  await connectDB();
  const rootDoc = await ProspectiveCustomer.findById(rootId);
  if (!rootDoc || rootDoc.userId !== userId) {
    throw new Error("Submission not found or does not belong to user.");
  }
  const doc = await ProspectiveCustomer.create({
    userId,
    description: body,
    parentId: rootId,
  });
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    description: doc.description,
    createdAt: doc.createdAt,
  };
}
