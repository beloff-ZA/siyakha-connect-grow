import { beforeEach, describe, expect, it, vi } from "vitest";
import { viewerSessionKey } from "./deckViewer";

/**
 * The share-link gate must appear on every fresh page load. These tests drive
 * the transport directly and assert that viewer access is only ever held in
 * module memory — never in localStorage, sessionStorage, cookies or the URL.
 */

const invoke = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => invoke(...args) } },
}));

const TOKEN = "tkn-353-anton-lembede";
const registration = { first_name: "Ayanda", surname: "Mkhize", email: "ayanda@client.co.za", consent: true as const };

const freshModule = async () => {
  vi.resetModules();
  return await import("./deckClient");
};

const sentSession = () => (invoke.mock.calls[invoke.mock.calls.length - 1]?.[1] as { body: { session: string } }).body.session;

beforeEach(() => {
  invoke.mockReset();
  localStorage.clear();
  sessionStorage.clear();
});

describe("deck viewer gate", () => {
  it("gates the first open: no session is sent and registration is required", async () => {
    const { deckSession } = await freshModule();
    invoke.mockResolvedValue({ data: { state: "registration_required" }, error: null });
    const res = await deckSession(TOKEN);
    expect(sentSession()).toBe("");
    expect(res.state).toBe("registration_required");
  });

  it("keeps access in memory for the loaded page so deck tabs stay open", async () => {
    const mod = await freshModule();
    invoke.mockResolvedValueOnce({ data: { state: "ok", session: "s-1" }, error: null });
    await mod.deckRegister(TOKEN, registration);
    expect(mod.readSession(TOKEN)).toBe("s-1");

    // Tab navigation inside the same page lifecycle reuses the in-memory session.
    invoke.mockResolvedValue({ data: { state: "ok" }, error: null });
    await mod.deckBoq(TOKEN);
    expect(sentSession()).toBe("s-1");
    await mod.deckNotes(TOKEN);
    expect(sentSession()).toBe("s-1");
  });

  it("never persists a bypass to browser storage", async () => {
    const mod = await freshModule();
    invoke.mockResolvedValueOnce({ data: { state: "ok", session: "s-2" }, error: null });
    await mod.deckRegister(TOKEN, registration);
    expect(localStorage.getItem(viewerSessionKey(TOKEN))).toBeNull();
    expect(Object.keys(localStorage)).toHaveLength(0);
    expect(Object.keys(sessionStorage)).toHaveLength(0);
    expect(document.cookie).not.toContain("siyakha.deck");
  });

  it("requires the gate again after a reload or new page load", async () => {
    const first = await freshModule();
    invoke.mockResolvedValueOnce({ data: { state: "ok", session: "s-3" }, error: null });
    await first.deckRegister(TOKEN, registration);
    expect(first.readSession(TOKEN)).toBe("s-3");

    // A reload is a brand-new module instance: memory is empty again.
    const reloaded = await freshModule();
    expect(reloaded.readSession(TOKEN)).toBe("");
    invoke.mockResolvedValue({ data: { state: "registration_required" }, error: null });
    expect((await reloaded.deckSession(TOKEN)).state).toBe("registration_required");
    expect(sentSession()).toBe("");
  });

  it("clearSession drops in-memory access immediately", async () => {
    const mod = await freshModule();
    mod.writeSession(TOKEN, "s-4");
    mod.clearSession(TOKEN);
    expect(mod.readSession(TOKEN)).toBe("");
  });

  it("purges any session left in storage by an earlier build", async () => {
    localStorage.setItem(viewerSessionKey(TOKEN), "legacy");
    sessionStorage.setItem(viewerSessionKey("other"), "legacy");
    const mod = await freshModule();
    mod.purgePersistedSessions();
    expect(localStorage.getItem(viewerSessionKey(TOKEN))).toBeNull();
    expect(sessionStorage.getItem(viewerSessionKey("other"))).toBeNull();
  });

  it("blocks expired and revoked links regardless of any prior registration", async () => {
    const mod = await freshModule();
    mod.writeSession(TOKEN, "s-5");
    for (const state of ["expired", "revoked"] as const) {
      invoke.mockResolvedValue({ data: { state }, error: null });
      expect((await mod.deckBoq(TOKEN)).state).toBe(state);
    }
  });
});
