import { AppError } from '../../errors/AppError';
import { withOrderLock } from './withOrderLock';

interface FinishOrderProps { order_id: string; }
class FinishOrderService {
  async execute({ order_id }: FinishOrderProps) {
    return withOrderLock(order_id, async (tx, order) => {
      if (order.draft || order.status) throw new AppError('Somente pedidos enviados e pendentes podem ser finalizados.', 409);
      return tx.order.update({
        where: { id: order_id }, data: { status: true },
        select: { id: true, table: true, name: true, draft: true, status: true, createdAt: true },
      });
    });
  }
}
export { FinishOrderService };
