import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import Sidebar from '@/app/components/sidebar';
import ToasterProvider from '@/app/components/toaster';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale as Locale)) {
    return <div>Invalid locale: {locale}</div>;
  }

  let messages;
  try {
    // Explicitly pass locale to getMessages - this ensures the correct locale is used
    messages = await getMessages({ locale });
  } catch (error) {
    console.error('Failed to load messages:', error);
    return <div>Error loading messages: {String(error)}</div>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div lang={locale} className="antialiased min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <Sidebar />
        <main
          className="transition-[padding] duration-300"
          style={{ paddingLeft: "var(--sidebar-offset, 0px)" }}
        >
          {children}
        </main>
        <ToasterProvider />
      </div>
    </NextIntlClientProvider>
  );
}
