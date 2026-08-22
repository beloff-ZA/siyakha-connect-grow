import type { User } from "@supabase/supabase-js";

/**
 * Display name for a signed-in administrator, taken from Supabase auth
 * user_metadata. No separate profile table is used for this — the metadata set on
 * the auth user is the single source of truth.
 */
export function adminDisplayName(user: User | null | undefined): string | null {
  const m = (user?.user_metadata ?? {}) as Record<string, unknown>;
  for (const key of ["full_name", "name", "display_name", "username"]) {
    const value = m[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** Name when available, otherwise the email so the UI is never blank. */
export function adminIdentityLabel(user: User | null | undefined): string {
  return adminDisplayName(user) ?? user?.email ?? "Administrator";
}
