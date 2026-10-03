import { MongoClient } from "mongodb";
export async function connectDatabase(config) {
  const client = await new MongoClient(config.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  }).connect();
  return { client, db: client.db(config.dbName) };
}
