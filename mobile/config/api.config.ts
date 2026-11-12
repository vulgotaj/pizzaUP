const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
if (!configuredUrl) throw new Error('Configure EXPO_PUBLIC_API_URL antes de iniciar o app.');
const url = new URL(configuredUrl);
if (!['https:', 'http:'].includes(url.protocol) || (!__DEV__ && url.protocol !== 'https:') || url.username || url.password || url.search || url.hash) {
  throw new Error('A URL da API é inválida. Builds de produção exigem HTTPS.');
}
export const API_CONFIG = { BASE_URL: configuredUrl.replace(/\/$/, ''), TIMEOUT: 12000 };
