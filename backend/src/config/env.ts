import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  DATABASE_URL: z.string().url().refine(value => /^postgres(?:ql)?:\/\//.test(value)),
  JWT_SECRET: z.string().min(32),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Never include environment values in startup diagnostics.
  throw new Error(`Configuração inválida: ${parsed.error.issues.map(issue => issue.path.join('.')).join(', ')}`);
}
export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean);
if (corsOrigins.some(origin => {
  try {
    const url = new URL(origin);
    return url.origin !== origin || !['http:', 'https:'].includes(url.protocol) ||
      (env.NODE_ENV === 'production' && url.protocol !== 'https:');
  } catch { return true; }
})) {
  throw new Error('CORS_ORIGINS deve conter origens válidas; produção exige HTTPS.');
}
export const SESSION_SECONDS = 8 * 60 * 60;
export const JWT_ISSUER = 'pizzaUP-api';
export const JWT_AUDIENCE = 'pizzaUP';
