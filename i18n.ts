import { getRequestConfig } from 'next-intl/server';

export const locales = ['lv', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Use requestLocale which is set by the middleware
  let locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'lv';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

