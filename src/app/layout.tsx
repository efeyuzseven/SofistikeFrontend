import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartProvider } from "@/features/cart/cart-context";
import { CartDrawer } from "@/features/cart/cart-drawer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sofistike +XTRA",
    template: "%s | Sofistike +XTRA",
  },
  description:
    "Gerçek kullanıcı içgörülerinden geliştirilen, daha iyi yaşam için akıllı ev ürünleri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <Suspense fallback={null}>
            <CartDrawer />
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
