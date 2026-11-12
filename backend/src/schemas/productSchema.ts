import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(100),
    price: z.string().regex(/^\d{1,10}$/).refine(value => Number(value) > 0 && Number(value) <= 2147483647, 'Preço inválido.'),
    description: z.string().trim().min(1).max(2000),
    category_id: z.uuid(),
  }),
});
export const listProductsSchema = z.object({ query: z.object({ disabled: z.enum(['true', 'false']).optional() }) });
export const listProductByCategorySchema = z.object({ query: z.object({ category_id: z.uuid() }) });
export const deleteProductSchema = z.object({ query: z.object({ product_id: z.uuid() }) });
