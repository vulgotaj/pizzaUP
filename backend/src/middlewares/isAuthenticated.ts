import type { RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';
import prismaClient from '../prisma';
import { env, JWT_AUDIENCE, JWT_ISSUER } from '../config/env';

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization ?? '');
  if (!match?.[1]) {
    res.status(401).json({ error: 'Autenticação necessária.' });
    return;
  }
  let subject: string;
  try {
    const payload = verify(match[1], env.JWT_SECRET, { algorithms: ['HS256'], issuer: JWT_ISSUER, audience: JWT_AUDIENCE });
    if (typeof payload === 'string' || typeof payload.sub !== 'string' || !payload.sub || typeof payload.exp !== 'number') {
      throw new Error('Invalid token claims');
    }
    subject = payload.sub;
  } catch {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    return;
  }
  const user = await prismaClient.user.findUnique({ where: { id: subject }, select: { id: true, role: true } });
  if (!user) {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    return;
  }
  req.userId = user.id;
  req.userRole = user.role;
  next();
};
