import prismaClient from '../../prisma';
import { AppError } from '../../errors/AppError';

class DetailUserService {
  async execute(userId: string) {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError('Sessão inválida ou expirada.', 401);
    return user;
  }
}
export { DetailUserService };
