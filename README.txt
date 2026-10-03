COMMON - MERN SECURITY STUDENT REFERENCE APP

This is the Common social app used in the seminar, packaged with the demonstrated repairs active. It includes React source, Express routes, MongoDB fixtures, login, posts/comments, profiles, public People responses, an admin screen, and the shop/reward examples. Optional browser-only moderation and link-preview simulations are covered in the study notes.

REQUIREMENTS
Node.js 22.12 or newer and npm. Use a currently supported Node release satisfying this requirement. The first dependency install and MongoDB binary download need internet. No paid service or cloud database is required.
The inherited lockfile downloads npm packages from registry.npmmirror.com. That registry must be accessible for npm ci; review registry policy before using this in a managed college environment.

QUICK START
Unzip this folder. Open a terminal inside common-student-app:

  npm ci
  npm run build
  npm run mongo

Leave that terminal running. Open a second terminal in the same folder:

  npm run seed -- --confirm-reset
  npm start

Open http://127.0.0.1:4200 in your browser.

If you have an old MONGO_URI or MODE set in your terminal, open a fresh terminal without those overrides. PORT can be changed; visit the matching 127.0.0.1 URL. Do not use localhost as the browser hostname because the Origin policy uses 127.0.0.1.

SAMPLE ACCOUNTS - ALL FICTIONAL
hermione@common.demo  (member)
ron@common.demo       (member)
admin@common.demo     (administrator, displayed as Luna)
Password for each: CommonDemo!2026

Use the member accounts to publish posts, write comments and edit your own display name. Public profiles expose selected fields. Sign in as the admin to see the separate administrator view. Private drafts belong to their author and administrators. Sign-in expires after 15 minutes; sign in again. Restarting the server changes its default signing key and invalidates earlier logins.

STUDY THE CODE
Read SECURITY-MAP.txt alongside the student handbook. Use npm test for a small local smoke check of login, profiles, comments, access controls and logout.

RESET AND STOP
Seeding replaces this app's fictional users, posts, comments and shop data, and invalidates previous logins. Run it only when ready to lose changes in this learning database. Stop both running terminals with Ctrl+C. Local MongoDB data remains under .local/mongo. Do not run the tests during manual practice; tests use a separate temporary database process but consume system resources.

OPTIONAL DOCKER DATABASE
If MongoDB download fails and Docker is installed, use docker compose up -d instead of npm run mongo. Do not run both. Stop Docker MongoDB with docker compose down; named-volume data remains until explicitly removed. If port 27017 or 4200 is already occupied, stop the other local process before starting this app.

LOCAL REFERENCE LIMITS
The server and database launcher bind to loopback. This remains teaching software: local HTTP cookies have Secure=false, HSTS is disabled, the database uses local unauthenticated settings, and login limits are process-local. Purchase and reward writes are simplified multi-step examples; stock decrement is atomic, but related records are not coordinated by a transaction and requests are not fully idempotent. Do not publish this unchanged as a production service. The original seminar project is preserved separately.
