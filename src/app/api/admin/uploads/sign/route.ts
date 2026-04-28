import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUserRoles } from "@/modules/auth/server";

const PRODUCT_IMAGE_BUCKET = "product-images";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;
const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum(ALLOWED_IMAGE_TYPES, {
    error: "Tipo de archivo no permitido.",
  }),
  size: z
    .number()
    .int()
    .min(1, "El archivo esta vacio.")
    .max(MAX_FILE_SIZE_BYTES, "La imagen no puede superar 5 MB."),
  folder: z
    .string()
    .trim()
    .regex(/^[a-z0-9/_-]+$/i, "Carpeta invalida.")
    .default("products"),
});

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-").toLowerCase();
}

function canUploadProductImages(roles: string[]) {
  return roles.some((role) => ["super_admin", "catalog_editor"].includes(role));
}

export async function POST(request: Request) {
  const roles = await getAuthenticatedUserRoles();

  if (!canUploadProductImages(roles)) {
    return NextResponse.json(
      { error: "No autorizado para firmar uploads." },
      { status: 403 }
    );
  }

  const payload = await request.json();
  const result = uploadSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Payload invalido." },
      { status: 400 }
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return NextResponse.json(
      { error: "Supabase admin no esta configurado." },
      { status: 503 }
    );
  }

  const filePath = `${result.data.folder}/${randomUUID()}-${sanitizeFileName(
    result.data.fileName
  )}`;

  const { data, error } = await adminClient.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .createSignedUploadUrl(filePath, {
      upsert: true,
    });

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible firmar el upload." },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = adminClient.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(filePath);

  return NextResponse.json({
    bucket: PRODUCT_IMAGE_BUCKET,
    path: filePath,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: publicUrlData.publicUrl,
  });
}
