import { redirect } from "next/navigation";
import { StoreShell } from "@/components/layout/StoreShell";
import { EmptyState } from "@/components/feedback/EmptyState";
import { isSupabaseConfigured } from "@/lib/env";
import { getAuthenticatedUser } from "@/modules/auth/server";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <StoreShell>
        <div className="page-shell py-16">
          <EmptyState
            title="Configura Supabase Auth para habilitar Mi cuenta"
            description="La estructura de cuenta está lista, pero necesitas credenciales de Supabase para iniciar sesión y asociar pedidos."
          />
        </div>
      </StoreShell>
    );
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return <StoreShell>{children}</StoreShell>;
}
