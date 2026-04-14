import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/modules/auth/server";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  folder: z.string().trim().default("products"),
});

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-").toLowerCase();
}

export async function POST(request: Request) {
  const admin = await isAdminUser();

  if (!admin) {
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
    .from("catalog")
    .createSignedUploadUrl(filePath, {
      upsert: true,
    });

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No fue posible firmar el upload." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    path: filePath,
    token: data.token,
    signedUrl: data.signedUrl,
  });
}
