import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { ObjectId } from "mongodb";
const derive = promisify(scrypt);
const options = { N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 };
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await derive(password, salt, 64, options);
  return `scrypt:${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password, encoded) {
  const [algorithm, salt, value] = encoded.split(":");
  if (algorithm !== "scrypt" || !salt || !value) return false;
  const actual = await derive(password, salt, 64, options);
  const expected = Buffer.from(value, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function safeUser(user) {
  return {
    _id: user._id.toString(),
    displayName: user.displayName,
    email: user.email,
    role: user.role,
  };
}
export const cookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: false,
};
export function credential(req, config) {
  const authorization = req.get("Authorization");
  if (authorization)
    return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const cookie = (req.get("Cookie") || "")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(config.cookieName + "="));
  try {
    return cookie
      ? decodeURIComponent(cookie.slice(config.cookieName.length + 1))
      : "";
  } catch {
    return "";
  }
}
export async function issueToken(user, config, overrides = {}) {
  return new SignJWT({
    role: user.role,
    csrf: randomBytes(32).toString("hex"),
    version: user.authVersion,
    ...overrides,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user._id.toString())
    .setIssuer(config.origin)
    .setAudience("common-api")
    .setJti(randomBytes(16).toString("hex"))
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(Buffer.from(config.jwtSecret));
}
export async function establishLogin(res, user, config) {
  const token = await issueToken(user, config);
  res.cookie(config.cookieName, token, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  return { user: safeUser(user), csrfToken: decodeJwt(token).csrf };
}
export function requireUser(db, config) {
  return async (req, res, next) => {
    const token = credential(req, config);
    if (!token) return res.status(401).json({ error: "Please sign in" });
    let claims;
    try {
      claims = (await jwtVerify(token, Buffer.from(config.jwtSecret), {
        algorithms: ["HS256"],
        issuer: config.origin,
        audience: "common-api",
        requiredClaims: ["sub", "iat", "exp", "jti"],
      })).payload;
      if (
        !/^[a-f0-9]{24}$/.test(claims.sub) ||
        typeof claims.exp !== "number" ||
        claims.exp <= Date.now() / 1000 ||
        typeof claims.jti !== "string"
      )
        throw new Error();
    } catch {
      return res
        .status(401)
        .json({ error: "Invalid or expired JWT. Please sign in." });
    }
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(claims.sub) });
    if (
      !user ||
      claims.version !== user.authVersion ||
      (await db.collection("revokedTokens").findOne({ _id: claims.jti }))
    )
      return res
        .status(401)
        .json({ error: "Login expired or revoked. Please sign in." });
    req.user = user;
    req.auth = claims;
    next();
  };
}
export function csrf(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const expected = req.auth.csrf;
  const received = req.get("X-CSRF-Token");
  if (
    typeof expected !== "string" ||
    !received ||
    !/^[0-9a-f]{64}$/.test(received) ||
    received.length !== expected.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  )
    return res
      .status(403)
      .json({ error: "Invalid CSRF token. Sign in and retry." });
  next();
}
