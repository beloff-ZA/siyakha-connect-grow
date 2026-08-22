import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Panel, Stat, Chip } from "./ui";
import { formatZar } from "@/lib/boq";
import { formatDate } from "@/lib/portalFiles";
import { isOpenDeal, isOverdue, stageLabel, weightedValue } from "@/lib/deals";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";

const OverviewTab: React.FC<{ ws: PmWorkspace; go: (tab: string) => void }> = ({ ws, go }) => {
  const { clients, sites, projects, boqs, deals, proposals } = ws;

  const open = useMemo(() => deals.filter(isOpenDeal), [deals]);
  const pipelineValue = open.reduce((s, d) => s + (Number(d.estimated_value) || 0), 0);
  const weighted = open.reduce((s, d) => s + weightedValue(d), 0);
  const overdue = deals.filter(isOverdue);

  const countBy = (rows: { status: string | null }[]) =>
    rows.reduce<Record<string, number>>((acc, r) => {
      const k = r.status ?? "unknown";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

  const boqStatus = countBy(boqs);
  const proposalStatus = countBy(proposals);

  const activity = useMemo(() => {
    const rows: { when: string; label: string }[] = [
      ...deals.map((d) => ({ when: d.created_at, label: `Deal · ${d.title} (${stageLabel(d.status)})` })),
      ...projects.map((p) => ({ when: p.created_at, label: `Project · ${p.title}` })),
      ...boqs.map((b) => ({ when: b.updated_at, label: `BOQ · ${b.title} ${b.revision_label} (${b.status})` })),
      ...proposals.map((p) => ({ when: p.created_at, label: `Proposal · ${p.proposal_number} (${p.status})` })),
    ];
    return rows.filter((r) => r.when).sort((a, b) => (a.when < b.when ? 1 : -1)).slice(0, 12);
  }, [deals, projects, boqs, proposals]);

  return (
    <div>
      <Panel title="Commercial position">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Active deals" value={open.length} hint={`${deals.length} deal record(s) in total`} />
          <Stat label="Pipeline value" value={formatZar(pipelineValue)} hint={`Weighted ${formatZar(weighted)}`} />
          <Stat label="Clients" value={clients.length} hint={`${sites.length} site(s)`} />
          <Stat label="Projects" value={projects.length} hint={`${boqs.length} BOQ revision(s)`} />
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="BOQs by status">
          {boqs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No BOQs captured yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {Object.entries(boqStatus).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between py-2 text-sm">
                  <span className="capitalize">{k}</span>
                  <span className="tabular-nums">{v}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Proposals by status">
          {proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposals generated yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {Object.entries(proposalStatus).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between py-2 text-sm">
                  <span className="capitalize">{k}</span>
                  <span className="tabular-nums">{v}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Quick actions">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => go("deals")}>New deal</Button>
          <Button size="sm" variant="outline" onClick={() => go("clients")}>New client</Button>
          <Button size="sm" variant="outline" onClick={() => go("clients")}>New site</Button>
          <Button size="sm" variant="outline" onClick={() => go("projects")}>New project</Button>
          <Button size="sm" variant="outline" onClick={() => go("boq")}>Open BOQ</Button>
          <Button size="sm" variant="outline" onClick={() => go("proposals")}>Create proposal</Button>
        </div>
      </Panel>

      {overdue.length > 0 && (
        <Panel title={`Overdue next actions (${overdue.length})`}>
          <ul className="divide-y divide-border">
            {overdue.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  {d.title} — {d.next_action ?? "Follow up"}
                </span>
                <Chip className="border-foreground text-foreground">due {formatDate(d.next_action_date)}</Chip>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="Recent activity">
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {activity.map((a, i) => (
              <li key={`${a.when}-${i}`} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>{a.label}</span>
                <span className="text-xs text-muted-foreground">{formatDate(a.when)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default OverviewTab;
