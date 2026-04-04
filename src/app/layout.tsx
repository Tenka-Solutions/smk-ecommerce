import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartProvider from "@/components/providers/CartProvider";
import { Toaster } from "sonner";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yellowbox.cl";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Yellow Box | Vending & Café",
    template: "%s | Yellow Box",
  },
  description:
    "Máquinas vending, café premium y accesorios. Soluciones automáticas para empresas en la Región del Biobío, Chile.",
  keywords: ["vending", "máquinas vending", "café", "café automático", "biobío", "chile"],
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "Yellow Box",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${openSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-open-sans)]">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="bottom-right" richColors />
        </CartProvider>
      </body>
    </html>
  );
}
