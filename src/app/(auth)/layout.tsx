import { StoreShell } from "@/components/layout/StoreShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreShell>{children}</StoreShell>;
}
