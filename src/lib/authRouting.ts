import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for "where may this signed-in person go?".
 *
 * Exactly one access class is derived per user, and every entry point (the
 * unified sign-in screen, AdminRoute, ClientRoute, ProtectedRoute) reads that
 * same answer. Nothing guesses, and a failed lookup is never treated as a
 * successful one.
 */

/** Roles that grant true global Siyakha admin access. project_manager is deliberately excluded. */
export const GLOBAL_ADMIN_ROLES = ["super_admin", "siyakha_admin", "admin"] as const;

/** The only portal membership state that grants client access. */
export const ACTIVE_CLIENT_STATUS = "active";

export const PATH_ADMIN = "/helpdesk";
export const PATH_PM = "/helpdesk/project-management";
export const PATH_PORTAL = "/portal";
export const PATH_SIGN_IN = "/sign-in";

export type AccessClass = "global_admin" | "assigned_project_manager" | "client" | "none" | "error";

export type AccessProfile = {
  access: AccessClass;
  /** Landing path for this access class, or null when there is no usable destination. */
  landingPath: string | null;
  /** Human-readable explanation for the "none" and "error" classes. */
  reason?: string;
};

/** Raw facts the classification depends on. Kept separate so it is directly testable. */
export type AccessFacts = {
  roles: string[];
  /** Number of internal project-manager assignments held by this user. */
  pmAssignments: number;
  /** portal_client_users.status values held by this user. */
  clientStatuses: string[];
};

const NO_ACCESS_REASON =
  "This account is not currently active for portal or workspace access. Contact Siyakha to have your access enabled.";

const LOOKUP_ERROR_REASON = "We could not confirm your access just now. Please try again.";

/** Deterministic mapping from facts to exactly one access class. */
export function classifyAccess(facts: AccessFacts): AccessProfile {
  const admin = facts.roles.some((r) => (GLOBAL_ADMIN_ROLES as readonly string[]).includes(r));
  if (admin) return { access: "global_admin", landingPath: PATH_ADMIN };
  if (facts.pmAssignments > 0) return { access: "assigned_project_manager", landingPath: PATH_PM };
  if (facts.clientStatuses.some((s) => s === ACTIVE_CLIENT_STATUS)) return { access: "client", landingPath: PATH_PORTAL };
  return { access: "none", landingPath: null, reason: NO_ACCESS_REASON };
}

export const lookupError = (detail?: string): AccessProfile => ({
  access: "error",
  landingPath: null,
  reason: detail ? `${LOOKUP_ERROR_REASON} (${detail})` : LOOKUP_ERROR_REASON,
});

const db = supabase as unknown as { from: (t: string) => any };

/** Resolves the access profile for one user with a single round of queries. */
export async function resolveAccessProfile(userId: string): Promise<AccessProfile> {
  const [rolesRes, pmRes, clientRes] = await Promise.all([
    db.from("user_roles").select("role").eq("user_id", userId),
    db.from("portal_pm_assignments").select("id").eq("user_id", userId).limit(1),
    db.from("portal_client_users").select("status").eq("user_id", userId),
  ]);

  // A query failure must surface as a retryable error, never as the wrong portal.
  const failure = [rolesRes, pmRes, clientRes].find((r) => r?.error);
  if (failure) return lookupError(failure.error?.message);

  return classifyAccess({
    roles: ((rolesRes.data ?? []) as { role: string }[]).map((r) => r.role),
    pmAssignments: ((pmRes.data ?? []) as unknown[]).length,
    clientStatuses: ((clientRes.data ?? []) as { status: string | null }[]).map((c) => c.status ?? ""),
  });
}

/** Landing path only, or null when the user has no usable destination. */
export async function resolveLandingPath(userId: string): Promise<string | null> {
  return (await resolveAccessProfile(userId)).landingPath;
}

/**
 * Assigned project managers may only use the commercial project-management
 * workspace — never Director costs, inbox, notes or admin modules.
 */
export function isPmAllowedPath(pathname: string): boolean {
  return pathname === PATH_PM || pathname.startsWith(`${PATH_PM}/`);
}

export type GuardDecision =
  | { state: "loading" }
  | { state: "allow" }
  | { state: "error"; reason: string }
  | { state: "redirect"; to: string };

export type GuardInput = {
  loading: boolean;
  signedIn: boolean;
  /** null while the profile is still being resolved. */
  profile: AccessProfile | null;
  pathname: string;
  /** Provisioned accounts that must set their own password get no access yet. */
  mustChangePassword?: boolean;
};

/** Admin workspace guard: global admin everywhere, assigned PM on the PM workspace only. */
export function decideAdminRoute(input: GuardInput): GuardDecision {
  if (input.loading) return { state: "loading" };
  if (!input.signedIn) return { state: "redirect", to: PATH_SIGN_IN };
  if (input.mustChangePassword) return { state: "redirect", to: PATH_SIGN_IN };
  if (!input.profile) return { state: "loading" };
  switch (input.profile.access) {
    case "global_admin":
      return { state: "allow" };
    case "assigned_project_manager":
      return isPmAllowedPath(input.pathname) ? { state: "allow" } : { state: "redirect", to: PATH_PM };
    case "client":
      return { state: "redirect", to: PATH_PORTAL };
    case "error":
      return { state: "error", reason: input.profile.reason ?? LOOKUP_ERROR_REASON };
    default:
      return { state: "redirect", to: PATH_SIGN_IN };
  }
}

/** Client portal guard: active client membership only. */
export function decideClientRoute(input: GuardInput): GuardDecision {
  if (input.loading) return { state: "loading" };
  if (!input.signedIn) return { state: "redirect", to: PATH_SIGN_IN };
  if (input.mustChangePassword) return { state: "redirect", to: PATH_SIGN_IN };
  if (!input.profile) return { state: "loading" };
  switch (input.profile.access) {
    case "client":
      return { state: "allow" };
    case "global_admin":
      return { state: "redirect", to: PATH_ADMIN };
    case "assigned_project_manager":
      return { state: "redirect", to: PATH_PM };
    case "error":
      return { state: "error", reason: input.profile.reason ?? LOOKUP_ERROR_REASON };
    default:
      return { state: "redirect", to: PATH_SIGN_IN };
  }
}

/** What the unified sign-in screen does once a session exists. */
export function decideSignInRedirect(profile: AccessProfile): GuardDecision {
  if (profile.landingPath) return { state: "redirect", to: profile.landingPath };
  if (profile.access === "error") return { state: "error", reason: profile.reason ?? LOOKUP_ERROR_REASON };
  return { state: "error", reason: profile.reason ?? NO_ACCESS_REASON };
}

/**
 * Recovery / invite links arrive on any of the legacy login URLs, in the hash
 * or the query string. Detection must not depend on which URL was used.
 */
export function isRecoveryRequest(search: string, hash: string): boolean {
  const inHash = /type=(recovery|invite)/.test(hash ?? "");
  const type = new URLSearchParams((search ?? "").replace(/^\?/, "")).get("type");
  return inHash || type === "recovery" || type === "invite";
}
