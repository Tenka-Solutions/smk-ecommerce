import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  return (
    <div className="page-shell py-16">
      <div className="panel-card mx-auto max-w-xl rounded-[2rem] px-8 py-12">
        <p className="section-kicker">Acceso</p>
        <h1 className="mt-3 text-4xl font-semibold">Ingresa a tu cuenta</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
          Inicia sesión con tu correo o continúa con Google para asociar tus
          pedidos.
        </p>

        <div className="mt-8">
          <EmailAuthForm />
        </div>

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            o continúa con
          </span>
          <span className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <GoogleSignInButton />
      </div>
    </div>
  );
}
