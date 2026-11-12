import { env } from '../config/env';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const prismaClient = new PrismaClient({ adapter });

export default prismaClient;
