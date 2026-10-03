import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { hashPassword } from "./auth.mjs";
let hashes;
export async function seedDatabase(db) {
  if (
    !/^mern_seminar_(fixed|test_[a-zA-Z0-9_]+)$/.test(
      db.databaseName,
    )
  )
    throw new Error("Refusing to reset a non-seminar database");
  hashes ??= Promise.all([1, 2, 3].map(() => hashPassword("CommonDemo!2026")));
  const passwordHashes = await hashes;
  for (const name of [
    "users",
    "posts",
    "comments",
    "sessions",
    "revokedTokens",
    "purchases",
    "rewardClaims",
    "demoRewards",
    "demoProducts",
  ])
    await db.collection(name).deleteMany({});
  await db
    .collection("revokedTokens")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const people = [
    ["Hermione", "hermione@common.demo", "member"],
    ["Ron", "ron@common.demo", "member"],
    ["Luna", "admin@common.demo", "admin"],
  ];
  await db.collection("users").insertMany(
    people.map(([displayName, email, role], i) => ({
      _id: new ObjectId(`00000000000000000000000${i + 1}`),
      displayName,
      email,
      role,
      passwordHash: passwordHashes[i],
      authVersion: randomBytes(16).toString("hex"),
      // Fictional private contact number; never shown on the public profile.
      phoneNumber: `+1 202-555-010${i + 1}`,
      points: i === 0 ? 1000 : 500,
    })),
  );
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("posts").insertMany([
    {
      _id: new ObjectId("000000000000000000000101"),
      ownerId: "000000000000000000000001",
      authorName: "Hermione",
      title: "The long way home",
      description:
        "Took a different route after work and found a tiny bookshop I’ve walked past a hundred times. No algorithm, just a wrong turn.\n\nWhat’s a place in your neighbourhood that deserves more love?",
      privateDraft:
        "Unpublished follow-up: I might leave my job and open a bookshop. Not ready to share this yet.",
      status: "Published",
      createdAt: new Date("2026-09-30T16:20:00Z"),
    },
    {
      _id: new ObjectId("000000000000000000000102"),
      ownerId: "000000000000000000000002",
      authorName: "Ron",
      title: "A little less scrolling",
      description:
        "Trying something small this week: my phone stays in my bag on the morning walk. Today I noticed the same dog waiting outside the bakery. Apparently we’re both regulars.\n\nAnyone else trying to spend a little more time offline?",
      privateDraft:
        "Unpublished personal update: taking a month off for treatment. Please keep this private until I choose to share it.",
      status: "Published",
      createdAt: new Date("2026-09-30T09:40:00Z"),
    },
  ]);
  await db.collection("comments").insertOne({
    postId: "000000000000000000000101",
    authorId: "000000000000000000000002",
    authorName: "Ron",
    body: "The little bakery on the corner. Go early — the cinnamon rolls disappear by ten.",
    createdAt: new Date("2026-09-30T17:00:00Z"),
  });
  await db.collection("demoRewards").insertOne({
    _id: "community-sticker",
    name: "Community sticker pack",
    stock: 1,
  });
  await db.collection("demoProducts").insertOne({
    _id: "sticker-pack",
    name: "Community sticker pack",
    price: 500,
  });
}
