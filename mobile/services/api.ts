import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { clearSession, getSessionToken } from './session';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL, timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use(config => {
  const token = getSessionToken();
  if (token && config.url !== '/session') config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, async (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const token = getSessionToken();
    if (error.response?.status === 401 && token && error.config?.headers.Authorization === `Bearer ${token}`) {
      await clearSession();
    }
    const message = error.response?.data?.error;
    // Do not propagate/log Axios config: login bodies contain the password.
    throw new Error(typeof message === 'string' ? message : 'Não foi possível acessar a API.');
  }
  throw new Error('Não foi possível acessar a API.');
});
export default api;
