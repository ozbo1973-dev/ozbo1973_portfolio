import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
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

export const verifySession = cache(async (): Promise<{ userId: string; email: string; name: string }> => {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/");
  return { userId: session.session.userId, email: session.user.email, name: session.user.name ?? "" };
});

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

export async function getThreadsByUserId(userId: string): Promise<UserThread[]> {
  await connectDB();

  const rootDocs = await ProspectiveCustomer.find({
    userId,
    archivedAt: null,
    parentId: null,
  }).sort({ createdAt: -1 });

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
    replyMap.get(pid)!.push({
      id: reply._id.toString(),
      userId: reply.userId,
      description: reply.description,
      createdAt: reply.createdAt,
    });
  }

  const threads: UserThread[] = rootDocs.map((doc) => {
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

  return threads.sort((a, b) => b.latestActivity.getTime() - a.latestActivity.getTime());
}
