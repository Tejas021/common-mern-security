import { z } from "zod";
import { ObjectId } from "mongodb";
const text = (max) => z.string().trim().min(1).max(max);
export const loginSchema = z
  .object({
    email: z.string().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();
export const postSchema = z
  .object({
    title: text(100),
    description: text(2000),
    privateDraft: z.string().trim().max(2000).default(""),
  })
  .strict();
export const postUpdateSchema = z
  .object({
    title: text(100).optional(),
    description: text(2000).optional(),
    privateDraft: z.string().trim().max(2000).optional(),
  })
  .strict()
  .refine((x) => Object.keys(x).length > 0);
export const commentSchema = z.object({ body: text(2000) }).strict();
export const profileSchema = z.object({ displayName: text(80) }).strict();
export function id(value) {
  if (!/^[a-fA-F0-9]{24}$/.test(value))
    throw Object.assign(new Error("Invalid post ID"), { status: 400 });
  return new ObjectId(value);
}
