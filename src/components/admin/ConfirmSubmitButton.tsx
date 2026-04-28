"use client";

import { useFormStatus } from "react-dom";

export function ConfirmSubmitButton({
  children,
  className,
  disabled,
  confirmMessage,
}: {
  children: React.ReactNode;
  className: string;
  disabled?: boolean;
  confirmMessage: string;
}) {
  const { pending } = useFormStatus();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      onClick={handleClick}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {pending ? "Procesando..." : children}
    </button>
  );
}
