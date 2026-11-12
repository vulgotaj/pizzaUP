'use server';

import { apiClient } from '@/lib/api';
import { requireAdminToken } from '@/lib/auth';
import { Order } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getOrdersAction(): Promise<Order[]> {
  const token = await requireAdminToken();
  return (await apiClient<Order[]>('/orders?draft=false', { token })).filter(order => !order.status);
}
export async function getOrderDetailAction(orderId: string): Promise<Order> {
  const token = await requireAdminToken();
  return apiClient<Order>(`/order/detail?order_id=${encodeURIComponent(orderId)}`, { token });
}
export async function finishOrderAction(orderId: string) {
  const token = await requireAdminToken();
  if (!orderId) return { success: false, error: 'Pedido inválido.' };
  try {
    await apiClient('/order/finish', { method: 'PUT', body: JSON.stringify({ order_id: orderId }), token });
    revalidatePath('/dashboard');
    return { success: true, error: '' };
  } catch {
    return { success: false, error: 'Falha ao finalizar o pedido.' };
  }
}
