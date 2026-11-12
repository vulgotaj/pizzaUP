'use server';
import { apiClient } from '@/lib/api';
import { requireAdminToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createCategoryAction(formData: FormData) {
  const token = await requireAdminToken();
  try {
    await apiClient('/category', { method: 'POST', body: JSON.stringify({ name: formData.get('name') }), token });
    revalidatePath('/dashboard/categories');
    return { success: true, error: '' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao criar categoria.' };
  }
}
