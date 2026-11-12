import { AppError } from '../../errors/AppError';
import { requireDraft, withOrderLock } from './withOrderLock';

interface SendOrderProps { name: string; order_id: string; }
class SendOrderService {
  async execute({ name, order_id }: SendOrderProps) {
    return withOrderLock(order_id, async (tx, order) => {
      requireDraft(order);
      if (await tx.item.count({ where: { order_id } }) === 0) {
        throw new AppError('Adicione pelo menos um item antes de enviar o pedido.', 409);
      }
      return tx.order.update({
        where: { id: order_id }, data: { draft: false, name },
        select: { id: true, table: true, name: true, draft: true, status: true, createdAt: true },
      });
    });
  }
}
export { SendOrderService };
