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
