import { setServers } from "node:dns";
import type { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

export async function getMongoClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI não foi definida.");
  }

  const dnsServer = process.env.MONGODB_DNS_SERVER;

  if (dnsServer) {
    setServers([dnsServer]);
  }

  const clientPromise =
    globalForMongo.mongoClientPromise ?? createMongoClient(uri);

  if (process.env.NODE_ENV !== "production") {
    globalForMongo.mongoClientPromise = clientPromise;
  }

  try {
    return await clientPromise;
  } catch (error) {
    if (globalForMongo.mongoClientPromise === clientPromise) {
      globalForMongo.mongoClientPromise = undefined;
    }

    throw error;
  }
}

async function createMongoClient(uri: string) {
  const { MongoClient } = await import("mongodb");

  return new MongoClient(uri).connect();
}
