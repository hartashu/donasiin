// import { MongoClient, Db } from "mongodb";

// const MONGODB_URI = process.env.MONGODB_URI;
// const MONGODB_DB = process.env.MONGODB_DB;

// let cachedClient: MongoClient | null = null;

// export async function connectToDb(): Promise<Db> {
//   if (!MONGODB_URI) {
//     throw new Error(
//       "Please define the MONGODB_URI environment variable in .env"
//     );
//   }

//   if (!MONGODB_DB) {
//     throw new Error(
//       "Please define the MONGODB_DB environment variable in .env"
//     );
//   }

//   if (cachedClient) {
//     console.log("♻️  Reusing existing MongoDB connection.");
//     return cachedClient.db(MONGODB_DB);
//   }

//   try {
//     const client = new MongoClient(MONGODB_URI);

//     console.log("✅  Creating new MongoDB connection.");
//     await client.connect();

//     cachedClient = client;
//     return client.db(MONGODB_DB);
//   } catch (error) {
//     console.error("Failed to connect to MongoDB", error);
//     throw error;
//   }
// }


import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB!;

if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env");
if (!MONGODB_DB) throw new Error("Please define MONGODB_DB in .env");

// 👇 Gunakan interface biar gak pakai `any`
interface CachedConnection {
  client: MongoClient | null;
}

// 👇 Simpan ke global dengan type safety
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
