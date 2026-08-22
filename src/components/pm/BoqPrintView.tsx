import React from "react";
import { formatQty, formatZar } from "@/lib/boq";
import { formatDate } from "@/lib/portalFiles";
import { SIYAKHA, type ProposalSnapshot } from "@/lib/proposals";

/**
 * Customer-facing BOQ document. It renders only from a client-safe snapshot, so
 * supplier names, supplier costs, markup, margin and internal notes can never
 * appear on a printed customer document.
 */
const BoqPrintView: React.FC<{ snapshot: ProposalSnapshot }> = ({ snapshot }) => {
  const { client, site, project, boq, sections, totals } = snapshot;
  return (
    <article className="boq-print-root doc-root bg-white text-black">
      <header className="mb-6 border-b-2 border-black pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[15pt] font-bold uppercase tracking-[0.14em]">{SIYAKHA.company}</p>
            <p className="mt-1 text-[8.5pt] text-neutral-600">{SIYAKHA.email} · {SIYAKHA.website}</p>
          </div>
          <div className="text-right text-[9pt]">
            <p className="font-semibold uppercase tracking-[0.18em]">Bill of quantities</p>
            {boq && (
              <>
                <p className="mt-1">{boq.revision_label} (v{boq.version_no})</p>
                <p>Valid until: {formatDate(boq.valid_until)}</p>
              </>
            )}
            <p>Printed: {formatDate(new Date().toISOString())}</p>
          </div>
        </div>
        <h1 className="mt-4 text-[13pt] font-semibold">{boq?.title ?? project?.title ?? "Bill of quantities"}</h1>
      </header>

      <section className="print-block mb-6 grid grid-cols-2 gap-6 text-[10pt]">
        <div>
          <p className="text-[8pt] uppercase tracking-[0.18em] text-neutral-500">Client</p>
          <p className="font-semibold">{client?.display_name ?? "—"}</p>
          {client?.contact_name && <p>{client.contact_name}</p>}
          {client?.contact_email && <p>{client.contact_email}</p>}
        </div>
        <div>
          <p className="text-[8pt] uppercase tracking-[0.18em] text-neutral-500">Site &amp; project</p>
          <p className="font-semibold">{site?.name ?? project?.title ?? "—"}</p>
          {site?.address && <p>{site.address}</p>}
          <p>Project: {project?.title ?? "—"}</p>
          {project?.reference && <p>Reference: {project.reference}</p>}
        </div>
      </section>

      {sections.map((sec, si) => (
        <section key={si} className="print-block mb-5">
          <p className="mb-1 text-[10pt] font-semibold uppercase tracking-[0.1em]">{sec.title}</p>
          {sec.description && <p className="mb-1 text-[9pt] text-neutral-600">{sec.description}</p>}
          <table className="w-full border-collapse text-[9pt]">
            <thead>
              <tr className="border-y border-black text-left">
                <th className="w-[16mm] py-1 pr-2 font-semibold">Code</th>
                <th className="py-1 pr-2 font-semibold">Description</th>
                <th className="w-[16mm] py-1 pr-2 text-right font-semibold">Qty</th>
                <th className="w-[14mm] py-1 pr-2 font-semibold">Unit</th>
                <th className="w-[24mm] py-1 pr-2 text-right font-semibold">Rate</th>
                <th className="w-[26mm] py-1 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sec.lines.map((l, li) => (
                <tr key={li} className="border-b border-neutral-300 align-top">
                  <td className="py-1 pr-2">{l.item_code ?? ""}</td>
                  <td className="py-1 pr-2">
                    {l.description}
                    {l.specification && <span className="block text-[8pt] text-neutral-600">{l.specification}</span>}
                  </td>
                  <td className="py-1 pr-2 text-right tabular-nums">{formatQty(l.quantity)}</td>
                  <td className="py-1 pr-2">{l.unit}</td>
                  <td className="py-1 pr-2 text-right tabular-nums">{formatZar(l.customer_unit_rate)}</td>
                  <td className="py-1 text-right tabular-nums">{formatZar(l.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <table className="ml-auto mt-2 w-[80mm] border-collapse text-[10pt]">
        <tbody>
          <tr className="border-t border-black">
            <td className="py-1">Subtotal (excl. VAT)</td>
            <td className="py-1 text-right tabular-nums">{formatZar(totals.subtotal)}</td>
          </tr>
          <tr>
            <td className="py-1">VAT @ {Number(boq?.vat_rate ?? 15)}%</td>
            <td className="py-1 text-right tabular-nums">{formatZar(totals.vat)}</td>
          </tr>
          <tr className="border-y-2 border-black font-semibold">
            <td className="py-1.5">Total (incl. VAT)</td>
            <td className="py-1.5 text-right tabular-nums">{formatZar(totals.total)}</td>
          </tr>
        </tbody>
      </table>

      {boq?.notes && <p className="mt-3 text-[9pt] text-neutral-700">{boq.notes}</p>}

      <footer className="mt-8 border-t border-black pt-3 text-[8.5pt] text-neutral-700">
        <p className="font-semibold uppercase tracking-[0.16em]">{SIYAKHA.company}</p>
        <p>
          {SIYAKHA.email} · {SIYAKHA.website} · {SIYAKHA.phone}
        </p>
      </footer>
    </article>
  );
};

export default BoqPrintView;
