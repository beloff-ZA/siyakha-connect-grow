import { describe, expect, it } from "vitest";
import {
  isClientVisibleOption,
  linesReconcile,
  lowestCostOption,
  normalizeOption,
  optionTotalsReconcile,
  paymentSplitReconciles,
  sortOptions,
  type SolutionOption,
} from "./solutionOptions";

const option = (over: Partial<SolutionOption> = {}): SolutionOption =>
  normalizeOption({
    id: over.id ?? "1",
    project_id: "p",
    code: "OPTION-1",
    name: "Option",
    price_ex_vat: 100,
    vat_rate: 15,
    vat_amount: 15,
    total_incl_vat: 115,
    status: "available",
    client_visible: true,
    sort_order: 1,
    ...over,
  } as never);

describe("solution option totals", () => {
  it("reconciles the three published Goldkeys options exactly", () => {
    const rows = [
      { price_ex_vat: 949800, vat_rate: 15, vat_amount: 142470, total_incl_vat: 1092270 },
      { price_ex_vat: 511217.39, vat_rate: 15, vat_amount: 76682.61, total_incl_vat: 587900 },
      { price_ex_vat: 549500, vat_rate: 15, vat_amount: 82425, total_incl_vat: 631925 },
    ];
    for (const r of rows) expect(optionTotalsReconcile(r)).toBe(true);
  });

  it("rejects a mismatched VAT figure", () => {
    expect(optionTotalsReconcile({ price_ex_vat: 1000, vat_rate: 15, vat_amount: 100, total_incl_vat: 1100 })).toBe(false);
  });

  it("checks the 75/25 payment splits", () => {
    expect(paymentSplitReconciles({ deposit_incl_vat: 440925, balance_incl_vat: 146975, total_incl_vat: 587900 })).toBe(true);
    expect(paymentSplitReconciles({ deposit_incl_vat: 473943.75, balance_incl_vat: 157981.25, total_incl_vat: 631925 })).toBe(true);
    expect(paymentSplitReconciles({ deposit_incl_vat: 1, balance_incl_vat: 1, total_incl_vat: 587900 })).toBe(false);
    expect(paymentSplitReconciles({ deposit_incl_vat: null, balance_incl_vat: null, total_incl_vat: 10 })).toBe(true);
  });

  it("reconciles a priced schedule against the published price", () => {
    const lines = [{ line_total: 112200 }, { line_total: 399017.39 }];
    expect(linesReconcile(lines, 511217.39)).toBe(true);
    expect(linesReconcile(lines, 511217.4)).toBe(false);
    expect(linesReconcile(lines, 500000)).toBe(false);
  });
});

describe("option visibility", () => {
  it("only shows issued, non-draft options to clients", () => {
    expect(isClientVisibleOption(option())).toBe(true);
    expect(isClientVisibleOption(option({ status: "draft" }))).toBe(false);
    expect(isClientVisibleOption(option({ client_visible: false }))).toBe(false);
  });

  it("normalises missing json arrays to empty lists", () => {
    const o = normalizeOption({ id: "x", code: "C", name: "N" });
    expect(o.highlights).toEqual([]);
    expect(o.technical_notes).toEqual([]);
    expect(o.exclusions).toEqual([]);
    expect(o.client_visible).toBe(false);
  });
});

describe("ordering and comparison", () => {
  it("sorts by sort order then code", () => {
    const rows = [option({ id: "b", sort_order: 2, code: "OPTION-2" }), option({ id: "a", sort_order: 1 })];
    expect(sortOptions(rows).map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("identifies the lowest initial cost option", () => {
    const rows = [
      option({ id: "1", price_ex_vat: 949800 }),
      option({ id: "2", price_ex_vat: 511217.39 }),
      option({ id: "3", price_ex_vat: 549500 }),
    ];
    expect(lowestCostOption(rows)?.id).toBe("2");
  });
});
