import { requireDraft, withOrderLock } from './withOrderLock';

interface DeleteOrderProps { order_id: string; }
class DeleteOrderService {
  async execute({ order_id }: DeleteOrderProps) {
    return withOrderLock(order_id, async (tx, order) => {
      requireDraft(order);
      await tx.order.delete({ where: { id: order_id } });
      return { message: 'Pedido deletado com sucesso!' };
    });
  }
}
export { DeleteOrderService };
