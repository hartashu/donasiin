import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB!;

if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env");
if (!MONGODB_DB) throw new Error("Please define MONGODB_DB in .env");

interface CachedConnection {
  client: MongoClient | null;
}

const globalWithMongo = globalThis as typeof globalThis & {
  _mongo?: CachedConnection;
};

const cached: CachedConnection = globalWithMongo._mongo ?? { client: null };

export async function connectToDb(): Promise<Db> {
  if (cached.client) {
    console.log("♻️  Reusing global MongoDB connection");
    return cached.client.db(MONGODB_DB);
  }

  console.log("✅  Creating new MongoDB connection");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  cached.client = client;
  globalWithMongo._mongo = cached;

  return client.db(MONGODB_DB);
}
