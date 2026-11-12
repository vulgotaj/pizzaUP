import prismaClient from '../../prisma';
import { AppError } from '../../errors/AppError';
import { lockOrder, requireDraft } from './withOrderLock';

interface RemoveItemProps { item_id: string; }
class RemoveItemOrderService {
  async execute({ item_id }: RemoveItemProps) {
    return prismaClient.$transaction(async tx => {
      const item = await tx.item.findUnique({ where: { id: item_id }, select: { order_id: true } });
      if (!item) throw new AppError('Item não encontrado.', 404);
      requireDraft(await lockOrder(tx, item.order_id));
      const result = await tx.item.deleteMany({ where: { id: item_id, order_id: item.order_id } });
      if (!result.count) throw new AppError('Item não encontrado.', 404);
      return { message: 'Item removido com sucesso!' };
    });
  }
}
export { RemoveItemOrderService };
