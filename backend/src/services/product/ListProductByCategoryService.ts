import prismaClient from '../../prisma';
import { AppError } from '../../errors/AppError';

interface ListProductByCategoryServiceProps { category_id: string; }
class ListProductByCategoryService {
  async execute({ category_id }: ListProductByCategoryServiceProps) {
    if (!await prismaClient.category.findUnique({ where: { id: category_id } })) {
      throw new AppError('Categoria não encontrada.', 404);
    }
    return prismaClient.product.findMany({
      where: { category_id, disabled: false },
      select: {
        id: true, name: true, price: true, description: true, banner: true, disabled: true,
        category_id: true, createdAt: true, category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
export { ListProductByCategoryService };
