import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Toaster } from "sonner";
import { AppProviders } from "@/components/providers/AppProviders";
import { env } from "@/lib/env";
import { siteConfig } from "@/modules/shared/site";
import "./globals.css";

const themeScript = `
(function() {
  try {
    var storageKey = "hubcafe-theme";
    var storedTheme = window.localStorage.getItem(storageKey);
    var theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-[var(--color-page)] font-[var(--font-sans)] text-[var(--color-ink)]">
        <AppProviders>{children}</AppProviders>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
