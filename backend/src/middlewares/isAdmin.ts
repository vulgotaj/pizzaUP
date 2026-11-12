import type { RequestHandler } from 'express';

export const isAdmin: RequestHandler = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    res.status(403).json({ error: 'Acesso restrito à administração.' });
    return;
  }
  next();
};
