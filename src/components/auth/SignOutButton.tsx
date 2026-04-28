"use client";

import { useFormStatus } from "react-dom";
import { signOutAction } from "@/modules/auth/actions";

function SignOutSubmitButton({ className }: { className: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {pending ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}

export function SignOutButton({
  className = "button-secondary px-6 py-3",
}: {
  className?: string;
}) {
  return (
    <form action={signOutAction}>
      <SignOutSubmitButton className={className} />
    </form>
  );
}
