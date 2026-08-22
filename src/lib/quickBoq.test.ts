import { describe, expect, it, vi } from "vitest";
import {
  assertSyncConfirmed,
  clientSafeLineKeys,
  pickDefaultBoq,
  previewLineTotal,
  toClientSafeLines,
  validateQuickLine,
} from "@/lib/quickBoq";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

const boq = (id: string, status: string, version_no: number) => ({ id, status: status as any, version_no });

describe("quick BOQ selection", () => {
  it("selects the single draft automatically without any write", () => {
    const sel = pickDefaultBoq([boq("a", "draft", 1)]);
    expect(sel).toEqual({ selectedId: "a", needsSelector: false, needsCreate: false });
  });

  it("keeps a selector when several revisions exist and prefers the newest draft", () => {
    const sel = pickDefaultBoq([boq("old", "superseded", 1), boq("new", "draft", 2)]);
    expect(sel.selectedId).toBe("new");
    expect(sel.needsSelector).toBe(true);
  });

  it("asks to create a BOQ when the project has none", () => {
    expect(pickDefaultBoq([])).toEqual({ selectedId: "", needsSelector: false, needsCreate: true });
  });

  it("respects an already chosen revision", () => {
    expect(pickDefaultBoq([boq("a", "draft", 1), boq("b", "draft", 2)], "a").selectedId).toBe("a");
  });
});

describe("quick line calculation and validation", () => {
  it("calculates the line total live", () => {
    expect(previewLineTotal("3", "1475.5")).toBe(4426.5);
    expect(previewLineTotal("x", 10)).toBe(0);
  });

  it("accepts a valid line", () => {
    const res = validateQuickLine({
      category: "Networking",
      description: "Cat6 network point",
      quantity: "4",
      unit: "point",
      selling_price: "1475",
      specification: " Certified ",
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.line_total).toBe(5900);
      expect(res.values.vat_applicable).toBe(true);
      expect(res.values.specification).toBe("Certified");
    }
  });

  it("never silently discards invalid input", () => {
    const res = validateQuickLine({ category: "", description: " ", quantity: "0", unit: "", selling_price: "-2" }) as {
      ok: boolean;
      errors?: Record<string, string>;
    };
    expect(res.ok).toBe(false);
    expect(Object.keys(res.errors ?? {}).sort()).toEqual(["category", "description", "quantity", "selling_price", "unit"]);
  });

});

describe("client-safe output", () => {
  it("only exposes allowlisted customer fields and drops excluded lines", () => {
    const lines = toClientSafeLines(
      [
        {
          id: "1",
          boq_id: "b",
          section_id: "s1",
          item_code: "INT-01",
          description: "Access point",
          specification: "Wi-Fi 6",
          quantity: 2,
          unit: "each",
          customer_unit_rate: 100,
          line_total: 200,
          vat_applicable: true,
          is_included: true,
          notes: "internal note",
          reference: "PO-1",
          sort_order: 1,
        },
        {
          id: "2",
          boq_id: "b",
          section_id: "s1",
          item_code: null,
          description: "Excluded spare",
          specification: null,
          quantity: 1,
          unit: "each",
          customer_unit_rate: 50,
          line_total: 50,
          vat_applicable: true,
          is_included: false,
          notes: null,
          reference: null,
          sort_order: 2,
        },
      ] as any,
      [{ id: "s1", title: "Networking" }],
    );
    expect(lines).toHaveLength(1);
    expect(Object.keys(lines[0]).sort()).toEqual(clientSafeLineKeys().sort());
    expect(JSON.stringify(lines)).not.toMatch(/internal note|INT-01|PO-1|Wi-Fi 6/);
  });
});

describe("plan sync confirmation", () => {
  it("requires explicit confirmation", () => {
    expect(() => assertSyncConfirmed(false)).toThrow(/confirm/i);
    expect(assertSyncConfirmed(true)).toBe(true);
  });
});
