import 'server-only';
import { cookies } from 'next/headers';
import { apiClient } from './api';
import { User } from './types';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'token_pizzaUP';
export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAME)?.value;
}
export async function setToken(token: string) {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true, maxAge: 60 * 60 * 8, path: '/', sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}
export async function removeToken() { (await cookies()).delete(COOKIE_NAME); }
export async function getUser(): Promise<User | null> {
  // Keep framework rendering signals outside the API error handler.
  const token = await getToken();
  if (!token) return null;
  try { return await apiClient<User>('/me', { token }); }
  catch { return null; }
}
export async function requiredAdmin(): Promise<User> {
  const user = await getUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/access-denied');
  return user;
}
export async function requireAdminToken(): Promise<string> {
  await requiredAdmin();
  const token = await getToken();
  if (!token) redirect('/login');
  return token;
}
