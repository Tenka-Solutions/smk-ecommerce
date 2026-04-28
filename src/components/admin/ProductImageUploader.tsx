"use client";

import { useEffect, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

interface SignedUploadResponse {
  bucket: string;
  path: string;
  token: string;
  publicUrl: string;
}

export function ProductImageUploader({
  name,
  initialValue,
}: {
  name: string;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setMessage(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Usa una imagen JPG, PNG, WEBP o SVG.");
      input.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("La imagen no puede superar 5 MB.");
      input.value = "";
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        if (!supabase) {
          throw new Error("Supabase no esta configurado en el navegador.");
        }

        const signResponse = await fetch("/api/admin/uploads/sign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            folder: "products",
          }),
        });
        const signedPayload = (await signResponse.json()) as
          | SignedUploadResponse
          | { error?: string };

        if (!signResponse.ok || !("token" in signedPayload)) {
          const errorMessage =
            "error" in signedPayload ? signedPayload.error : undefined;

          throw new Error(
            errorMessage ?? "No fue posible preparar la subida."
          );
        }

        const { error: uploadError } = await supabase.storage
          .from(signedPayload.bucket)
          .uploadToSignedUrl(signedPayload.path, signedPayload.token, file, {
            contentType: file.type,
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        setValue(signedPayload.publicUrl);
        setMessage("Imagen subida. Guarda el producto para publicar el cambio.");
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "No pudimos subir la imagen."
        );
      } finally {
        input.value = "";
      }
    });
  }

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)]">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Vista previa del producto"
            className="h-44 w-full object-contain p-4"
          />
        ) : (
          <div className="flex h-44 items-center justify-center px-6 text-center text-sm text-[var(--color-muted-foreground)]">
            Sin imagen principal. Puedes dejarlo vacio, pero es recomendado
            cargar una imagen antes de publicar.
          </div>
        )}
      </div>

      <input
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="/catalog/cutouts/producto.png o URL de Supabase Storage"
        className="form-input"
      />

      <label className="button-secondary cursor-pointer px-5 py-3 text-sm">
        {isPending ? "Subiendo imagen..." : "Subir o reemplazar imagen"}
        <input
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          className="sr-only"
          disabled={isPending}
          onChange={handleFileChange}
        />
      </label>

      {message ? (
        <p className="text-xs font-medium text-[var(--color-success)]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-[var(--color-danger)]">{error}</p>
      ) : null}
    </div>
  );
}
