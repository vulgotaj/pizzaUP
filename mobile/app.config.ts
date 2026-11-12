import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const exportingProduction = process.argv.includes('export') && !process.argv.includes('--dev');
  if (exportingProduction || process.env.NODE_ENV === 'production' || process.env.EAS_BUILD === 'true' || process.env.EAS_BUILD_PROFILE === 'production') {
    const value = process.env.EXPO_PUBLIC_API_URL;
    if (!value || new URL(value).protocol !== 'https:') {
      throw new Error('Configure EXPO_PUBLIC_API_URL com HTTPS para gerar o app de produção.');
    }
  }
  return { ...config, name: config.name ?? 'pizzaUP', slug: config.slug ?? 'mobile' };
};
