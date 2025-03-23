import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/../i18n/routing";
import { Suspense } from "react";
import "@/globals.css";
import MenuWrapper from "@/components/menuWrapper";
import { StoreProvider } from "@/providers/StoreProvider";

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
    <html lang={locale} dir={locale === "tn" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <StoreProvider>
            {children}
            <MenuWrapper />
          </StoreProvider>
          </Suspense> 
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
