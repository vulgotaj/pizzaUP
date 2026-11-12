import prismaClient from '../../prisma';
import { hash } from 'bcryptjs';
import { AppError } from '../../errors/AppError';
import { passwordSchema } from '../../schemas/userSchema';

interface CreateUserProps { name: string; email: string; password: string; }

class CreateUserService {
  async execute({ name, email, password }: CreateUserProps) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!passwordSchema.safeParse(password).success) {
      throw new AppError('Use uma senha com pelo menos 12 caracteres e no máximo 72 bytes.');
    }
    const existing = await prismaClient.user.findFirst({ where: { email: { equals: normalizedEmail, mode: 'insensitive' } } });
    if (existing) throw new AppError('Usuário já existe.', 409);
    return prismaClient.user.create({
      data: { name: name.trim(), email: normalizedEmail, password: await hash(password, 12), role: 'STAFF' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }
}
export { CreateUserService };
