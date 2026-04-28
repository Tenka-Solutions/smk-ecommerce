"use client";

import { useFormStatus } from "react-dom";

export function OrderSubmitButton({
  children,
  className,
  disabled,
  confirmMessage,
  confirmWhenField,
  confirmWhenValue,
}: {
  children: React.ReactNode;
  className: string;
  disabled?: boolean;
  confirmMessage?: string;
  confirmWhenField?: string;
  confirmWhenValue?: string;
}) {
  const { pending } = useFormStatus();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (!confirmMessage) {
      return;
    }

    const form = event.currentTarget.form;
    const field = confirmWhenField
      ? form?.elements.namedItem(confirmWhenField)
      : null;
    const fieldValue =
      field instanceof HTMLSelectElement ||
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement
        ? field.value
        : null;
    const shouldConfirm =
      !confirmWhenField || fieldValue === confirmWhenValue;

    if (shouldConfirm && !window.confirm(confirmMessage)) {
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
