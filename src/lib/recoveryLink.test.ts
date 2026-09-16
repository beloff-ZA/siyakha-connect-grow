import { describe, expect, it } from "vitest";
import { parseRecoveryLink } from "./recoveryLink";

describe("parseRecoveryLink", () => {
  it("reads implicit-flow tokens from the hash", () => {
    const link = parseRecoveryLink("", "#access_token=aaa&refresh_token=bbb&type=recovery");
    expect(link).toEqual({ kind: "tokens", accessToken: "aaa", refreshToken: "bbb" });
  });

  it("reads tokens even when Supabase omits the type", () => {
    expect(parseRecoveryLink("", "#access_token=aaa&refresh_token=bbb")).toMatchObject({ kind: "tokens" });
  });

  it("reads a PKCE authorisation code from the query string", () => {
    expect(parseRecoveryLink("?code=abc123", "")).toEqual({ kind: "code", code: "abc123" });
  });

  it("reads a verify token hash", () => {
    expect(parseRecoveryLink("?token_hash=xyz&type=recovery", "")).toEqual({
      kind: "token_hash",
      tokenHash: "xyz",
      type: "recovery",
    });
  });

  it("reads an invite token hash from the hash fragment", () => {
    expect(parseRecoveryLink("", "#token_hash=xyz&type=invite")).toEqual({
      kind: "token_hash",
      tokenHash: "xyz",
      type: "invite",
    });
  });

  it("surfaces expired-link errors", () => {
    const link = parseRecoveryLink("", "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired");
    expect(link).toEqual({ kind: "error", message: "Email link is invalid or has expired" });
  });

  it("ignores ordinary app URLs", () => {
    expect(parseRecoveryLink("?utm_source=news", "")).toBeNull();
    expect(parseRecoveryLink("", "")).toBeNull();
    expect(parseRecoveryLink("?type=recovery", "")).toBeNull();
  });
});
