import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env, isSupabaseConfigured } from "@/lib/env";

export async function getAuthenticatedUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}

export async function getAuthenticatedUserRoles() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return [];
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("user_roles")
    .select("role:roles(slug)")
    .eq("user_id", user.id);

  const roleSlugs =
    data
      ?.map((entry) => entry.role)
      .flat()
      .map((role) => role?.slug)
      .filter(Boolean) ?? [];

  if (env.adminAllowedEmails.includes(user.email?.toLowerCase() ?? "")) {
    return Array.from(new Set([...roleSlugs, "super_admin"]));
  }

  return roleSlugs;
}

export async function isAdminUser() {
  const roles = await getAuthenticatedUserRoles();
  return roles.some((role) =>
    ["super_admin", "catalog_editor", "sales_manager"].includes(role)
  );
}
