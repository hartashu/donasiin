import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

let cachedClient: MongoClient | null = null;

export async function connectToDb(): Promise<Db> {
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in .env"
    );
  }

  if (!MONGODB_DB) {
    throw new Error(
      "Please define the MONGODB_DB environment variable in .env"
    );
  }

  if (cachedClient) {
    console.log("♻️  Reusing existing MongoDB connection.");
    return cachedClient.db(MONGODB_DB);
  }

  try {
    const client = new MongoClient(MONGODB_URI);

    console.log("✅  Creating new MongoDB connection.");
    await client.connect();

    cachedClient = client;
    return client.db(MONGODB_DB);
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}
