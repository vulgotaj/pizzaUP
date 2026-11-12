import 'server-only';

export function getApiUrl() {
  const value = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!value) throw new Error('Configure API_URL no servidor do dashboard.');
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || (process.env.NODE_ENV === 'production' && url.protocol !== 'https:')) {
    throw new Error('A API deve usar HTTPS em produção.');
  }
  return value.replace(/\/$/, '');
}
interface FetchOptions extends RequestInit { token?: string; }
export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(fetchOptions.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${getApiUrl()}${endpoint}`, {
    ...fetchOptions, headers, cache: 'no-store', signal: fetchOptions.signal ?? AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(typeof error.error === 'string' ? error.error : 'Erro ao acessar a API.');
  }
  return response.json();
}
