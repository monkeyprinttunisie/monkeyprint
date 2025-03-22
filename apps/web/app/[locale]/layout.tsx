import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/../i18n/routing";
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
    <html lang={locale} dir={locale === "tn" ? "rtl" : "ltr"}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <StoreProvider>
            {children}
            <MenuWrapper />
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
