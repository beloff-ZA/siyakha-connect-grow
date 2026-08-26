import React, { useState } from "react";
import { formatQty, formatZar } from "@/lib/boq";
import {
  OPTION_DIFFERENCE_NOTE,
  OPTION_VAT_NOTE,
  isClientVisibleOption,
  sortOptions,
  type OptionLine,
  type SolutionOption,
} from "@/lib/solutionOptions";
import { SCROLL_CONTAINER_CLASS, TOUCH_TARGET_CLASS } from "@/lib/deckMobileNav";
import { ChevronDown, Check } from "lucide-react";

/**
 * Reusable, mobile-first package comparison. Purely presentational: it never
 * writes anything itself and never accepts a BOQ — selecting a preferred option
 * is an explicit, non-destructive callback.
 */

const Money: React.FC<{ label: string; value: number; strong?: boolean }> = ({ label, value, strong }) => (
  <div className="border border-border p-3">
    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    <p className={`mt-1 tabular-nums ${strong ? "text-lg font-semibold" : "text-sm"}`}>{formatZar(value)}</p>
  </div>
);

const OptionSchedule: React.FC<{ lines: OptionLine[]; priceExVat: number }> = ({ lines, priceExVat }) => (
  <div className="mt-4">
    <div
      className={`${SCROLL_CONTAINER_CLASS} border border-border`}
      role="region"
      aria-label="Option schedule — scroll to see all columns"
      tabIndex={0}
    >
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-muted text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Description</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2">Unit</th>
            <th className="px-3 py-2 text-right">Rate excl. VAT</th>
            <th className="px-3 py-2 text-right">Amount excl. VAT</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={`${l.item_code ?? i}`} className="border-t border-border align-top">
              <td className="px-3 py-2">
                <span className="block">{l.description}</span>
                {l.specification && (
                  <span className="mt-1 block text-xs text-muted-foreground">{l.specification}</span>
                )}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{formatQty(l.quantity)}</td>
              <td className="px-3 py-2">{l.unit}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatZar(l.customer_unit_rate)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatZar(l.line_total)}</td>
            </tr>
          ))}
          {lines.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-sm text-muted-foreground" colSpan={5}>
                The detailed schedule for this option has not been issued on this link.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <p className="mt-2 text-xs text-muted-foreground">
      Schedule total excl. VAT: <span className="tabular-nums">{formatZar(priceExVat)}</span>
    </p>
  </div>
);

const Bullets: React.FC<{ title: string; items: string[] }> = ({ title, items }) =>
  items.length ? (
    <div className="mt-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 bg-foreground/50" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

const OptionCard: React.FC<{
  option: SolutionOption;
  lines: OptionLine[];
  preferred: boolean;
  onPrefer?: (option: SolutionOption) => void;
  busy?: boolean;
  adminView?: boolean;
}> = ({ option, lines, preferred, onPrefer, busy, adminView }) => {
  const [open, setOpen] = useState(false);
  const draft = !isClientVisibleOption(option);

  return (
    <article
      className={`flex flex-col border p-5 ${preferred ? "border-foreground" : "border-border"}`}
      aria-label={option.name}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{option.code.replace(/-/g, " ")}</p>
        <div className="flex flex-wrap gap-1.5">
          {option.badge && (
            <span className="border border-foreground px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]">
              {option.badge}
            </span>
          )}
          {adminView && draft && (
            <span className="border border-dashed border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Draft — not issued
            </span>
          )}
          {preferred && (
            <span className="inline-flex items-center gap-1 bg-foreground px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-background">
              <Check className="h-3 w-3" strokeWidth={2} /> Preferred
            </span>
          )}
        </div>
      </div>

      <h3 className="mt-2 text-lg font-semibold tracking-tight">{option.name}</h3>
      {option.comparison_label && (
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{option.comparison_label}</p>
      )}
      {option.quote_reference && (
        <p className="mt-1 text-xs text-muted-foreground">Quote ref {option.quote_reference}</p>
      )}
      {option.summary && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{option.summary}</p>}

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Money label="Price excl. VAT" value={option.price_ex_vat} strong />
        <Money label={`VAT @ ${option.vat_rate}%`} value={option.vat_amount} />
        <Money label="Total incl. VAT" value={option.total_incl_vat} strong />
      </div>

      {option.deposit_incl_vat != null && option.balance_incl_vat != null && (
        <p className="mt-3 text-xs text-muted-foreground">
          Payment: 75% deposit {formatZar(option.deposit_incl_vat)} incl. VAT; balance{" "}
          {formatZar(option.balance_incl_vat)} incl. VAT.
        </p>
      )}

      <Bullets title="Included" items={option.highlights} />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${TOUCH_TARGET_CLASS} mt-4 flex w-full items-center justify-between border border-border px-3 text-xs uppercase tracking-[0.16em]`}
      >
        {open ? "Hide detailed scope" : "View detailed scope & BOQ"}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.5} />
      </button>

      {open && (
        <div>
          <OptionSchedule lines={lines} priceExVat={option.price_ex_vat} />
          <Bullets title="Technical notes" items={option.technical_notes} />
          <Bullets title="Exclusions" items={option.exclusions} />
        </div>
      )}

      {onPrefer && !draft && (
        <button
          type="button"
          disabled={busy || preferred}
          onClick={() => onPrefer(option)}
          className={`${TOUCH_TARGET_CLASS} mt-4 w-full border px-3 text-xs uppercase tracking-[0.16em] disabled:opacity-60 ${
            preferred ? "border-foreground" : "border-foreground bg-foreground text-background"
          }`}
        >
          {preferred ? "Marked as preferred" : "Mark as preferred"}
        </button>
      )}
    </article>
  );
};

const OptionComparison: React.FC<{
  options: SolutionOption[];
  lines: Record<string, OptionLine[]>;
  preferredOptionId?: string | null;
  onPrefer?: (option: SolutionOption) => void;
  busy?: boolean;
  adminView?: boolean;
}> = ({ options, lines, preferredOptionId, onPrefer, busy, adminView }) => {
  const ordered = sortOptions(options);

  if (!ordered.length)
    return (
      <p className="text-sm text-muted-foreground">
        No solution options have been issued on this link yet.
      </p>
    );

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">{OPTION_VAT_NOTE}</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {ordered.map((o) => (
          <OptionCard
            key={o.id}
            option={o}
            lines={lines[o.boq_id ?? ""] ?? []}
            preferred={preferredOptionId === o.id}
            onPrefer={onPrefer}
            busy={busy}
            adminView={adminView}
          />
        ))}
      </div>
      <div className="mt-6 border border-border p-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">How the options compare</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{OPTION_DIFFERENCE_NOTE}</p>
        {onPrefer && (
          <p className="mt-3 text-xs text-muted-foreground">
            Marking an option as preferred is not an acceptance. It simply tells us which package to work up — the
            existing BOQ acceptance step stays separate and unchanged.
          </p>
        )}
      </div>
    </div>
  );
};

export default OptionComparison;
