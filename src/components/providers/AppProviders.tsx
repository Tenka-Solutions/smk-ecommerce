"use client";

import CartProvider from "@/components/providers/CartProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}
