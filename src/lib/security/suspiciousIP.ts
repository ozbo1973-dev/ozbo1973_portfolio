import connectDB from "../db/connect";
import SuspiciousID from "../models/SuspiciousID";

export async function isSuspiciousIP(ip: string): Promise<boolean> {
  await connectDB();
  const found = await SuspiciousID.findOne({ ip });
  return !!found;
}

export async function addSuspiciousIP(ip: string, reason: string) {
  await connectDB();
  await SuspiciousID.updateOne(
    { ip },
    { $setOnInsert: { ip, reason, createdAt: new Date() } },
    { upsert: true }
  );
}
