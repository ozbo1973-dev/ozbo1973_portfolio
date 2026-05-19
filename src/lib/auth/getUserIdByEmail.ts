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

export async function getUserIdAndRoleByEmail(
  email: string
): Promise<{ id: string; role: string | null } | null> {
  const client = new MongoClient(process.env.DATABASE_URI!);
  try {
    await client.connect();
    const db = client.db();
    const user = await db.collection("user").findOne({ email });
    if (!user) return null;
    return { id: user._id.toString(), role: (user.role as string) ?? null };
  } finally {
    await client.close();
  }
}

export async function getUserByEmail(
  email: string
): Promise<{ id: string; emailVerified: boolean } | null> {
  const client = new MongoClient(process.env.DATABASE_URI!);
  try {
    await client.connect();
    const db = client.db();
    const user = await db.collection("user").findOne({ email });
    if (!user) return null;
    return { id: user._id.toString(), emailVerified: Boolean(user.emailVerified) };
  } finally {
    await client.close();
  }
}
