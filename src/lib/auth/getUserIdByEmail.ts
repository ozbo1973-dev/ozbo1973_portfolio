import { MongoClient } from "mongodb";

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const client = new MongoClient(process.env.DATABASE_URI!);
  try {
    await client.connect();
    const db = client.db();
    const user = await db.collection("user").findOne({ email });
    return user?._id?.toString() ?? null;
  } finally {
    await client.close();
  }
}
