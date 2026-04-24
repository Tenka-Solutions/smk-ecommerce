import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/modules/auth/server";

const profileSchema = z.object({
  fullName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  companyName: z.string().trim().max(120).optional(),
  rut: z.string().trim().max(20).optional(),
});

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = profileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase no configurado" },
      { status: 500 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName?.length ? parsed.data.fullName : null,
      phone: parsed.data.phone?.length ? parsed.data.phone : null,
      company_name: parsed.data.companyName?.length
        ? parsed.data.companyName
        : null,
      rut: parsed.data.rut?.length ? parsed.data.rut : null,
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
