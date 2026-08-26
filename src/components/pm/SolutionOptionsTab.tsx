import React, { useCallback, useEffect, useState } from "react";
import { Panel } from "./ui";
import OptionComparison from "@/components/deck/OptionComparison";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/portalFiles";
import {
  isClientVisibleOption,
  linesReconcile,
  loadOptionLines,
  loadOptionPreferences,
  loadSolutionOptions,
  optionTotalsReconcile,
  paymentSplitReconciles,
  setOptionVisibility,
  sortOptions,
  type OptionLine,
  type OptionPreference,
  type SolutionOption,
} from "@/lib/solutionOptions";

/**
 * Admin view of the project's package options. Publishing an option only flips
 * its client visibility — no BOQ revision, floor plan, marker or rack record is
 * ever modified from here, and drafts stay internal until explicitly issued.
 */
const SolutionOptionsTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { toast } = useToast();
  const [options, setOptions] = useState<SolutionOption[]>([]);
  const [lines, setLines] = useState<Record<string, OptionLine[]>>({});
  const [prefs, setPrefs] = useState<OptionPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState("");

  const reload = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const [rows, preferences] = await Promise.all([
        loadSolutionOptions(projectId),
        loadOptionPreferences(projectId),
      ]);
      const schedules = await Promise.all(
        rows.map(async (o) => [o.boq_id ?? "", o.boq_id ? await loadOptionLines(o.boq_id) : []] as const),
      );
      setOptions(rows);
      setPrefs(preferences);
      setLines(Object.fromEntries(schedules.filter(([id]) => id)));
    } catch (e) {
      setError((e as Error)?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggle = async (option: SolutionOption) => {
    setBusyId(option.id);
    try {
      const issue = !isClientVisibleOption(option);
      await setOptionVisibility(option.id, issue);
      toast({ title: issue ? "Option issued to the client view" : "Option withdrawn to draft" });
      await reload();
    } catch (e) {
      toast({ title: "Could not update", description: (e as Error)?.message, variant: "destructive" as never });
    } finally {
      setBusyId("");
    }
  };

  if (!projectId) return <p className="text-sm text-muted-foreground">Select a project to manage its options.</p>;

  const preferredOptionId = prefs[0]?.option_id ?? null;

  return (
    <div className="space-y-6">
      <Panel title="Solution options — publishing">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading options…</p>
        ) : error ? (
          <p className="border border-destructive p-3 text-sm text-destructive">{error}</p>
        ) : options.length === 0 ? (
          <p className="text-sm text-muted-foreground">No package options have been captured for this project.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Option</th>
                  <th className="px-3 py-2 text-right">Excl. VAT</th>
                  <th className="px-3 py-2 text-right">Incl. VAT</th>
                  <th className="px-3 py-2">Checks</th>
                  <th className="px-3 py-2">Client view</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {sortOptions(options).map((o) => {
                  const schedule = lines[o.boq_id ?? ""] ?? [];
                  const ok =
                    optionTotalsReconcile(o) && paymentSplitReconciles(o) && linesReconcile(schedule, o.price_ex_vat);
                  return (
                    <tr key={o.id} className="border-t border-border">
                      <td className="px-3 py-2">
                        <span className="block font-medium">{o.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {o.code}
                          {o.quote_reference ? ` · ${o.quote_reference}` : ""}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{o.price_ex_vat.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{o.total_incl_vat.toFixed(2)}</td>
                      <td className="px-3 py-2 text-xs">
                        {ok ? "Totals reconcile" : "Check totals / schedule"}
                      </td>
                      <td className="px-3 py-2 text-xs uppercase tracking-[0.16em]">
                        {isClientVisibleOption(o) ? "Issued" : "Draft — internal"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          disabled={busyId === o.id}
                          onClick={() => toggle(o)}
                          className="min-h-[44px] border border-border px-3 text-[11px] uppercase tracking-[0.18em] disabled:opacity-60"
                        >
                          {isClientVisibleOption(o) ? "Withdraw to draft" : "Issue to client"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Each option carries its own bill of quantities revision. Issuing or withdrawing an option never changes,
          supersedes or deletes any existing BOQ, floor plan, device marker or rack record.
        </p>
      </Panel>

      <Panel title="Client preferred option (non-destructive)">
        {prefs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No client has marked a preferred option yet. A preference is not an acceptance — the BOQ acceptance audit is
            separate and unchanged.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {prefs.map((p) => (
              <li key={p.id} className="border border-border p-3">
                <span className="font-medium">
                  {options.find((o) => o.id === p.option_id)?.name ?? "Option"}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {[p.full_name, p.email].filter(Boolean).join(" · ")} · {formatDate(p.selected_at)}
                </span>
                {p.note && <span className="mt-1 block text-xs text-muted-foreground">{p.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Client preview">
        <OptionComparison
          options={options}
          lines={lines}
          preferredOptionId={preferredOptionId}
          adminView
        />
      </Panel>
    </div>
  );
};

export default SolutionOptionsTab;
