import { readConfig } from "./config.mjs";
import { connectDatabase } from "./db.mjs";
import { createApp } from "./app.mjs";
try {
  const config = readConfig();
  const { client, db } = await connectDatabase(config);
  const server = createApp({ config, db }).listen(
    config.port,
    "127.0.0.1",
    () => console.log(`${config.mode.toUpperCase()} app: ${config.origin}`),
  );
  server.on("error", async (error) => {
    console.error(`Cannot start ${config.mode}: ${error.code}`);
    await client.close();
    process.exitCode = 1;
  });
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () =>
      server.close(async () => {
        await client.close();
        process.exit(0);
      }),
    );
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exitCode = 1;
}
