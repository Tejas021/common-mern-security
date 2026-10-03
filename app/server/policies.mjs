import { profileSchema } from "./validation.mjs";
export function canAccessPost(_mode, user, post) {
  return user.role === "admin" || post.ownerId === user._id.toString();
}
export function canAccessAdmin(_mode, user) { return user.role === "admin"; }
export function parseProfileUpdate(_mode, body) { return profileSchema.parse(body); }
