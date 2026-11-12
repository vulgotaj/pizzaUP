import { z } from 'zod';

export const passwordSchema = z.string()
  .min(12, 'A senha deve ter pelo menos 12 caracteres.')
  .refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'A senha deve ter no máximo 72 bytes.');
const emailSchema = z.email().max(254).transform(value => value.toLowerCase());

export const createUserSchema = z.object({
  body: z.object({ name: z.string().trim().min(3).max(100), email: emailSchema, password: passwordSchema }),
});
export const authUserSchema = z.object({
  body: z.object({ email: emailSchema, password: z.string().min(1).max(256) }),
});
