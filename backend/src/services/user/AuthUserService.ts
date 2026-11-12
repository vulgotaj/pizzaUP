import { compare, hash, getRounds } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import prismaClient from '../../prisma';
import { AppError } from '../../errors/AppError';
import { env, SESSION_SECONDS, JWT_AUDIENCE, JWT_ISSUER } from '../../config/env';
import { passwordSchema } from '../../schemas/userSchema';

// Perform the same expensive password comparison for unknown accounts.
const dummyHash = hash('invalid-account-password-placeholder', 12);

interface AuthUserServiceProps { email: string; password: string; }
class AuthUserService {
  async execute({ email, password }: AuthUserServiceProps) {
    const user = await prismaClient.user.findFirst({
      where: { email: { equals: email.trim().toLowerCase(), mode: 'insensitive' } },
    });
    const matches = await compare(password, user?.password ?? await dummyHash);
    if (!user || !matches || (env.NODE_ENV === 'production' && !passwordSchema.safeParse(password).success)) {
      throw new AppError('Email ou senha incorretos!', 401);
    }
    if (getRounds(user.password) < 12) {
      await prismaClient.user.update({ where: { id: user.id }, data: { password: await hash(password, 12) } });
    }
    const token = sign({}, env.JWT_SECRET, {
      subject: user.id, expiresIn: SESSION_SECONDS, algorithm: 'HS256', issuer: JWT_ISSUER, audience: JWT_AUDIENCE,
    });
    return { id: user.id, name: user.name, email: user.email, role: user.role, token };
  }
}
export { AuthUserService };
