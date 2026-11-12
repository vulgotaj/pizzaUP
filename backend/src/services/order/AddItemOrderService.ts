import { AppError } from '../../errors/AppError';
import { requireDraft, withOrderLock } from './withOrderLock';

interface ItemProps { order_id: string; product_id: string; amount: number; }
class AddItemOrderService {
  async execute({ amount, order_id, product_id }: ItemProps) {
    return withOrderLock(order_id, async (tx, order) => {
      requireDraft(order);
      const product = await tx.product.findFirst({ where: { id: product_id, disabled: false } });
      if (!product) throw new AppError('Produto não encontrado ou arquivado.', 404);
      return tx.item.create({
        data: { order_id, product_id, amount },
        select: {
          id: true, amount: true, order_id: true, product_id: true, createdAt: true,
          product: { select: { id: true, name: true, price: true, description: true, banner: true } },
        },
      });
    });
  }
}
export { AddItemOrderService };
