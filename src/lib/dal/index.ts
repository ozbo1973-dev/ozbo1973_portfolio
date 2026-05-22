import connectDB from "@/lib/db/connect";
import ProspectiveCustomer from "@/lib/models/ProspectiveCustomer";

export type { ProspectData, ProspectRecord, UserThread, UserThreadRecord } from "@/lib/dal/prospects";
export { createProspect } from "@/lib/dal/prospects";

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

export async function deleteSubmission(id: string, userId: string): Promise<boolean> {
  await connectDB();
  const deleted = await ProspectiveCustomer.findOneAndDelete({ _id: id, userId });
  return deleted !== null;
}

export async function deleteAllSubmissionsByUser(userId: string): Promise<number> {
  await connectDB();
  const result = await ProspectiveCustomer.deleteMany({ userId });
  return result.deletedCount;
}
