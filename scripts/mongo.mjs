import { mkdir } from "node:fs/promises";
import { MongoMemoryServer } from "mongodb-memory-server";
await mkdir(".local/mongo", { recursive: true });
try {
  const mongo = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      portGeneration: false,
      ip: "127.0.0.1",
      dbPath: ".local/mongo",
      storageEngine: "wiredTiger",
    },
  });
  console.log(
    "Local MongoDB ready on 127.0.0.1:27017. Keep this terminal open.",
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, async () => {
      await mongo.stop({ doCleanup: false });
      process.exit(0);
    });
} catch (error) {
  console.error(
    `MongoDB failed: ${error.message}\nPrepare the binary online first, or use docker compose up -d.`,
  );
  process.exitCode = 1;
}
