import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Panel, Field, Stat, Chip, selectCls } from "./ui";
import PrintSurface from "./PrintSurface";
import ProjectPackDocument from "./ProjectPackDocument";
import InternalReportDocument from "./InternalReportDocument";
import {
  buildInternalCommercial,
  buildProjectPack,
  downloadCsv,
  issuePack,
  loadPackSnapshot,
  loadPacks,
  type InternalCommercial,
  type ProjectPack,
} from "@/lib/projectPack";
import { deviceTypeLabel, disciplineFor, NOT_PROCURED, packSectionFlags, stageLabel } from "@/lib/lifecycle";
import { formatZar } from "@/lib/boq";
import { formatDate } from "@/lib/portalFiles";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";

const ReportsTab: React.FC<{ ws: PmWorkspace; projectId: string; setProjectId: (id: string) => void }> = ({
  ws,
  projectId,
  setProjectId,
}) => {
  const { toast } = useToast();
  const [pack, setPack] = useState<ProjectPack | null>(null);
  const [internal, setInternal] = useState<InternalCommercial | null>(null);
  const [packs, setPacks] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [showPack, setShowPack] = useState(false);
  const [showInternal, setShowInternal] = useState(false);

  const options = useMemo(
    () =>
      ws.projects.map((p) => ({
        id: p.id,
        label: [ws.clients.find((c) => c.id === p.client_id)?.display_name ?? "Unassigned", p.title].join(" — "),
      })),
    [ws.projects, ws.clients],
  );

  const refresh = async (id: string) => {
    setBusy(true);
    try {
      const [p, list] = await Promise.all([buildProjectPack(id, true), loadPacks(id)]);
      setPack(p);
      setPacks(list);
      setInternal(null);
    } catch (e) {
      toast({ title: "Could not build report data", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (projectId) refresh(projectId);
    else {
      setPack(null);
      setPacks([]);
      setInternal(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const markers = useMemo(() => (pack ? pack.floors.flatMap((f) => f.markers.map((m) => ({ ...m, floor: f.display_name }))) : []), [pack]);
  const assetByMarker = useMemo(() => new Map((pack?.assets ?? []).filter((a) => a.marker_id).map((a) => [a.marker_id as string, a])), [pack]);
  const flags = packSectionFlags(pack?.lifecycle_stage);

  const byDiscipline = useMemo(() => {
    const map = new Map<string, number>();
    markers.forEach((m) => map.set(disciplineFor(m.marker_type), (map.get(disciplineFor(m.marker_type)) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [markers]);

  const openPack = () => {
    if (!pack) return;
    setShowPack(true);
  };

  const openInternal = async () => {
    if (!projectId) return;
    setBusy(true);
    try {
      const rep = await buildInternalCommercial(projectId);
      setInternal(rep);
      setShowInternal(true);
    } catch (e) {
      toast({ title: "Could not build internal report", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    } finally {
      setBusy(false);
    }
  };

  const issue = async () => {
    if (!pack || !projectId) return;
    setBusy(true);
    try {
      const saved = await issuePack(
        projectId,
        "client",
        `${pack.project.title} — project pack`,
        pack,
        pack.lifecycle_stage,
      );
      setPacks(await loadPacks(projectId));
      toast({ title: "Pack issued", description: `${(saved as any)?.pack_number} stored as an immutable snapshot.` });
    } catch (e) {
      toast({ title: "Could not issue pack", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    } finally {
      setBusy(false);
    }
  };

  const openIssued = async (id: string) => {
    setBusy(true);
    try {
      const row: any = await loadPackSnapshot(id);
      if (row?.pack_kind === "internal") {
        setInternal(row.snapshot as InternalCommercial);
        setShowInternal(true);
      } else {
        setPack(row.snapshot as ProjectPack);
        setShowPack(true);
      }
    } catch (e) {
      toast({ title: "Could not open snapshot", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    } finally {
      setBusy(false);
    }
  };

  const exportBoq = () => {
    if (!pack) return;
    downloadCsv(`boq-${pack.project.title.replace(/\W+/g, "-").toLowerCase()}.csv`, [
      ["Section", "Item code", "Description", "Type", "Discipline", "Qty", "Unit", "Rate", "Line total"],
      ...pack.boqLines.map((l) => [
        l.section,
        l.item_code,
        l.description,
        l.line_kind,
        l.discipline,
        l.quantity,
        l.unit,
        l.customer_unit_rate,
        l.line_total,
      ]),
    ]);
  };

  const exportDevices = () => {
    if (!pack) return;
    downloadCsv(`device-schedule-${pack.project.id.slice(0, 8)}.csv`, [
      ["Tag", "Floor", "Discipline", "Type", "Model", "Area", "Status", "Direction", "FOV", "NVR channel", "Switch port", "Placed"],
      ...markers.map((m) => [
        m.label,
        m.floor,
        disciplineFor(m.marker_type),
        deviceTypeLabel(m.marker_type),
        m.model,
        m.area,
        m.status,
        m.direction_deg ?? "",
        m.fov_deg ?? "",
        m.nvr_channel ?? "",
        m.switch_port ?? "",
        m.is_placed ? "yes" : "no",
      ]),
    ]);
  };

  const exportAssets = () => {
    if (!pack) return;
    downloadCsv(`serial-asset-register-${pack.project.id.slice(0, 8)}.csv`, [
      ["Tag", "Floor", "Type", "Status", "Serial", "MAC", "IP", "Manufacturer", "Model", "Warranty expiry", "Installer", "Installed", "Test result", "Commissioned"],
      ...markers.map((m) => {
        const a = assetByMarker.get(m.id);
        return [
          m.label,
          m.floor,
          deviceTypeLabel(m.marker_type),
          a?.lifecycle_status ?? "planned",
          a?.serial_number ?? m.serial_number ?? NOT_PROCURED,
          a?.mac_address ?? m.mac_address ?? "",
          a?.ip_address ?? "",
          a?.manufacturer ?? "",
          a?.model ?? m.model ?? "",
          a?.warranty_expiry ?? "",
          a?.installer ?? "",
          a?.installed_on ?? "",
          a?.test_result ?? "",
          a?.commissioned_on ?? "",
        ];
      }),
    ]);
  };

  const exportCables = () => {
    if (!pack) return;
    downloadCsv(`cable-schedule-${pack.project.id.slice(0, 8)}.csv`, [
      ["Reference", "Cable type", "From", "To", "Length (m)", "Status"],
      ...pack.cables.map((c: any) => [
        c.label ?? c.reference ?? "",
        c.cable_type ?? "",
        c.from_label ?? c.origin_label ?? "",
        c.to_label ?? c.destination_label ?? "",
        c.length_m ?? c.estimated_length_m ?? "",
        c.status ?? "",
      ]),
    ]);
  };

  return (
    <div>
      <Panel
        title="Project reports & document pack"
        actions={
          projectId && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={openPack} disabled={busy || !pack}>
                Download Full Project Pack
              </Button>
              <Button size="sm" variant="outline" onClick={issue} disabled={busy || !pack}>
                Issue snapshot
              </Button>
              <Button size="sm" variant="outline" onClick={openInternal} disabled={busy}>
                Internal commercial report
              </Button>
              <Button size="sm" variant="outline" onClick={() => refresh(projectId)} disabled={busy}>
                Refresh
              </Button>
            </div>
          )
        }
      >
        <Field label="Project">
          <select className={selectCls} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Select a project…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        {pack && (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Chip>{stageLabel(pack.lifecycle_stage)}</Chip>
            <span>Built from live data at {formatDate(pack.generated_at)}.</span>
            <span>
              Delivery sections {flags.procurement ? "included" : "appear automatically from the procurement stage onward"}.
            </span>
          </p>
        )}
      </Panel>

      {pack && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Floors / areas" value={pack.floors.length} />
            <Stat label="Planned devices" value={markers.length} />
            <Stat label="BOQ lines" value={pack.boqLines.length} />
            <Stat label="Client total (incl. VAT)" value={formatZar(pack.totals.total)} />
          </div>

          <Panel
            title="Data exports"
            actions={
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={exportBoq}>
                  BOQ CSV
                </Button>
                <Button size="sm" variant="outline" onClick={exportDevices}>
                  Device schedule CSV
                </Button>
                <Button size="sm" variant="outline" onClick={exportAssets}>
                  Serial / asset CSV
                </Button>
                <Button size="sm" variant="outline" onClick={exportCables}>
                  Cable schedule CSV
                </Button>
              </div>
            }
          >
            <p className="text-sm text-muted-foreground">
              Exports contain client-safe data only. Supplier costs, markup and margin stay inside the internal
              commercial report.
            </p>
          </Panel>

          <Panel title="Live schedules">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Devices by discipline</p>
                <ul className="space-y-1 text-sm">
                  {byDiscipline.map(([d, n]) => (
                    <li key={d} className="flex justify-between border-b border-border py-1">
                      <span>{d}</span>
                      <span className="tabular-nums">{n}</span>
                    </li>
                  ))}
                  {!byDiscipline.length && <li className="text-sm text-muted-foreground">No devices mapped yet.</li>}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Floor / area schedule</p>
                <ul className="space-y-1 text-sm">
                  {pack.floors.map((f) => (
                    <li key={f.id} className="flex justify-between border-b border-border py-1">
                      <span>{f.display_name}</span>
                      <span className="tabular-nums">{f.markers.length} devices</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <Stat label="Cable routes" value={pack.cables.length} />
              <Stat label="Rack equipment items" value={pack.rackEquipment.length} />
              <Stat label="NVRs" value={pack.nvrs.length} />
              <Stat label="Tasks" value={pack.tasks.length} />
              <Stat label="Milestones" value={pack.milestones.length} />
              <Stat label="Open queries" value={pack.queries.length} />
              <Stat label="Variations" value={pack.variations.length} />
              <Stat label="Plan revisions" value={pack.planRevisions.length} />
              <Stat label="Proposal revisions" value={pack.proposals.length} />
            </div>
          </Panel>

          <Panel title="Issued pack history">
            {packs.length ? (
              <ul className="space-y-2 text-sm">
                {packs.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{p.pack_number}</span>
                      <Chip>{p.pack_kind}</Chip>
                      <Chip>rev {p.revision_no}</Chip>
                      <span className="text-xs text-muted-foreground">
                        {stageLabel(p.lifecycle_stage)} · {formatDate(p.issued_at)}
                      </span>
                    </span>
                    <Button size="sm" variant="outline" onClick={() => openIssued(p.id)}>
                      Open snapshot
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No packs issued yet. Issuing freezes the current record for revision history.</p>
            )}
          </Panel>
        </>
      )}

      {pack && (
        <PrintSurface open={showPack} title={`${pack.project.title} — full project pack`} onClose={() => setShowPack(false)}>
          <ProjectPackDocument pack={pack} />
        </PrintSurface>
      )}
      {internal && (
        <PrintSurface
          open={showInternal}
          title="Internal commercial report — confidential"
          onClose={() => setShowInternal(false)}
        >
          <InternalReportDocument report={internal} />
        </PrintSurface>
      )}
    </div>
  );
};

export default ReportsTab;
