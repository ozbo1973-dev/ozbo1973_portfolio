import { MongoClient } from "mongodb";

export interface SeedUser {
  name: string;
  email: string;
  role: "admin" | "user";
  emailVerified: boolean;
}

export interface SeedUserWithId extends SeedUser {
  id: string;
}

export interface SeedProspect {
  firstName: string;
  lastName: string;
  email: string;
  description: string;
  userId: string;
}

export function buildSeedUsers(): SeedUser[] {
  return [
    {
      name: "Brady Bovero",
      email: "bbbove20@gmail.com",
      role: "admin",
      emailVerified: true,
    },
    {
      name: "John Doe",
      email: "bbbove20+Test1@gmail.com",
      role: "user",
      emailVerified: true,
    },
    {
      name: "Jane Doe",
      email: "bbbove20+Test2@gmail.com",
      role: "user",
      emailVerified: true,
    },
  ];
}

export function buildLinkedProspects(users: SeedUserWithId[]): SeedProspect[] {
  return users.map((user) => {
    const [firstName, ...rest] = user.name.split(" ");
    const lastName = rest.join(" ");
    return {
      firstName,
      lastName,
      email: user.email,
      description: `Seed record for ${user.name}`,
      userId: user.id,
    };
  });
}

async function seed() {
  const uri = process.env.DATABASE_URI;
  if (!uri) throw new Error("DATABASE_URI is required");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  // Drop BetterAuth and prospectivecustomers collections
  const collections = ["user", "session", "account", "verification", "prospectivecustomers"];
  for (const name of collections) {
    await db.collection(name).deleteMany({});
  }

  // Insert users
  const seedUsers = buildSeedUsers();
  const insertedUsers: SeedUserWithId[] = [];

  for (const user of seedUsers) {
    const result = await db.collection("user").insertOne({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    insertedUsers.push({ ...user, id: result.insertedId.toString() });
  }

  // Insert linked ProspectiveCustomer records
  const prospects = buildLinkedProspects(insertedUsers);
  for (const prospect of prospects) {
    await db.collection("prospectivecustomers").insertOne({
      ...prospect,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await client.close();
  console.log("Seed complete.");
}

// Run when executed directly
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
