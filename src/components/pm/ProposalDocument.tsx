import React from "react";
import { formatQty, formatZar } from "@/lib/boq";
import { formatDate } from "@/lib/portalFiles";
import { SIYAKHA, validUntil, type Proposal } from "@/lib/proposals";

/**
 * Client-facing A4 document. It renders exclusively from the immutable snapshot,
 * which never contains supplier names, supplier costs, markup, margin or
 * internal notes.
 */
const Para: React.FC<{ text?: string | null }> = ({ text }) => {
  if (!text?.trim()) return <p className="text-[10pt] italic text-neutral-500">Not specified.</p>;
  return (
    <div className="space-y-1.5">
      {text
        .split("\n")
        .filter((l) => l.trim())
        .map((line, i) => (
          <p key={i} className="text-[10pt] leading-relaxed">
            {line}
          </p>
        ))}
    </div>
  );
};

const H: React.FC<{ n: string; children: React.ReactNode }> = ({ n, children }) => (
  <h2 className="mb-2 border-b border-black pb-1 text-[11pt] font-semibold uppercase tracking-[0.14em]">
    {n}. {children}
  </h2>
);

const Block: React.FC<{ children: React.ReactNode }> = ({ children }) => <section className="print-block mb-6">{children}</section>;

const ProposalDocument: React.FC<{ proposal: Proposal; variant: "full" | "costing" }> = ({ proposal, variant }) => {
  const s = proposal.snapshot;
  const totals = s?.totals ?? { subtotal: 0, vat: 0, total: 0 };
  const vatRate = s?.boq?.vat_rate ?? 15;
  const issued = proposal.issued_at ?? proposal.created_at;
  const docLabel = variant === "full" ? "Proposal" : "Official Costing";
  let idx = 0;
  const n = () => String(++idx);

  return (
    <article className="boq-print-root doc-root bg-white text-black">
      {/* Cover / header */}
      <header className="mb-8 border-b-2 border-black pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[16pt] font-bold uppercase tracking-[0.14em]">{SIYAKHA.company}</p>
            <p className="mt-1 max-w-[110mm] text-[8.5pt] leading-snug text-neutral-600">{SIYAKHA.positioning}</p>
          </div>
          <div className="text-right text-[9pt]">
            <p className="font-semibold uppercase tracking-[0.18em]">{docLabel}</p>
            <p className="mt-1">{proposal.proposal_number}</p>
            <p>{proposal.revision_label}</p>
            <p>Date: {formatDate(issued)}</p>
            <p>Status: {proposal.status}</p>
          </div>
        </div>
        <h1 className="mt-5 text-[15pt] font-semibold leading-tight">{proposal.title}</h1>
      </header>

      {/* Client / site / project */}
      <Block>
        <H n={n()}>Client &amp; site</H>
        <div className="grid grid-cols-2 gap-6 text-[10pt]">
          <div>
            <p className="text-[8pt] uppercase tracking-[0.18em] text-neutral-500">Prepared for</p>
            <p className="font-semibold">{s?.client?.display_name ?? "—"}</p>
            {s?.client?.contact_name && <p>{s.client.contact_name}</p>}
            {s?.client?.contact_email && <p>{s.client.contact_email}</p>}
            {s?.client?.phone && <p>{s.client.phone}</p>}
          </div>
          <div>
            <p className="text-[8pt] uppercase tracking-[0.18em] text-neutral-500">Site &amp; project</p>
            <p className="font-semibold">{s?.site?.name ?? s?.project?.title ?? "—"}</p>
            {s?.site?.address && <p>{s.site.address}</p>}
            {[s?.site?.city, s?.site?.province].filter(Boolean).length > 0 && (
              <p>{[s?.site?.city, s?.site?.province].filter(Boolean).join(", ")}</p>
            )}
            <p>Project: {s?.project?.title ?? "—"}</p>
            {s?.project?.reference && <p>Reference: {s.project.reference}</p>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 border border-black p-3 text-[9pt]">
          <p>
            <span className="text-neutral-500">Prepared by:</span> {proposal.prepared_by_name ?? "Siyakha Technology Solutions"}
          </p>
          <p>
            <span className="text-neutral-500">Valid until:</span> {formatDate(validUntil(proposal).toISOString())} ({proposal.validity_days} days)
          </p>
          <p>
            <span className="text-neutral-500">Pricing reference:</span>{" "}
            {s?.boq ? `${s.boq.title} · ${s.boq.revision_label}` : "—"}
          </p>
        </div>
      </Block>

      {variant === "full" && (
        <>
          <Block>
            <H n={n()}>Executive summary</H>
            <Para text={proposal.executive_summary} />
          </Block>

          <Block>
            <H n={n()}>Project understanding</H>
            <Para text={proposal.project_understanding} />
          </Block>

          <Block>
            <H n={n()}>Scope of work</H>
            <Para text={proposal.scope_of_work} />
          </Block>

          <Block>
            <H n={n()}>Methodology &amp; implementation approach</H>
            <Para text={proposal.methodology} />
          </Block>

          <Block>
            <H n={n()}>Deliverables</H>
            <Para text={proposal.deliverables} />
          </Block>

          <Block>
            <H n={n()}>Project schedule</H>
            <div className="text-[10pt]">
              <p>Planned commencement: {formatDate(proposal.planned_start_date)}</p>
              <p>Planned completion: {formatDate(proposal.planned_completion_date)}</p>
              <p className="mt-1 text-[9pt] text-neutral-600">
                Programme dates are subject to site access, order confirmation and equipment lead times.
              </p>
            </div>
          </Block>
        </>
      )}

      {/* Pricing schedule */}
      <Block>
        <H n={n()}>{variant === "full" ? "Pricing schedule (bill of quantities)" : "Schedule of quantities and rates"}</H>
        {!s?.sections?.length ? (
          <p className="text-[10pt] italic text-neutral-500">No priced lines captured in this snapshot.</p>
        ) : (
          s.sections.map((sec, si) => (
            <div key={si} className="mb-5">
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
                  {sec.lines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-1 text-[9pt] italic text-neutral-500">
                        No lines in this section.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))
        )}

        <table className="ml-auto mt-3 w-[80mm] border-collapse text-[10pt]">
          <tbody>
            <tr className="border-t border-black">
              <td className="py-1">Subtotal (excl. VAT)</td>
              <td className="py-1 text-right tabular-nums">{formatZar(totals.subtotal)}</td>
            </tr>
            <tr>
              <td className="py-1">VAT @ {Number(vatRate)}%</td>
              <td className="py-1 text-right tabular-nums">{formatZar(totals.vat)}</td>
            </tr>
            <tr className="border-y-2 border-black font-semibold">
              <td className="py-1.5">Total due (incl. VAT)</td>
              <td className="py-1.5 text-right tabular-nums">{formatZar(totals.total)}</td>
            </tr>
          </tbody>
        </table>
        {s?.boq?.notes && <p className="mt-2 text-[9pt] text-neutral-600">{s.boq.notes}</p>}
      </Block>

      <Block>
        <H n={n()}>Assumptions</H>
        <Para text={proposal.assumptions} />
      </Block>

      <Block>
        <H n={n()}>Exclusions</H>
        <Para text={proposal.exclusions} />
      </Block>

      <Block>
        <H n={n()}>Warranty</H>
        <Para text={proposal.warranty_terms} />
      </Block>

      <Block>
        <H n={n()}>Payment terms &amp; validity</H>
        <Para text={proposal.payment_terms} />
        <p className="mt-2 text-[10pt]">
          This {docLabel.toLowerCase()} is valid for {proposal.validity_days} days from {formatDate(issued)} (until{" "}
          {formatDate(validUntil(proposal).toISOString())}).
        </p>
      </Block>

      <Block>
        <H n={n()}>Acceptance</H>
        <p className="text-[10pt]">
          By signing below, the client accepts {docLabel.toLowerCase()} {proposal.proposal_number} ({proposal.revision_label}) and
          authorises {SIYAKHA.company} to proceed with the scope and pricing set out above.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-8 text-[9pt]">
          {["Client acceptance", `For ${SIYAKHA.company}`].map((label) => (
            <div key={label}>
              <p className="mb-8 uppercase tracking-[0.16em] text-neutral-500">{label}</p>
              <div className="border-t border-black pt-1">Name</div>
              <div className="mt-5 border-t border-black pt-1">Signature</div>
              <div className="mt-5 border-t border-black pt-1">Date</div>
            </div>
          ))}
        </div>
      </Block>

      <footer className="mt-8 border-t border-black pt-3 text-[8.5pt] text-neutral-700">
        <p className="font-semibold uppercase tracking-[0.16em]">{SIYAKHA.company}</p>
        <p>
          {SIYAKHA.email} · {SIYAKHA.website} · {SIYAKHA.phone}
        </p>
        <p className="mt-1">
          {docLabel} {proposal.proposal_number} · {proposal.revision_label} · Issued {formatDate(issued)}
        </p>
      </footer>
    </article>
  );
};

export default ProposalDocument;
