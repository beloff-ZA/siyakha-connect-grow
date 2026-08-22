import { describe, expect, it } from "vitest";
import {
  assertClientSafe,
  assertExplicitAction,
  clientVisibleOnly,
  deviceTotals,
  findSensitiveKeys,
  parseReportView,
  resolveScopedProject,
  scopeToProject,
  stripSensitive,
  VIEW_ONLY_SHARE_DEFAULTS,
} from "./reporting";

const projects = [{ id: "a" }, { id: "b" }];

describe("URL project scoping", () => {
  it("resolves the project from the URL id only", () => {
    expect(resolveScopedProject("b", projects)?.id).toBe("b");
  });

  it("never falls back to the first project for an unknown or empty id", () => {
    expect(resolveScopedProject("zzz", projects)).toBeNull();
    expect(resolveScopedProject("", projects)).toBeNull();
    expect(resolveScopedProject(null, projects)).toBeNull();
    expect(resolveScopedProject(undefined, projects)).toBeNull();
  });

  it("scopes project-scoped rows to the URL project", () => {
    const rows = [
      { id: "1", project_id: "a" },
      { id: "2", project_id: "b" },
      { id: "3", project_id: "a" },
    ];
    expect(scopeToProject(rows, "a").map((r) => r.id)).toEqual(["1", "3"]);
    expect(scopeToProject(rows, "")).toEqual([]);
  });

  it("defaults unknown report views instead of blanking", () => {
    expect(parseReportView("report")).toBe("report");
    expect(parseReportView("nope")).toBe("proposal");
    expect(parseReportView(null)).toBe("proposal");
  });
});

describe("client-safe allowlisting", () => {
  const dirty = {
    project: { id: "a", title: "Tower" },
    boqLines: [{ description: "Cat6A point", customer_unit_rate: 100, supplier_unit_cost: 40, markup_percent: 60 }],
    assets: [{ serial_number: "X1", supplier: "ACME", po_reference: "PO-1", internal_notes: "call rep" }],
    totals: { subtotal: 100, vat: 15, total: 115 },
  };

  it("detects supplier cost, markup, margin and internal fields at any depth", () => {
    const hits = findSensitiveKeys(dirty);
    expect(hits).toContain("$.boqLines[0].supplier_unit_cost");
    expect(hits).toContain("$.boqLines[0].markup_percent");
    expect(hits).toContain("$.assets[0].supplier");
    expect(hits).toContain("$.assets[0].po_reference");
    expect(hits).toContain("$.assets[0].internal_notes");
  });

  it("throws when an unsafe payload would be issued or shared", () => {
    expect(() => assertClientSafe(dirty, "project pack")).toThrow(/internal commercial fields/i);
  });

  it("passes a clean client payload and keeps customer pricing", () => {
    const clean = stripSensitive(dirty);
    expect(() => assertClientSafe(clean)).not.toThrow();
    expect(clean.boqLines[0].customer_unit_rate).toBe(100);
    expect(clean.totals.total).toBe(115);
    expect((clean.assets[0] as Record<string, unknown>).serial_number).toBe("X1");
    expect((clean.assets[0] as Record<string, unknown>).supplier).toBeUndefined();
  });

  it("survives circular references without hanging", () => {
    const node: Record<string, unknown> = { title: "loop" };
    node.self = node;
    expect(findSensitiveKeys(node)).toEqual([]);
  });

  it("keeps only client-visible images", () => {
    const images = [
      { id: "1", client_visible: true },
      { id: "2", client_visible: false },
      { id: "3", client_visible: null },
    ];
    expect(clientVisibleOnly(images).map((i) => i.id)).toEqual(["1"]);
  });
});

describe("no automatic record creation", () => {
  it("rejects writes triggered by mount, effect or render", () => {
    (["mount", "effect", "render"] as const).forEach((t) =>
      expect(() => assertExplicitAction(t, "Generating a proposal")).toThrow(/explicit Generate or Create click/i),
    );
  });

  it("allows a write from an explicit user action", () => {
    expect(() => assertExplicitAction("user", "Generating a proposal")).not.toThrow();
  });

  it("defaults secure links to view-only with downloads, comments and approvals disabled", () => {
    expect(VIEW_ONLY_SHARE_DEFAULTS).toEqual({
      permission_scope: "view",
      download_allowed: false,
      comments_allowed: false,
      approval_allowed: false,
    });
  });
});

describe("device roll-up", () => {
  it("counts APs, cameras, racks, switches and placement", () => {
    const t = deviceTotals([
      { marker_type: "wifi_ap", is_placed: true },
      { marker_type: "wifi_ap", is_placed: false },
      { marker_type: "camera", is_placed: true },
      { marker_type: "rack", is_placed: true },
      { marker_type: "switch", is_placed: true },
      { marker_type: "fibre_agg_switch", is_placed: false },
      { marker_type: "nvr", is_placed: true },
    ]);
    expect(t.total).toBe(7);
    expect(t.placed).toBe(5);
    expect(t.access_points).toBe(2);
    expect(t.cameras).toBe(1);
    expect(t.racks).toBe(1);
    expect(t.switches).toBe(2);
    expect(t.nvrs).toBe(1);
    expect(t.byType[0]).toEqual({ type: "wifi_ap", count: 2 });
  });

  it("returns zeroed totals for an empty design", () => {
    const t = deviceTotals([]);
    expect(t.total).toBe(0);
    expect(t.byType).toEqual([]);
  });
});

describe("reports & share workspace behaviour", () => {
  it("keeps proposals scoped to the URL project even when others exist", () => {
    const proposals = [
      { id: "p1", project_id: "A" },
      { id: "p2", project_id: "B" },
      { id: "p3", project_id: "A" },
    ];
    expect(scopeToProject(proposals, "A").map((p) => p.id)).toEqual(["p1", "p3"]);
    expect(scopeToProject(proposals, "")).toEqual([]);
  });

  it("rejects a client report that still carries supplier or markup fields", () => {
    const pack = {
      project: { id: "A", title: "Tower" },
      boqLines: [{ description: "AP", quantity: 4, unit_price: 100, supplier_cost: 60 }],
    };
    expect(() => assertClientSafe(pack, "The client project report")).toThrow(/supplier_cost/);
    expect(() => assertClientSafe(stripSensitive(pack), "The client project report")).not.toThrow();
  });

  it("blocks record creation triggered by mount or effect, allows explicit clicks", () => {
    expect(() => assertExplicitAction("mount", "Issuing a project report")).toThrow(/explicit Generate or Create/);
    expect(() => assertExplicitAction("effect", "Creating a view link")).toThrow(/explicit Generate or Create/);
    expect(() => assertExplicitAction("user", "Saving a proposal draft")).not.toThrow();
  });

  it("defaults secure view links to view-only with no download, comments or approval", () => {
    expect(VIEW_ONLY_SHARE_DEFAULTS).toEqual({
      permission_scope: "view",
      download_allowed: false,
      comments_allowed: false,
      approval_allowed: false,
    });
  });
});
