import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { isSupabaseConfigured } from "@/lib/env";
import { adminNavigation, siteConfig } from "@/modules/shared/site";
import {
  getAuthenticatedUser,
  getAuthenticatedUserRoles,
} from "@/modules/auth/server";

function hasAdminRole(roles: string[]) {
  return roles.some((role) =>
    ["super_admin", "catalog_editor", "sales_manager"].includes(role)
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="page-shell py-16">
        <EmptyState
          title="Configura Supabase para habilitar el panel admin"
          description="El panel ya esta estructurado, pero necesita autenticacion y base conectada para operar."
        />
      </div>
    );
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const roles = await getAuthenticatedUserRoles();

  if (!hasAdminRole(roles)) {
    return (
      <div className="page-shell py-16">
        <EmptyState
          title="No tienes permisos para ingresar"
          description="Solicita acceso administrativo para gestionar catalogo, pedidos o cotizaciones."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <div className="mx-auto grid min-h-screen max-w-[110rem] gap-6 p-4 lg:grid-cols-[280px_1fr] lg:p-6">
        <aside className="panel-card rounded-[2rem] p-6">
          <Link href="/" className="block">
            <span className="font-[var(--font-display)] text-2xl font-semibold tracking-[-0.05em]">
              SMK <span className="text-[var(--color-accent)]">Vending</span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
            Panel privado para administrar catalogo, pedidos y seguimiento
            comercial.
          </p>

          <nav className="mt-8 grid gap-2">
            {adminNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1rem] px-4 py-3 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-[1.5rem] bg-[var(--color-surface-strong)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Sesion
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
              {user.email}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {roles.join(" / ") || "Administrador"}
            </p>
            <SignOutButton className="button-secondary mt-4 w-full justify-center px-4 py-3 text-sm" />
          </div>

          <div className="mt-8 text-sm text-[var(--color-muted)]">
            <p>{siteConfig.contact.salesEmail}</p>
            <p className="mt-1">{siteConfig.contact.phone}</p>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
