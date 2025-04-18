import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/../i18n/routing";
import { Suspense } from "react";
import "@/globals.css";
import MenuWrapper from "@/components/menuWrapper";
import { StoreProvider } from "@/providers/StoreProvider";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                Loading...
              </div>
            }
          >
            <SessionProvider>
              <StoreProvider>
                {children}
                <Toaster position="top-center" />
                <MenuWrapper />
              </StoreProvider>
            </SessionProvider>
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
