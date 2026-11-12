import { z } from 'zod';

const id = z.uuid('ID inválido.');
export const createOrderSchema = z.object({
  body: z.object({ table: z.number().int().min(1).max(10000), name: z.string().trim().max(100).optional() }),
});
export const addItemSchema = z.object({
  body: z.object({ order_id: id, product_id: id, amount: z.number().int().min(1).max(999) }),
});
export const removeItemSchema = z.object({ query: z.object({ item_id: id }) });
export const detailOrderSchema = z.object({ query: z.object({ order_id: id }) });
export const sendOrderSchema = z.object({ body: z.object({ order_id: id, name: z.string().trim().max(100) }) });
export const finishOrderSchema = z.object({ body: z.object({ order_id: id }) });
export const deleteOrderSchema = z.object({ query: z.object({ order_id: id }) });
export const listOrdersSchema = z.object({ query: z.object({ draft: z.enum(['true', 'false']).optional() }) });
