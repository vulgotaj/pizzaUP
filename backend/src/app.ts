import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOrigins, env } from './config/env';
import { router } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { apiLimit } from './middlewares/rateLimits';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY_HOPS);
  app.use(helmet({ strictTransportSecurity: env.NODE_ENV === 'production' ? { maxAge: 31536000 } : false }));
  app.use(cors({ origin: corsOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
  app.use(apiLimit);
  app.use(express.json({ limit: '100kb', inflate: false }));
  app.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
  app.use(router);
  app.use(errorHandler);
  return app;
}
