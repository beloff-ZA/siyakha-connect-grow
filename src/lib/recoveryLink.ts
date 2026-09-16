/**
 * Password-recovery link handling.
 *
 * Supabase sends recovery people to the app in one of several shapes, and the
 * auth client (detectSessionInUrl) strips the tokens from the URL as soon as it
 * initialises. So the URL is snapshotted at module load — this module is
 * imported before the Supabase client and before the router — and the dedicated
 * /reset-password screen reads that snapshot instead of the live URL.
 */

export const PATH_RESET_PASSWORD = "/reset-password";

export type RecoveryLink =
  /** Implicit flow: tokens arrive in the URL fragment. */
  | { kind: "tokens"; accessToken: string; refreshToken: string }
  /** PKCE flow: an authorisation code arrives in the query string. */
  | { kind: "code"; code: string }
  /** Verify-redirect flow: a one-time token hash to verify. */
  | { kind: "token_hash"; tokenHash: string; type: string }
  /** Supabase reported the link itself was expired or already used. */
  | { kind: "error"; message: string };

const RECOVERY_TYPES = ["recovery", "invite", "signup"];

const params = (raw: string) => new URLSearchParams((raw ?? "").replace(/^[?#]/, ""));

/**
 * Recognises every current recovery URL shape. Returns null when the URL is an
 * ordinary app URL, so normal navigation is never hijacked.
 */
export function parseRecoveryLink(search: string, hash: string): RecoveryLink | null {
  const h = params(hash);
  const q = params(search);
  const get = (key: string) => h.get(key) ?? q.get(key);

  const errorCode = get("error_code") ?? get("error");
  if (errorCode) {
    const description = get("error_description")?.replace(/\+/g, " ");
    // Only treat auth errors as recovery-related; anything else is not ours.
    if (/expired|invalid|otp|token|access_denied/i.test(`${errorCode} ${description ?? ""}`)) {
      return {
        kind: "error",
        message: description || "This password reset link is no longer valid.",
      };
    }
  }

  const type = get("type") ?? "";

  const accessToken = h.get("access_token");
  const refreshToken = h.get("refresh_token");
  if (accessToken && refreshToken && (RECOVERY_TYPES.includes(type) || type === "")) {
    return { kind: "tokens", accessToken, refreshToken };
  }

  const tokenHash = get("token_hash");
  if (tokenHash && RECOVERY_TYPES.includes(type)) {
    return { kind: "token_hash", tokenHash, type };
  }

  const code = q.get("code");
  if (code) return { kind: "code", code };

  return null;
}

/** Captured once, before the auth client can clean the URL. */
const snapshot: RecoveryLink | null =
  typeof window === "undefined"
    ? null
    : parseRecoveryLink(window.location.search, window.location.hash);

const snapshotPath = typeof window === "undefined" ? "/" : window.location.pathname;

let consumed = false;

/** True while an unconsumed recovery link from this page load is pending. */
export function hasPendingRecoveryLink(): boolean {
  return !consumed && snapshot !== null;
}

/** Reads the pending link without consuming it. */
export function peekRecoveryLink(): RecoveryLink | null {
  return consumed ? null : snapshot;
}

/** Reads and consumes the pending link (single use per page load). */
export function takeRecoveryLink(): RecoveryLink | null {
  if (consumed) return null;
  consumed = true;
  return snapshot;
}

/** Where the recovery link landed, so legacy landing URLs can be recognised. */
export function recoveryLandingPath(): string {
  return snapshotPath;
}

/** Should this page load be forced onto the dedicated recovery screen? */
export function shouldRedirectToRecovery(pathname: string): boolean {
  return hasPendingRecoveryLink() && pathname !== PATH_RESET_PASSWORD;
}
