import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import connectDB from "@/lib/db/connect";
import ProspectiveCustomer from "@/lib/models/ProspectiveCustomer";

export interface ProspectData {
  firstName: string;
  lastName: string;
  email: string;
  description: string;
}

export interface ProspectRecord extends ProspectData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const verifySession = cache(async (): Promise<{ userId: string; email: string }> => {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/");
  return { userId: session.session.userId, email: session.user.email };
});

export async function createProspect(data: ProspectData): Promise<ProspectRecord> {
  await connectDB();
  const doc = await ProspectiveCustomer.create(data);
  return {
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getSubmissionsByUserId(): Promise<ProspectRecord[]> {
  const { userId, email } = await verifySession();
  await connectDB();
  const query = { $or: [{ userId }, { email, userId: { $exists: false } }, { email, userId: null }] };
  const docs = await ProspectiveCustomer.find(query);

  const unlinked = docs.filter((doc) => !doc.userId);
  if (unlinked.length > 0) {
    await ProspectiveCustomer.updateMany(
      { _id: { $in: unlinked.map((d) => d._id) } },
      { $set: { userId } }
    );
  }

  return docs.map((doc) => ({
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}

export async function updateProspectUserId(id: string, userId: string): Promise<void> {
  await connectDB();
  await ProspectiveCustomer.findByIdAndUpdate(id, { userId });
}
