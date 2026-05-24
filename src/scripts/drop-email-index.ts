import { MongoClient } from "mongodb";

async function run() {
  const uri = process.env.DATABASE_URI;
  if (!uri) throw new Error("DATABASE_URI is required");

  const client = new MongoClient(uri);
  await client.connect();
  try {
    await client.db().collection("prospectivecustomers").dropIndex("email_1");
    console.log("Dropped email_1 index from prospectivecustomers.");
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("index not found")) {
      console.log("Index email_1 does not exist, nothing to drop.");
    } else {
      throw err;
    }
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
