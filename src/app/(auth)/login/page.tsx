import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  return (
    <div className="page-shell py-16">
      <div className="panel-card mx-auto max-w-xl rounded-[2rem] px-8 py-12">
        <p className="section-kicker">Acceso</p>
        <h1 className="mt-3 text-4xl font-semibold">Ingresa a tu cuenta</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
          Usa Google para asociar tus pedidos y revisar tu historial de compras.
        </p>
        <div className="mt-8">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
