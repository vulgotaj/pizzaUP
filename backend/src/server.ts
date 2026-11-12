import { createApp } from './app';
import { env } from './config/env';
import prismaClient from './prisma';

const server = createApp().listen(env.PORT, () => {
  console.log(`SERVIDOR RODANDO NA PORTA: ${env.PORT}`);
});
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    const timeout = setTimeout(() => process.exit(1), 10_000).unref();
    server.close(() => {
      void prismaClient.$disconnect().finally(() => { clearTimeout(timeout); process.exit(0); });
    });
  });
}
