import React from "react";
import { formatQty, formatZar } from "@/lib/boq";
import { formatDate } from "@/lib/portalFiles";
import { SIYAKHA } from "@/lib/proposals";
import { lineKindLabel } from "@/lib/lifecycle";
import type { InternalCommercial } from "@/lib/projectPack";

/**
 * Admin-only commercial report. This document is never bundled into the client
 * pack and is generated from its own loader, so it cannot leak into client output.
 */
const InternalReportDocument: React.FC<{ report: InternalCommercial }> = ({ report }) => (
  <article className="doc-root bg-white text-black">
    <header className="mb-6 border-b-2 border-black pb-3">
      <p className="text-[14pt] font-bold uppercase tracking-[0.14em]">{SIYAKHA.company}</p>
      <p className="mt-1 text-[10pt] font-semibold uppercase tracking-[0.18em]">Internal commercial report — confidential</p>
      <p className="mt-1 text-[9pt] text-neutral-600">
        {report.project_title} · {report.client_name} · {report.boq_label ?? "No BOQ"} · generated{" "}
        {formatDate(report.generated_at)}
      </p>
      <p className="mt-2 text-[8.5pt] text-neutral-700">
        Not for client distribution. Contains supplier identities, supplier costs, markup and margin.
      </p>
    </header>

    <section className="print-block mb-6 grid grid-cols-4 gap-4 text-[9.5pt]">
      {[
        ["Revenue (excl. VAT)", formatZar(report.revenue)],
        ["Supplier cost", formatZar(report.cost)],
        ["Gross profit", formatZar(report.gross_profit)],
        ["Margin", `${report.margin_percent.toFixed(1)}%`],
      ].map(([k, v]) => (
        <div key={k} className="border border-black p-2">
          <p className="text-[7.5pt] uppercase tracking-[0.16em] text-neutral-500">{k}</p>
          <p className="mt-1 text-[11pt] font-semibold tabular-nums">{v}</p>
        </div>
      ))}
    </section>

    <section className="print-block mb-6">
      <p className="mb-1 text-[10pt] font-semibold uppercase tracking-[0.1em]">Line-by-line commercial analysis</p>
      <table className="w-full border-collapse text-[8pt]">
        <thead>
          <tr className="border-y border-black text-left">
            {["Section", "Code", "Description", "Kind", "Qty", "Sell rate", "Revenue", "Supplier", "Cost/unit", "Markup", "Cost", "GP", "Margin"].map((h) => (
              <th key={h} className="py-1 pr-1.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.lines.map((l, i) => (
            <tr key={i} className="border-b border-neutral-300 align-top">
              <td className="py-1 pr-1.5">{l.section}</td>
              <td className="py-1 pr-1.5">{l.item_code ?? "—"}</td>
              <td className="py-1 pr-1.5">{l.description}</td>
              <td className="py-1 pr-1.5">{lineKindLabel(l.line_kind)}</td>
              <td className="py-1 pr-1.5 tabular-nums">{formatQty(l.quantity)}</td>
              <td className="py-1 pr-1.5 tabular-nums">{formatZar(l.customer_unit_rate)}</td>
              <td className="py-1 pr-1.5 tabular-nums">{formatZar(l.line_total)}</td>
              <td className="py-1 pr-1.5">{l.supplier ?? "—"}</td>
              <td className="py-1 pr-1.5 tabular-nums">{formatZar(l.supplier_unit_cost)}</td>
              <td className="py-1 pr-1.5 tabular-nums">{l.markup_percent.toFixed(1)}%</td>
              <td className="py-1 pr-1.5 tabular-nums">{formatZar(l.cost_total)}</td>
              <td className="py-1 pr-1.5 tabular-nums">{formatZar(l.gross_profit)}</td>
              <td className="py-1 tabular-nums">{l.margin_percent.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!report.lines.length && <p className="text-[9pt] text-neutral-500">No BOQ lines captured for this project.</p>}
    </section>

    <section className="print-block break-before-page">
      <p className="mb-1 text-[10pt] font-semibold uppercase tracking-[0.1em]">Procurement and asset costs</p>
      <table className="w-full border-collapse text-[8pt]">
        <thead>
          <tr className="border-y border-black text-left">
            {["Asset tag", "Serial", "Manufacturer", "Model", "Supplier", "Purchase date", "PO reference", "Warranty", "Status", "Internal notes"].map((h) => (
              <th key={h} className="py-1 pr-1.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.assets.map((a: any) => (
            <tr key={a.id} className="border-b border-neutral-300 align-top">
              <td className="py-1 pr-1.5">{a.asset_tag ?? "—"}</td>
              <td className="py-1 pr-1.5">{a.serial_number ?? "—"}</td>
              <td className="py-1 pr-1.5">{a.manufacturer ?? "—"}</td>
              <td className="py-1 pr-1.5">{a.model ?? "—"}</td>
              <td className="py-1 pr-1.5">{a.supplier ?? "—"}</td>
              <td className="py-1 pr-1.5">{formatDate(a.purchase_date)}</td>
              <td className="py-1 pr-1.5">{a.po_reference ?? "—"}</td>
              <td className="py-1 pr-1.5">{formatDate(a.warranty_expiry)}</td>
              <td className="py-1 pr-1.5">{a.lifecycle_status}</td>
              <td className="py-1">{a.notes ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!report.assets.length && <p className="text-[9pt] text-neutral-500">No procured assets captured yet.</p>}
    </section>
  </article>
);

export default InternalReportDocument;
