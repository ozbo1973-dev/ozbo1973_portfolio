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

  const userIds = [...new Set(docs.map((d) => d.userId))];
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
      sender,
    };
  });
}

export async function getInbox(): Promise<AdminSubmissionRecord[]> {
  return fetchWithSenders({ archivedAt: null }, "createdAt");
}

export async function getArchived(): Promise<AdminSubmissionRecord[]> {
  return fetchWithSenders({ archivedAt: { $ne: null } }, "archivedAt");
}

export async function archiveSubmission(id: string): Promise<void> {
  await connectDB();
  await ProspectiveCustomer.findByIdAndUpdate(id, { archivedAt: new Date() });
}

export async function adminDeleteSubmission(id: string): Promise<void> {
  await connectDB();
  await ProspectiveCustomer.findByIdAndDelete(id);
}
