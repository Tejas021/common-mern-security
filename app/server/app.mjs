import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { ZodError } from "zod";
import { fileURLToPath } from "node:url";
import { requireUser, csrf, verifyPassword, establishLogin } from "./auth.mjs";
import { loginSchema } from "./validation.mjs";
import { routes } from "./routes.mjs";
export function createApp({ config, db }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    helmet({
      strictTransportSecurity: false,
      contentSecurityPolicy: { directives: { "upgrade-insecure-requests": null } },
    }),
  );
  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ extended: false, limit: "16kb" }));
  app.use((req, res, next) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.get("Origin") &&
      req.get("Origin") !== config.origin
    )
      return res.status(403).json({ error: "Origin not allowed" });
    next();
  });
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.get("/api/meta", (_req, res) =>
    res.json({ mode: config.mode, version: "1.0.0" }),
  );
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many login attempts. Wait one minute." },
  });
  app.post(
    "/api/login",
    limiter,
    async (req, res) => {
      const { email, password } = loginSchema.parse(req.body);
      const user = await db.collection("users").findOne({ email });
      if (!user || !(await verifyPassword(password, user.passwordHash)))
        return res.status(401).json({ error: "Invalid email or password" });
      res.json(await establishLogin(res, user, config));
    },
  );
  app.use(
    "/api",
    requireUser(db, config),
    csrf,
    routes({ config, db }),
  );
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "Endpoint not found" }),
  );
  app.get("/admin-report.html", (_req, res) => res.redirect(302, "/admin"));
  app.get(["/admin", "/admin/"], (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.sendFile(fileURLToPath(new URL("../client/dist/index.html", import.meta.url)));
  });
  app.use(
    express.static(fileURLToPath(new URL("../client/dist/", import.meta.url))),
  );
  app.use((err, _req, res, _next) => {
    if (err instanceof ZodError)
      return res.status(400).json({
        error: "Invalid input: check types, lengths and allowed fields",
      });
    const status = err.status === 413 ? 413 : err.status === 400 ? 400 : 500;
    res.status(status).json({
      error:
        status === 413
          ? "Request too large"
          : status === 400
            ? "Invalid request"
            : "Unexpected server error",
    });
    if (status === 500) console.error(err);
  });
  return app;
}
