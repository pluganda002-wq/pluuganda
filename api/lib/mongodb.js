import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

/** @type {Promise<MongoClient> | null} */
let clientPromise = null;

if (uri) {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

/**
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDb() {
  if (!clientPromise) {
    throw new Error("MONGODB_URI is not configured");
  }
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB_NAME || "plu_bot");
}

export function isDbConfigured() {
  return Boolean(uri);
}
