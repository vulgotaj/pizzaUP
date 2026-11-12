'use server';
import { requireAdminToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api';

export async function createProductAction(formData: FormData) {
  const token = await requireAdminToken();
  try {
    const body = new FormData();
    for (const field of ['name', 'price', 'description', 'category_id', 'file']) {
      const value = formData.get(field);
      if (value !== null) body.append(field, value);
    }
    await apiClient('/product', { method: 'POST', body, token });
    revalidatePath('/dashboard/products');
    return { success: true, error: '' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao criar produto.' };
  }
}
export async function deleteProductAction(productId: string) {
  const token = await requireAdminToken();
  if (!productId) return { success: false, error: 'Produto inválido.' };
  try {
    await apiClient(`/product?product_id=${encodeURIComponent(productId)}`, { method: 'DELETE', token });
    revalidatePath('/dashboard/products');
    return { success: true, error: '' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao arquivar produto.' };
  }
}
