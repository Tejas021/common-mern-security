# Common: securing a MERN app

A local student reference app from the **Securing MERN Applications** seminar. Explore React, Express, Node.js and MongoDB code with the demonstrated security repairs enabled.

**[Download the short student guide](docs/mern-security-student-guide.pdf)** for session pointers and free/paid course links.

## What you can try

- Sign in, publish posts and add comments.
- Edit your own profile and browse public profiles.
- Compare member and administrator access to private drafts.
- Try the fictional points shop and one-item reward.
- Read [the security code map](SECURITY-MAP.txt) to find authentication, permissions, validation, CSRF, safe rendering and response privacy.

## Clone and run

Install a supported **Node.js version >=22.12** and npm. The first install and MongoDB download need internet.

```sh
git clone https://github.com/Tejas021/common-mern-security.git
cd common-mern-security
npm ci
npm run build
npm run mongo
```

Keep that terminal running. Open a second terminal in the same folder:

```sh
npm run seed -- --confirm-reset
npm start
```

Open **[http://127.0.0.1:4200](http://127.0.0.1:4200)**. Use `127.0.0.1` as the browser hostname to match the app's origin policy.

## Fictional accounts

| Email | Access |
|---|---|
| `hermione@common.demo` | Member |
| `ron@common.demo` | Member |
| `admin@common.demo` | Administrator, displayed as Luna |

All three use **`CommonDemo!2026`**. Sign-in expires after 15 minutes; sign in again when needed. The default signing key changes when the server restarts.

## Learn from the code

| Seminar control | Where to read |
|---|---|
| JWT verification, password hashing, revocation and CSRF | [`auth.mjs`](app/server/auth.mjs) |
| Ownership and administrator permissions | [`policies.mjs`](app/server/policies.mjs), [`routes.mjs`](app/server/routes.mjs) |
| Strict input contracts and permitted fields | [`validation.mjs`](app/server/validation.mjs) |
| Safe comment rendering | [`CommentBody.jsx`](app/client/src/components/CommentBody.jsx) |
| Headers, origin checks, request limits and login limits | [`app.mjs`](app/server/app.mjs) |
| Public response fields, trusted pricing and stock update | [`routes.mjs`](app/server/routes.mjs) |

Pick one route in your own project. Explain its identity, permission, input and response rules. Check that the intended action succeeds and a forbidden action cannot change protected state.

## Checks, reset and troubleshooting

```sh
npm test
```

The smoke check uses a separate temporary MongoDB process. Seeding the app replaces its fictional data and invalidates old logins; run it only when you are ready to lose your practice changes. Stop the app and database terminals with Ctrl+C.

If ports 27017 or 4200 are occupied, stop the other local process. If your terminal already defines `MONGO_URI` or `MODE`, remove those overrides or start a fresh terminal. If MongoDB download fails and Docker is installed, use `docker compose up -d` **instead of** `npm run mongo`. See [README.txt](README.txt) for additional details.

## Local reference scope

This is teaching software bound to loopback. Local HTTP uses `Secure=false` cookies, HSTS is disabled, database access is locally unauthenticated, and rate-limit state is process-local. Shop/reward examples are simplified: stock decrement is atomic, but related writes are not coordinated by a transaction and retries are not fully idempotent. Review these assumptions before adapting the code for a deployed project.

The inherited lockfile uses `registry.npmmirror.com`. Check that your network permits access and that this meets your institution's registry policy.
