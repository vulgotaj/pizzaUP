import prismaClient from '../../prisma';
import type { Prisma } from '../../generated/prisma/client';
import { AppError } from '../../errors/AppError';

// All item mutations and state changes acquire this same parent row lock.
// PostgreSQL holds it until commit/rollback, including while checking item counts.
export async function lockOrder(tx: Prisma.TransactionClient, orderId: string) {
  const rows = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "orders" WHERE "id" = ${orderId} FOR UPDATE`;
  if (!rows.length) throw new AppError('Pedido não encontrado.', 404);
  const order = await tx.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Pedido não encontrado.', 404);
  return order;
}
export function requireDraft(order: { draft: boolean; status: boolean }) {
  if (!order.draft || order.status) throw new AppError('Somente pedidos em rascunho podem ser alterados.', 409);
}
export function withOrderLock<T>(orderId: string, operation: (tx: Prisma.TransactionClient, order: Awaited<ReturnType<typeof lockOrder>>) => Promise<T>) {
  return prismaClient.$transaction(async tx => operation(tx, await lockOrder(tx, orderId)));
}
