import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/../i18n/routing";
import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";
import { CategoryProvider } from "@/context/categoryContext";
import "@/globals.css";
import MenuWrapper from "@/components/menuWrapper";

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
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <CategoryProvider>
              <ProductProvider>
                {children}
                <MenuWrapper />
              </ProductProvider>
            </CategoryProvider>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
