import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { auth, db } from "@/lib/auth/auth";
import connectDB from "@/lib/db/connect";
import ProspectiveCustomer from "@/lib/models/ProspectiveCustomer";

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
}

export interface AdminSubmissionRecord {
  id: string;
  userId: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  replyCount: number;
  sender: {
    name: string;
    email: string;
  };
}

export const verifyAdminSession = cache(async (): Promise<AdminSession> => {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/");

  const userDoc = await db
    .collection("user")
    .findOne({ _id: new ObjectId(session.session.userId) });

  if (!userDoc || userDoc.role !== "admin") redirect("/");

  return {
    userId: session.session.userId,
    email: session.user.email,
    name: session.user.name ?? "",
  };
});

async function fetchWithSenders(
  filter: object,
  sortField: string,
): Promise<AdminSubmissionRecord[]> {
  await connectDB();
  const docs = await ProspectiveCustomer.find(filter).sort({ [sortField]: -1 });

  if (docs.length === 0) return [];

  const rootObjectIds = docs.map((d) => d._id);

  const userIds = [...new Set(docs.map((d) => d.userId))];
  const objectIds = userIds.map((id) => new ObjectId(id));
  const [userDocs, replyDocs] = await Promise.all([
    db.collection("user").find({ _id: { $in: objectIds } }).toArray(),
    ProspectiveCustomer.find({ parentId: { $in: rootObjectIds } }, { parentId: 1 }),
  ]);

  const userMap = new Map(
    userDocs.map((u) => [
      u._id.toString(),
      { name: u.name as string, email: u.email as string },
    ]),
  );

  const replyCountMap = new Map<string, number>();
  for (const reply of replyDocs) {
    const pid = reply.parentId?.toString();
    if (pid) replyCountMap.set(pid, (replyCountMap.get(pid) ?? 0) + 1);
  }

  return docs.map((doc) => {
    const sender = userMap.get(doc.userId) ?? {
      name: "Unknown",
      email: "unknown",
    };
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      archivedAt: doc.archivedAt ?? null,
      replyCount: replyCountMap.get(doc._id.toString()) ?? 0,
      sender,
    };
  });
}

export async function getInbox(): Promise<AdminSubmissionRecord[]> {
  return fetchWithSenders({ archivedAt: null, parentId: null }, "createdAt");
}

export async function getArchived(): Promise<AdminSubmissionRecord[]> {
  return fetchWithSenders({ archivedAt: { $ne: null }, parentId: null }, "archivedAt");
}

export async function archiveSubmission(id: string): Promise<void> {
  await connectDB();
  const archivedAt = new Date();
  await Promise.all([
    ProspectiveCustomer.findByIdAndUpdate(id, { archivedAt }),
    ProspectiveCustomer.updateMany({ parentId: id }, { archivedAt }),
  ]);
}

export async function adminDeleteSubmission(id: string): Promise<void> {
  await connectDB();
  await Promise.all([
    ProspectiveCustomer.findByIdAndDelete(id),
    ProspectiveCustomer.deleteMany({ parentId: id }),
  ]);
}

export interface AdminThread {
  root: AdminSubmissionRecord;
  replies: AdminSubmissionRecord[];
}

export async function createAdminReply(
  rootId: string,
  body: string,
  adminSession: AdminSession,
): Promise<AdminSubmissionRecord> {
  await connectDB();
  const doc = await ProspectiveCustomer.create({
    userId: adminSession.userId,
    description: body,
    parentId: rootId,
  });
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    archivedAt: doc.archivedAt ?? null,
    replyCount: 0,
    sender: { name: adminSession.name, email: adminSession.email },
  };
}

export async function getRootSubmissionOwner(rootId: string): Promise<{ email: string; name: string } | null> {
  await connectDB();
  const submission = await ProspectiveCustomer.findById(rootId);
  if (!submission) return null;

  const userDoc = await db.collection("user").findOne({ _id: new ObjectId(submission.userId) });
  if (!userDoc) return null;

  return { email: userDoc.email as string, name: userDoc.name as string };
}

export async function getThread(rootId: string): Promise<AdminThread | null> {
  await connectDB();

  const rootDoc = await ProspectiveCustomer.findById(rootId);
  if (!rootDoc) return null;

  const replyDocs = await ProspectiveCustomer.find({ parentId: rootId }).sort({ createdAt: 1 });

  const allDocs = [rootDoc, ...replyDocs];
  const userIds = [...new Set(allDocs.map((d) => d.userId))];
  const objectIds = userIds.map((id) => new ObjectId(id));
  const userDocs = await db
    .collection("user")
    .find({ _id: { $in: objectIds } })
    .toArray();
  const userMap = new Map(
    userDocs.map((u) => [
      u._id.toString(),
      { name: u.name as string, email: u.email as string },
    ]),
  );

  function toRecord(doc: typeof rootDoc, replyCount = 0): AdminSubmissionRecord {
    const sender = userMap.get(doc.userId) ?? { name: "Unknown", email: "unknown" };
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      archivedAt: doc.archivedAt ?? null,
      replyCount,
      sender,
    };
  }

  return {
    root: toRecord(rootDoc, replyDocs.length),
    replies: replyDocs.map((d) => toRecord(d)),
  };
}
