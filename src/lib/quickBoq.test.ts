import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_CATEGORY,
  isRevisionLocked,
  priceUpdatePatch,
  searchBoqItems,
  validateNewPrice,
  assertSyncConfirmed,
  clientSafeLineKeys,
  pickDefaultBoq,
  previewLineTotal,
  toClientSafeLines,
  validateQuickLine,
  unifiedItemPatch,
  UNIFIED_EDIT_KEYS,
  isPlanQuantityLocked,
  PLAN_QUANTITY_NOTE,
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

const mkItem = (over: Partial<any> = {}) => ({
  id: "i1",
  boq_id: "b1",
  section_id: "s1",
  item_code: "NET-01",
  description: "Cat6 network point",
  specification: "Certified channel test",
  quantity: 4,
  unit: "point",
  customer_unit_rate: 1475,
  line_total: 5900,
  vat_applicable: true,
  is_included: true,
  notes: "internal",
  reference: "PO-9",
  sort_order: 1,
  ...over,
});
const secs = [
  { id: "s1", title: "Networking" },
  { id: "s2", title: "Surveillance" },
];

describe("BOQ item search", () => {
  it("only searches within the selected BOQ revision", () => {
    const items = [mkItem(), mkItem({ id: "i2", boq_id: "b2", description: "Cat6 network point" })] as any;
    const res = searchBoqItems(items, secs, "cat6", "b1");
    expect(res.map((r) => r.item.id)).toEqual(["i1"]);
  });

  it("returns every scoped item for an empty query", () => {
    const items = [mkItem(), mkItem({ id: "i2", section_id: "s2", description: "Camera" })] as any;
    expect(searchBoqItems(items, secs, "   ", "b1")).toHaveLength(2);
    expect(searchBoqItems(items, secs, "", "b2")).toHaveLength(0);
  });

  it("matches case-insensitively across description, code, specification, reference and category", () => {
    const items = [mkItem()] as any;
    for (const q of ["NETWORK point", "net-01", "CERTIFIED", "po-9", "networking"]) {
      expect(searchBoqItems(items, secs, q, "b1")).toHaveLength(1);
    }
    expect(searchBoqItems(items, secs, "surveillance", "b1")).toHaveLength(0);
  });

  it("falls back to the default category when a section is missing", () => {
    const items = [mkItem({ section_id: "gone" })] as any;
    expect(searchBoqItems(items, [], "", "b1")[0].category).toBe(DEFAULT_CATEGORY);
  });
});

describe("safe price updating", () => {
  it("accepts zero and positive numbers and rounds to cents", () => {
    expect(validateNewPrice("0")).toEqual({ ok: true, value: 0 });
    expect(validateNewPrice(" 1499.005 ")).toEqual({ ok: true, value: 1499.01 });
  });

  it("rejects blank, non-numeric and negative prices", () => {
    expect(validateNewPrice("").ok).toBe(false);
    expect(validateNewPrice("abc").ok).toBe(false);
    expect(validateNewPrice(-1).ok).toBe(false);
  });

  it("patches the selling price only, leaving every other field untouched", () => {
    const patch = priceUpdatePatch(1600.004);
    expect(Object.keys(patch)).toEqual(["customer_unit_rate"]);
    expect(patch.customer_unit_rate).toBe(1600);
    const item = mkItem();
    const after = { ...item, ...patch };
    expect(after.quantity).toBe(item.quantity);
    expect(after.section_id).toBe(item.section_id);
    expect(after.description).toBe(item.description);
    expect(after.vat_applicable).toBe(item.vat_applicable);
    expect(after.is_included).toBe(item.is_included);
    expect(after.reference).toBe(item.reference);
  });

  it("treats approved and superseded revisions as locked", () => {
    expect(isRevisionLocked("approved")).toBe(true);
    expect(isRevisionLocked("superseded")).toBe(true);
    expect(isRevisionLocked("draft")).toBe(false);
    expect(isRevisionLocked("shared")).toBe(false);
    expect(isRevisionLocked(undefined)).toBe(false);
  });
});

describe("unified BOQ item editor", () => {
  const cur = {
    ...mkItem(),
    quantity_source: "manual" as string | null,
  };
  const baseInput = {
    title: cur.description,
    category: "Networking",
    section_id: cur.section_id,
    quantity: cur.quantity,
    unit: cur.unit,
    selling_price: cur.customer_unit_rate,
    vat_applicable: true,
    is_included: true,
    item_code: cur.item_code ?? "",
    specification: cur.specification ?? "",
    reference: cur.reference ?? "",
    notes: cur.notes ?? "",
  };

  it("returns no changes when nothing was touched", () => {
    const res = unifiedItemPatch(cur, baseInput);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.changed).toBe(false);
    expect(res.patch).toEqual({});
  });

  it("only ever patches allowlisted fields and never linkage columns", () => {
    const res = unifiedItemPatch(cur, {
      ...baseInput,
      title: "Cat6A point",
      quantity: 6,
      unit: "each",
      selling_price: "1600.004",
      vat_applicable: false,
      is_included: false,
      item_code: "NET-02",
      specification: "New spec",
      reference: "",
      notes: "revised",
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    for (const k of Object.keys(res.patch)) expect(UNIFIED_EDIT_KEYS as readonly string[]).toContain(k);
    expect(res.patch.customer_unit_rate).toBe(1600);
    expect(res.patch.reference).toBeNull();
    const after = { ...cur, ...res.patch } as any;
    expect(after.boq_id).toBe(cur.boq_id);
    expect(after.sort_order).toBe(cur.sort_order);
    expect(after.quantity_source).toBe("manual");
    expect(after.line_total).toBe(cur.line_total);
    expect(JSON.stringify(res.patch)).not.toMatch(/cost|markup|margin|supplier/i);
  });

  it("protects plan-derived quantities without blocking other edits", () => {
    const planned = { ...cur, quantity_source: "plan" };
    expect(isPlanQuantityLocked(planned)).toBe(true);
    expect(isPlanQuantityLocked(cur)).toBe(false);
    const res = unifiedItemPatch(planned, { ...baseInput, quantity: 999, selling_price: 1500 });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.patch.quantity).toBeUndefined();
    expect(res.patch.customer_unit_rate).toBe(1500);
    expect(PLAN_QUANTITY_NOTE).toMatch(/Review items from plans/);
  });

  it("validates title, category, unit, quantity and selling price", () => {
    const res = unifiedItemPatch(cur, {
      ...baseInput,
      title: "  ",
      category: "",
      section_id: "",
      unit: " ",
      quantity: -1,
      selling_price: "abc",
    });
    expect(res.ok).toBe(false);
    if (res.ok) throw new Error("expected validation to fail");
    expect(Object.keys(res.errors).sort()).toEqual(["category", "description", "quantity", "selling_price", "unit"]);
    expect(unifiedItemPatch(cur, { ...baseInput, quantity: 0 }).ok).toBe(true);
  });

  it("keeps the same editor usable from search results and respects locked revisions", () => {
    const hit = searchBoqItems([cur] as any, secs, "cat6", "b1")[0];
    expect(hit).toBeTruthy();
    const res = unifiedItemPatch({ ...cur, ...hit.item }, { ...baseInput, title: "Renamed from search" });
    expect(res.ok && res.patch.description).toBe("Renamed from search");
    expect(isRevisionLocked("superseded")).toBe(true);
    expect(isRevisionLocked("draft")).toBe(false);
  });
});
