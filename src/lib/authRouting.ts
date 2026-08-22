import { supabase } from "@/integrations/supabase/client";

/** Roles that grant true global Siyakha admin access. project_manager is deliberately excluded. */
export const GLOBAL_ADMIN_ROLES = ["super_admin", "siyakha_admin", "admin"] as const;

const db = supabase as unknown as { from: (t: string) => any };

/**
 * Role-aware landing path. A confirmed global Siyakha admin goes to /helpdesk,
 * an exactly-active client portal user goes to /portal, anyone else lands home.
 */
export async function resolveLandingPath(userId: string): Promise<string> {
  const [rolesRes, clientRes] = await Promise.all([
    db.from("user_roles").select("role").eq("user_id", userId),
    db.from("portal_client_users").select("id").eq("user_id", userId).eq("status", "active").limit(1),
  ]);

  const roles = ((rolesRes.data ?? []) as { role: string }[]).map((r) => r.role);
  if (roles.some((r) => (GLOBAL_ADMIN_ROLES as readonly string[]).includes(r))) return "/helpdesk";
  if ((clientRes.data ?? []).length > 0) return "/portal";
  return "/";
}
