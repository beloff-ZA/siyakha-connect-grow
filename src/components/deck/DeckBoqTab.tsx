import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/portalFiles";
import { formatQty, formatZar } from "@/lib/boq";
import {
  ACCEPTANCE_TERMS,
  BOQ_NOT_ISSUED_MESSAGE,
  PREVIOUS_REVISION_MESSAGE,
  REVISION_SCOPE_NOTE,
  acceptanceState,
  assertAcceptanceAllowed,
  cleanPoReference,
  groupBoqSections,
  viewerFullName,
  type BoqAcceptance,
  type ClientBoqLine,
  type DeckViewer,
} from "@/lib/deckViewer";
import { Check, Printer } from "lucide-react";

type Boq = {
  id: string;
  title: string;
  revision_label: string | null;
  version_no: number | null;
  status: string;
  vat_rate: number;
  valid_until: string | null;
  updated_at: string;
};

/**
 * Client-safe BOQ presentation and the single acceptance write path. Nothing is
 * accepted by opening this tab: only the confirmation dialog's explicit click
 * calls `onAccept`.
 */
const DeckBoqTab: React.FC<{
  viewer: DeckViewer;
  boq: Boq | null;
  lines: ClientBoqLine[];
  totals: { subtotal: number; vat: number; total: number };
  revisionHash: string;
  acceptances: BoqAcceptance[];
  pendingReason?: string | null;
  onAccept: (input: { revision_hash: string; po_reference: string | null }) => Promise<void>;
}> = ({ viewer, boq, lines, totals, revisionHash, acceptances, pendingReason, onAccept }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [po, setPo] = useState("");
  const [dialog, setDialog] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = acceptanceState(acceptances, revisionHash);
  const current = acceptances.find((a) => a.revision_hash === revisionHash) ?? null;
  const sections = useMemo(() => groupBoqSections(lines), [lines]);

  if (!boq || !lines.length)
    return (
      <div className="border border-border p-6">
        <p className="text-sm font-medium">{BOQ_NOT_ISSUED_MESSAGE}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your bill of quantities will appear here as soon as a revision is issued for review. No pricing is shown until
          then.
        </p>
      </div>
    );

  const accept = async () => {
    setError(null);
    setBusy(true);
    try {
      assertAcceptanceAllowed({ boq_id: boq.id, revision_hash: revisionHash, confirmed, trigger: "user" });
      await onAccept({ revision_hash: revisionHash, po_reference: cleanPoReference(po) });
      setDialog(false);
    } catch (e) {
      setError((e as Error)?.message ?? "Could not record the acceptance.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Document", boq.title],
          ["Revision", boq.revision_label ?? `v${boq.version_no ?? 1}`],
          ["Status", boq.status],
          ["Issued", formatDate(boq.updated_at)],
        ].map(([label, value]) => (
          <div key={label} className="border border-border p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>
      {boq.valid_until && (
        <p className="text-xs text-muted-foreground">Valid until {formatDate(boq.valid_until)}.</p>
      )}

      {sections.map((section) => (
        <section key={section.title}>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">{section.title}</h3>
          <div className="mt-3 overflow-x-auto border border-border">
            <table className="w-full min-w-[720px] text-sm">
              <caption className="sr-only">{section.title} schedule of client rates</caption>
              <thead className="bg-muted text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2">Code</th>
                  <th scope="col" className="px-3 py-2">Item</th>
                  <th scope="col" className="px-3 py-2 text-right">Qty</th>
                  <th scope="col" className="px-3 py-2">Unit</th>
                  <th scope="col" className="px-3 py-2 text-right">Rate excl VAT</th>
                  <th scope="col" className="px-3 py-2 text-right">Amount excl VAT</th>
                </tr>
              </thead>
              <tbody>
                {section.lines.map((l, i) => (
                  <tr key={`${l.item_code ?? i}`} className="border-t border-border align-top">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">{l.item_code ?? "—"}</td>
                    <td className="px-3 py-2">
                      {l.description}
                      {l.specification && (
                        <span className="block text-xs text-muted-foreground">{l.specification}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatQty(l.quantity)}</td>
                    <td className="px-3 py-2">{l.unit}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatZar(l.customer_unit_rate)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatZar(l.line_total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/40">
                  <td className="px-3 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground" colSpan={5}>
                    {section.title} subtotal
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatZar(section.subtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      ))}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Subtotal excl VAT", totals.subtotal],
          [`VAT @ ${Number(boq.vat_rate ?? 15)}%`, totals.vat],
          ["Total incl VAT", totals.total],
        ].map(([label, value]) => (
          <div key={label as string} className="border border-border p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{formatZar(value as number)}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{REVISION_SCOPE_NOTE}</p>

      {/* ------------------------------------------------ review and accept */}
      <section className="border border-border p-5" aria-labelledby="accept-heading">
        <h3 id="accept-heading" className="text-sm font-semibold uppercase tracking-[0.16em]">
          Review and accept
        </h3>

        {state === "accepted" && current ? (
          <div className="mt-4 space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Check className="h-4 w-4" strokeWidth={1.5} /> Accepted on {formatDate(current.accepted_at)}
            </p>
            <div className="border border-border p-4 text-sm">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Acceptance receipt</p>
              <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <dt className="text-muted-foreground">Accepted by</dt>
                <dd>{current.full_name} · {current.email}</dd>
                <dt className="text-muted-foreground">Revision</dt>
                <dd>{current.revision_label ?? boq.revision_label ?? "—"}</dd>
                <dt className="text-muted-foreground">Reference fingerprint</dt>
                <dd className="font-mono text-xs">{current.revision_hash}</dd>
                {current.po_reference && (
                  <>
                    <dt className="text-muted-foreground">Your reference</dt>
                    <dd>{current.po_reference}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">Subtotal excl VAT</dt>
                <dd className="tabular-nums">{formatZar(Number(current.subtotal))}</dd>
                <dt className="text-muted-foreground">VAT</dt>
                <dd className="tabular-nums">{formatZar(Number(current.vat))}</dd>
                <dt className="text-muted-foreground">Total incl VAT</dt>
                <dd className="tabular-nums">{formatZar(Number(current.total))}</dd>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">{ACCEPTANCE_TERMS}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" strokeWidth={1.5} /> Print receipt
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {state === "previous_revision" && (
              <p className="border border-border bg-muted/40 p-3 text-sm font-medium">{PREVIOUS_REVISION_MESSAGE}</p>
            )}
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{viewerFullName(viewer)}</dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{viewer.email}</dd>
            </dl>

            <div className="flex gap-3">
              <input
                id="accept-confirm"
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <label htmlFor="accept-confirm" className="text-xs leading-relaxed text-muted-foreground">
                {ACCEPTANCE_TERMS}
              </label>
            </div>

            <div className="max-w-sm">
              <label htmlFor="po" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Purchase order / your reference (optional)
              </label>
              <Input id="po" className="mt-1" value={po} onChange={(e) => setPo(e.target.value)} />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button disabled={!confirmed} onClick={() => setDialog(true)}>
              Accept BOQ
            </Button>
          </div>
        )}
      </section>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md border border-border bg-background p-6">
            <h4 id="confirm-title" className="text-sm font-semibold uppercase tracking-[0.16em]">
              Confirm acceptance
            </h4>
            <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <dt className="text-muted-foreground">Revision</dt>
              <dd>{boq.revision_label ?? `v${boq.version_no ?? 1}`}</dd>
              <dt className="text-muted-foreground">Subtotal excl VAT</dt>
              <dd className="tabular-nums">{formatZar(totals.subtotal)}</dd>
              <dt className="text-muted-foreground">VAT @ {Number(boq.vat_rate ?? 15)}%</dt>
              <dd className="tabular-nums">{formatZar(totals.vat)}</dd>
              <dt className="text-muted-foreground">Total incl VAT</dt>
              <dd className="tabular-nums">{formatZar(totals.total)}</dd>
            </dl>
            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button disabled={busy} onClick={accept}>
                {busy ? "Recording…" : "Confirm acceptance"}
              </Button>
              <Button variant="outline" disabled={busy} onClick={() => setDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckBoqTab;
