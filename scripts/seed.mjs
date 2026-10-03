import { readConfig } from "../app/server/config.mjs";
import { connectDatabase } from "../app/server/db.mjs";
import { seedDatabase } from "../app/server/fixtures.mjs";
if (!process.argv.includes("--confirm-reset")) throw new Error("Usage: npm run seed -- --confirm-reset (replaces this local app's fictional data)");
const config = readConfig();
const { client, db } = await connectDatabase(config);
try { await seedDatabase(db); console.log(`Reset ${config.dbName}; old logins invalidated.`); }
finally { await client.close(); }
