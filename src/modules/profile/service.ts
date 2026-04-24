import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  fullName: string | null;
  phone: string | null;
  companyName: string | null;
  rut: string | null;
}

export async function getProfileForUser(
  userId: string
): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, phone, company_name, rut")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id as string,
    fullName: (data.full_name as string | null) ?? null,
    phone: (data.phone as string | null) ?? null,
    companyName: (data.company_name as string | null) ?? null,
    rut: (data.rut as string | null) ?? null,
  };
}
