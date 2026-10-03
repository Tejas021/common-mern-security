import { randomBytes } from "node:crypto";
export function readConfig(env = process.env) {
  const mode = "fixed";
  if (env.MODE && env.MODE !== mode)
    throw new Error("This student reference supports fixed mode only");
  const port = Number(env.PORT ?? 4200);
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error("PORT must be 1024–65535");
  const mongoUri =
    env.MONGO_URI ?? `mongodb://127.0.0.1:27017/mern_seminar_${mode}`;
  const uri = new URL(mongoUri);
  const dbName = uri.pathname.slice(1);
  if (
    uri.protocol !== "mongodb:" ||
    !["127.0.0.1", "localhost", "[::1]"].includes(uri.hostname) ||
    uri.username ||
    uri.password ||
    uri.search ||
    !/^mern_seminar_(fixed|test_[a-zA-Z0-9_]+)$/.test(dbName)
  )
    throw new Error(
      "Only loopback MongoDB URLs with a seminar database are allowed",
    );
  if (
    !dbName.startsWith("mern_seminar_test_") &&
    dbName !== `mern_seminar_${mode}`
  ) {
    throw new Error(
      "The reference uses mern_seminar_fixed. Unset MONGO_URI to use its local default.",
    );
  }
  if (env.JWT_SECRET && env.JWT_SECRET.length < 32)
    throw new Error("JWT_SECRET must have at least 32 characters");
  return {
    mode,
    port,
    origin: `http://127.0.0.1:${port}`,
    mongoUri,
    dbName,
    cookieName: `common_jwt_${mode}`,
    jwtSecret: env.JWT_SECRET ?? randomBytes(32).toString("hex"),
  };
}
