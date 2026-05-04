import connectDB from "@/lib/db/connect";
import ProspectiveCustomer from "@/lib/models/ProspectiveCustomer";
import SuspiciousID from "@/lib/models/SuspiciousID";

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

export async function getSubmissionsByUserId(userId: string, email?: string): Promise<ProspectRecord[]> {
  await connectDB();
  const query = email
    ? { $or: [{ userId }, { email, userId: { $exists: false } }, { email, userId: null }] }
    : { userId };
  const docs = await ProspectiveCustomer.find(query);

  // Backfill userId on any docs matched only by email (race condition recovery)
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

export async function isIPSuspicious(ip: string): Promise<boolean> {
  await connectDB();
  const found = await SuspiciousID.findOne({ ip });
  return !!found;
}

export async function recordSuspiciousIP(ip: string, reason: string): Promise<void> {
  await connectDB();
  await SuspiciousID.updateOne(
    { ip },
    { $setOnInsert: { ip, reason, createdAt: new Date() } },
    { upsert: true }
  );
}
