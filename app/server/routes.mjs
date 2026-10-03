import { Router } from "express";
import { z } from "zod";
import { safeUser, cookieOptions } from "./auth.mjs";
import {
  canAccessPost,
  canAccessAdmin,
  parseProfileUpdate,
} from "./policies.mjs";
import {
  id,
  postSchema,
  postUpdateSchema,
  commentSchema,
} from "./validation.mjs";
export function routes({ db, config }) {
  const router = Router(),
    posts = db.collection("posts"),
    comments = db.collection("comments");
  router.get("/me", (req, res) =>
    res.json({ user: safeUser(req.user), csrfToken: req.auth.csrf }),
  );
  router.get("/shop", async (req, res) => {
    const user = await db.collection("users").findOne({ _id: req.user._id }, { projection: { points: 1 } });
    const purchases = await db.collection("purchases").find({ userId: req.user._id.toString() }).sort({ createdAt: -1 }).limit(5).toArray();
    const reward = await db.collection("demoRewards").findOne({ _id: "community-sticker" });
    const products = await db.collection("demoProducts").find({}).toArray();
    const claims = await db.collection("rewardClaims").countDocuments({ userId: req.user._id.toString() });
    res.json({ points: user.points, products: products.map((product) => ({ id: product._id, name: product.name, price: product.price })), purchases, reward: { stock: reward.stock, claims } });
  });
  router.post("/shop/purchase", async (req, res) => {
    const input = z.object({ productId: z.literal("sticker-pack"), price: z.number().int().min(0).max(5000) }).strict().parse(req.body);
    const product = await db.collection("demoProducts").findOne({ _id: input.productId });
    if (!product) return res.status(404).json({ error: "Product not found" });
    const price = product.price;
    const charge = await db.collection("users").updateOne({ _id: req.user._id, points: { $gte: price } }, { $inc: { points: -price } });
    if (!charge.modifiedCount) return res.status(400).json({ error: "Not enough points" });
    const purchase = { userId: req.user._id.toString(), productId: input.productId, chargedPoints: price, createdAt: new Date() };
    const result = await db.collection("purchases").insertOne(purchase);
    res.status(201).json({ ...purchase, _id: result.insertedId });
  });
  router.post("/rewards/claim", async (req, res) => {
    const rewards = db.collection("demoRewards");
    const stockUpdate = await rewards.updateOne({ _id: "community-sticker", stock: { $gte: 1 } }, { $inc: { stock: -1 } });
    if (!stockUpdate.modifiedCount) return res.status(409).json({ error: "Reward is out of stock" });
    const claim = { userId: req.user._id.toString(), rewardId: "community-sticker", createdAt: new Date() };
    const result = await db.collection("rewardClaims").insertOne(claim);
    res.status(201).json({ ...claim, _id: result.insertedId });
  });
  router.post("/logout", async (req, res) => {
    await db
      .collection("revokedTokens")
      .updateOne(
        { _id: req.auth.jti },
        { $set: { expiresAt: new Date(req.auth.exp * 1000) } },
        { upsert: true },
      );
    res.clearCookie(config.cookieName, cookieOptions).sendStatus(204);
  });
  router.get("/admin/report", (req, res) => {
    if (
      req.auth.role !== "admin" ||
      req.user.role !== "admin"
    )
      return res.status(403).json({ error: "Admin role required" });
    res.json({
      report:
        "Fictional administrator report: 3 community reports awaiting review.",
    });
  });
  router.get("/posts", async (req, res) =>
    res.json(
      await posts
        .find({}, { projection: { privateDraft: 0 } })
        .sort({ createdAt: -1, _id: -1 })
        .toArray(),
    ),
  );
  router.post("/posts", async (req, res) => {
    const post = {
      ...postSchema.parse(req.body),
      ownerId: req.user._id.toString(),
      status: "Published",
      authorName: req.user.displayName,
      createdAt: new Date(),
    };
    const result = await posts.insertOne(post);
    res.status(201).json({ ...post, _id: result.insertedId });
  });
  async function loadPost(req, res, next) {
    req.post = await posts.findOne({ _id: id(req.params.id) });
    if (!req.post) return res.status(404).json({ error: "Post not found" });
    next();
  }
  function ownership(req, res, next) {
    if (!canAccessPost(config.mode, req.user, req.post))
      return res
        .status(403)
        .json({ error: "This private draft belongs to another member" });
    next();
  }
  router.get("/posts/:id", loadPost, ownership, (req, res) =>
    res.json(req.post),
  );
  router.patch("/posts/:id", loadPost, ownership, async (req, res) => {
    const patch = postUpdateSchema.parse(req.body);
    await posts.updateOne({ _id: req.post._id }, { $set: patch });
    res.json({ ...req.post, ...patch });
  });
  router.delete("/posts/:id", loadPost, ownership, async (req, res) => {
    await comments.deleteMany({ postId: req.post._id.toString() });
    await posts.deleteOne({ _id: req.post._id });
    res.sendStatus(204);
  });
  router.get("/posts/:id/comments", loadPost, async (req, res) =>
    res.json(
      await comments
        .find({ postId: req.post._id.toString() })
        .sort({ createdAt: 1 })
        .toArray(),
    ),
  );
  router.post("/posts/:id/comments", loadPost, async (req, res) => {
    const comment = {
      ...commentSchema.parse(req.body),
      postId: req.post._id.toString(),
      authorId: req.user._id.toString(),
      authorName: req.user.displayName,
      createdAt: new Date(),
    };
    const result = await comments.insertOne(comment);
    res.status(201).json({ ...comment, _id: result.insertedId });
  });
  router.get("/users", async (req, res) => {
    res.json(
      await db
        .collection("users")
        .find({}, { projection: { _id: 1, displayName: 1 } })
        .sort({ displayName: 1 })
        .limit(20)
        .toArray(),
    );
  });
  // Search accepts a bounded string and builds its query on the server.
  router.post("/users/search", async (req, res) => {
    const { name } = z.object({ name: z.string().trim().min(1).max(80) }).strict().parse(req.body);
    const filter = { $regex: name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const matches = await db.collection("users")
      .find({ displayName: filter }, { projection: { _id: 1, displayName: 1 } })
      .limit(20).toArray();
    res.json(matches);
  });
  router.get("/users/:id/profile", async (req, res) => {
    const projection = { _id: 1, displayName: 1 };
    const user = await db
      .collection("users")
      .findOne({ _id: id(req.params.id) }, { projection });
    if (!user) return res.status(404).json({ error: "Member not found" });
    res.json(user);
  });
  router.patch("/users/:id/profile", async (req, res) => {
    const targetId = id(req.params.id);
    if (!targetId.equals(req.user._id))
      return res
        .status(403)
        .json({ error: "You can only edit your own profile" });
    const patch = parseProfileUpdate(config.mode, req.body);
    const target = await db.collection("users").findOne({ _id: targetId });
    if (!target) return res.status(404).json({ error: "Member not found" });
    await db.collection("users").updateOne({ _id: targetId }, { $set: patch });
    res.json({ _id: targetId.toString(), displayName: patch.displayName });
  });
  router.route("/profile").post(updateProfile).patch(updateProfile);
  async function updateProfile(req, res) {
    const patch = parseProfileUpdate(config.mode, req.body);
    await db
      .collection("users")
      .updateOne({ _id: req.user._id }, { $set: patch });
    res.json(safeUser({ ...req.user, ...patch }));
  }
  router.get("/admin/posts", async (req, res) => {
    if (!canAccessAdmin(config.mode, req.user))
      return res.status(403).json({ error: "Admin role required" });
    res.json(await posts.find({}).toArray());
  });
  return router;
}
