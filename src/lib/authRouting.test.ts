import { describe, expect, it, vi } from "vitest";

// The routing rules are pure; the Supabase client is only stubbed so importing
// the module under test does not touch browser storage.
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({}) } }));

import {
  classifyAccess,
  decideAdminRoute,
  decideClientRoute,
  decideSignInRedirect,
  isPmAllowedPath,
  isRecoveryRequest,
  lookupError,
  PATH_ADMIN,
  PATH_PM,
  PATH_PORTAL,
  PATH_SIGN_IN,
  type AccessProfile,
} from "./authRouting";

const noFacts = { roles: [], pmAssignments: 0, clientStatuses: [] };

const admin: AccessProfile = classifyAccess({ ...noFacts, roles: ["siyakha_admin"] });
const pm: AccessProfile = classifyAccess({ ...noFacts, pmAssignments: 1 });
const client: AccessProfile = classifyAccess({ ...noFacts, clientStatuses: ["active"] });
const none: AccessProfile = classifyAccess(noFacts);
const failed: AccessProfile = lookupError("network");

describe("classifyAccess — exactly one access class", () => {
  it("treats Nikita's global admin roles as global_admin", () => {
    for (const role of ["super_admin", "siyakha_admin", "admin"]) {
      expect(classifyAccess({ ...noFacts, roles: [role] })).toEqual({
        access: "global_admin",
        landingPath: PATH_ADMIN,
      });
    }
  });

  it("keeps project_manager out of global admin and routes assigned PMs to the PM workspace", () => {
    expect(classifyAccess({ ...noFacts, roles: ["project_manager"] }).access).toBe("none");
    expect(pm).toEqual({ access: "assigned_project_manager", landingPath: PATH_PM });
  });

  it("routes Anthony's active client membership to the portal", () => {
    expect(client).toEqual({ access: "client", landingPath: PATH_PORTAL });
  });

  it("denies invited, suspended and revoked client memberships", () => {
    for (const status of ["invited", "suspended", "revoked", ""]) {
      const p = classifyAccess({ ...noFacts, clientStatuses: [status] });
      expect(p.access).toBe("none");
      expect(p.landingPath).toBeNull();
    }
  });

  it("prefers admin over both PM assignment and client membership", () => {
    const p = classifyAccess({ roles: ["admin"], pmAssignments: 3, clientStatuses: ["active"] });
    expect(p.access).toBe("global_admin");
  });
});

describe("sign-in redirect", () => {
  it("sends each access class to exactly one destination", () => {
    expect(decideSignInRedirect(admin)).toEqual({ state: "redirect", to: PATH_ADMIN });
    expect(decideSignInRedirect(pm)).toEqual({ state: "redirect", to: PATH_PM });
    expect(decideSignInRedirect(client)).toEqual({ state: "redirect", to: PATH_PORTAL });
  });

  it("shows a message instead of a portal when there is no access", () => {
    expect(decideSignInRedirect(none).state).toBe("error");
  });

  it("never defaults a failed lookup to a portal", () => {
    const d = decideSignInRedirect(failed);
    expect(d.state).toBe("error");
    expect(d.state === "error" && d.reason).toContain("try again");
  });
});

describe("recovery links on any legacy login URL", () => {
  it("detects recovery and invite tokens in hash or query", () => {
    expect(isRecoveryRequest("", "#access_token=x&type=recovery")).toBe(true);
    expect(isRecoveryRequest("", "#type=invite&access_token=x")).toBe(true);
    expect(isRecoveryRequest("?type=recovery", "")).toBe(true);
    expect(isRecoveryRequest("?type=invite", "")).toBe(true);
  });

  it("does not treat a normal visit as recovery", () => {
    expect(isRecoveryRequest("", "")).toBe(false);
    expect(isRecoveryRequest("?from=/portal", "#")).toBe(false);
  });
});

describe("AdminRoute guard", () => {
  const at = (pathname: string, profile: AccessProfile | null, extra: Partial<Parameters<typeof decideAdminRoute>[0]> = {}) =>
    decideAdminRoute({ loading: false, signedIn: true, profile, pathname, ...extra });

  it("sends signed-out visitors to the unified sign-in", () => {
    expect(decideAdminRoute({ loading: false, signedIn: false, profile: null, pathname: PATH_ADMIN })).toEqual({
      state: "redirect",
      to: PATH_SIGN_IN,
    });
  });

  it("waits while auth or the access lookup is in flight", () => {
    expect(decideAdminRoute({ loading: true, signedIn: false, profile: null, pathname: PATH_ADMIN }).state).toBe("loading");
    expect(at(PATH_ADMIN, null).state).toBe("loading");
  });

  it("allows a global admin on every module", () => {
    for (const p of [PATH_ADMIN, "/helpdesk/costs", "/helpdesk/inbox", PATH_PM, "/helpdesk/client-portal"]) {
      expect(at(p, admin)).toEqual({ state: "allow" });
    }
  });

  it("confines an assigned PM to the project-management workspace", () => {
    expect(at(PATH_PM, pm)).toEqual({ state: "allow" });
    expect(at(`${PATH_PM}/tab`, pm)).toEqual({ state: "allow" });
    for (const p of ["/helpdesk", "/helpdesk/costs", "/helpdesk/inbox", "/helpdesk/notes", "/helpdesk/client-portal"]) {
      expect(at(p, pm)).toEqual({ state: "redirect", to: PATH_PM });
    }
  });

  it("redirects a client session out of the workspace", () => {
    expect(at("/helpdesk/costs", client)).toEqual({ state: "redirect", to: PATH_PORTAL });
  });

  it("blocks inactive accounts and forced password changes", () => {
    expect(at(PATH_ADMIN, none)).toEqual({ state: "redirect", to: PATH_SIGN_IN });
    expect(at(PATH_ADMIN, admin, { mustChangePassword: true })).toEqual({ state: "redirect", to: PATH_SIGN_IN });
  });

  it("surfaces a retryable error on lookup failure", () => {
    expect(at(PATH_ADMIN, failed).state).toBe("error");
  });
});

describe("ClientRoute guard", () => {
  const at = (profile: AccessProfile | null, extra: Partial<Parameters<typeof decideClientRoute>[0]> = {}) =>
    decideClientRoute({ loading: false, signedIn: true, profile, pathname: PATH_PORTAL, ...extra });

  it("sends signed-out visitors to the unified sign-in", () => {
    expect(decideClientRoute({ loading: false, signedIn: false, profile: null, pathname: PATH_PORTAL })).toEqual({
      state: "redirect",
      to: PATH_SIGN_IN,
    });
  });

  it("allows only an active client", () => {
    expect(at(client)).toEqual({ state: "allow" });
  });

  it("keeps admin and PM sessions out of the portal", () => {
    expect(at(admin)).toEqual({ state: "redirect", to: PATH_ADMIN });
    expect(at(pm)).toEqual({ state: "redirect", to: PATH_PM });
  });

  it("sends inactive and unknown accounts to sign-in", () => {
    expect(at(none)).toEqual({ state: "redirect", to: PATH_SIGN_IN });
    expect(at(none, { mustChangePassword: true })).toEqual({ state: "redirect", to: PATH_SIGN_IN });
  });

  it("surfaces a retryable error on lookup failure", () => {
    expect(at(failed).state).toBe("error");
  });
});

describe("no redirect loops", () => {
  it("every guard destination is terminal for the access class that reaches it", () => {
    // Admin lands on /helpdesk and is allowed there; a client lands on /portal
    // and is allowed there; a PM lands on /helpdesk/project-management and is
    // allowed there. No decision points back at a screen that bounces again.
    expect(decideAdminRoute({ loading: false, signedIn: true, profile: admin, pathname: PATH_ADMIN }).state).toBe("allow");
    expect(decideClientRoute({ loading: false, signedIn: true, profile: client, pathname: PATH_PORTAL }).state).toBe("allow");
    expect(decideAdminRoute({ loading: false, signedIn: true, profile: pm, pathname: PATH_PM }).state).toBe("allow");
  });

  it("a PM redirected off a Director module is then allowed at the destination", () => {
    const first = decideAdminRoute({ loading: false, signedIn: true, profile: pm, pathname: "/helpdesk/inbox" });
    expect(first).toEqual({ state: "redirect", to: PATH_PM });
    const second = decideAdminRoute({ loading: false, signedIn: true, profile: pm, pathname: PATH_PM });
    expect(second.state).toBe("allow");
  });

  it("a client bounced from the workspace is allowed at the portal", () => {
    const first = decideAdminRoute({ loading: false, signedIn: true, profile: client, pathname: PATH_ADMIN });
    expect(first).toEqual({ state: "redirect", to: PATH_PORTAL });
    expect(decideClientRoute({ loading: false, signedIn: true, profile: client, pathname: PATH_PORTAL }).state).toBe("allow");
  });

  it("isPmAllowedPath only matches the PM workspace subtree", () => {
    expect(isPmAllowedPath(PATH_PM)).toBe(true);
    expect(isPmAllowedPath(`${PATH_PM}/anything`)).toBe(true);
    expect(isPmAllowedPath("/helpdesk/project-managementx")).toBe(false);
    expect(isPmAllowedPath("/helpdesk")).toBe(false);
  });
});
