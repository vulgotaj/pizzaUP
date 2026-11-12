import api from '../services/api';
import { createContext, useContext, useEffect, useState } from 'react';
import { LoginResponse, User } from '../types';
import { clearSession, discardLegacySession, onSessionInvalidated, restoreSessionToken, saveSessionToken } from '../services/session';

interface AuthContextData {
  user: User | null; signed: boolean; loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextData | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    let active = true;
    const unsubscribe = onSessionInvalidated(() => { if (active) setUser(null); });
    async function restore() {
      try {
        await discardLegacySession();
        if (await restoreSessionToken()) {
          const response = await api.get<User>('/me');
          if (active) setUser(response.data);
        }
      } catch {
        await clearSession().catch(() => {});
      } finally { if (active) setLoading(false); }
    }
    void restore();
    return () => { active = false; unsubscribe(); };
  }, []);
  async function signIn(email: string, password: string) {
    const { data } = await api.post<LoginResponse>('/session', { email: email.trim(), password });
    try {
      await saveSessionToken(data.token);
      const response = await api.get<User>('/me');
      setUser(response.data);
    } catch (error) {
      await clearSession().catch(() => {});
      throw error;
    }
  }
  async function signOut() { await clearSession(); }
  return <AuthContext value={{ user, signed: !!user, loading, signIn, signOut }}>{children}</AuthContext>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider não encontrado.');
  return context;
}
