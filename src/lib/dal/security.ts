import "server-only";
import connectDB from "@/lib/db/connect";
import SuspiciousID from "@/lib/models/SuspiciousID";

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
