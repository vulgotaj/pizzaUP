import { createHash } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';

const message = { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' };
const options = { windowMs: 15 * 60 * 1000, standardHeaders: 'draft-8' as const, legacyHeaders: false, message };
export const apiLimit = rateLimit({ ...options, windowMs: 60 * 1000, limit: 300 });
export const loginIpLimit = rateLimit({ ...options, limit: 30, skipSuccessfulRequests: true });
export const loginAccountLimit = rateLimit({
  ...options, limit: 10, skipSuccessfulRequests: true,
  keyGenerator: req => createHash('sha256').update(String(req.body?.email ?? '').trim().toLowerCase()).digest('hex'),
});
export const createUserLimit = rateLimit({ ...options, limit: 20 });
