import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, AlertTriangle, Printer, Layers } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { PageHeader, Panel, Loading, ErrorNote, EmptyState, NoProject } from "@/components/portal/ui";
import { usePortal, statusLabel } from "@/hooks/usePortal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loadProjectRegisters,
  deviceRegisterStats,
  deviceGroupLabel,
  nvrAllocation,
  cableStats,
  validateRack,
  serviceTypeLabel,
  toCsv,
  downloadCsv,
  safeFileName,
  REGISTER_DISCLAIMER,
  COPPER_LIMIT_NOTE,
  type ProjectRegisters,
} from "@/lib/registers";

const Metric: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <div className="border border-border p-4">
    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    <p className="mt-2 font-display text-2xl font-light tracking-tight">{value}</p>
    {hint && <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{hint}</p>}
  </div>
);

const TABS = [
  { key: "devices", label: "Device register" },
  { key: "cctv", label: "CCTV & recorders" },
  { key: "cabling", label: "Cabling schedule" },
  { key: "rack", label: "Rack & equipment" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const PortalRegisters: React.FC = () => {
  const { activeProject, activeProjectId, loading: portalLoading, client } = usePortal();
  const [data, setData] = useState<ProjectRegisters | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("devices");
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.title = "Project registers | Siyakha Connect";
  }, []);

  useEffect(() => {
    if (!activeProjectId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadProjectRegisters(activeProjectId)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeProjectId]);

  const devices = useMemo(() => (data ? deviceRegisterStats(data.markers) : null), [data]);
  const nvr = useMemo(() => (data ? nvrAllocation(data.nvrs, data.markers) : null), [data]);
  const cables = useMemo(() => (data ? cableStats(data.cables) : null), [data]);

  const racks = useMemo(() => data?.markers.filter((m) => m.marker_type === "rack") ?? [], [data]);

  const filteredMarkers = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const rows = [...data.markers].sort((a, b) => a.label.localeCompare(b.label));
    if (!q) return rows;
    return rows.filter((m) =>
      [m.label, m.area, m.equipment, m.description, deviceGroupLabel(m.marker_type)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [data, query]);

  const baseName = safeFileName(`${client?.display_name ?? "siyakha"}-${activeProject?.title ?? "project"}`);

  const exportDevices = () => {
    if (!data) return;
    downloadCsv(
      `${baseName}-device-register.csv`,
      toCsv(
        ["Label", "Type", "Area", "Equipment", "Model", "Status", "Placed", "Recorder channel", "Design hold", "Notes"],
        filteredMarkers.map((m) => [
          m.label,
          deviceGroupLabel(m.marker_type),
          m.area,
          m.equipment,
          m.model,
          statusLabel(m.status),
          m.is_placed ? "Placed on plan" : "Awaiting placement",
          m.nvr_channel != null ? String(m.nvr_channel) : "",
          m.design_hold,
          m.notes,
        ]),
      ),
    );
  };

  const exportCables = () => {
    if (!data) return;
    downloadCsv(
      `${baseName}-cabling-schedule.csv`,
      toCsv(
        [
          "Link",
          "Kind",
          "Service",
          "Source",
          "Destination",
          "Cable",
          "Patch panel",
          "Panel port",
          "Switch port",
          "Estimated length (m)",
          "Measured length (m)",
          "Design limit (m)",
          "Status",
          "Test result",
        ],
        data.cables.map((c) => [
          c.route_label,
          c.route_kind,
          serviceTypeLabel(c.service_type),
          c.source_label,
          c.destination_label,
          c.cable_type,
          c.patch_panel,
          c.patch_panel_port,
          c.switch_port,
          c.estimated_length_m,
          c.measured_length_m,
          c.max_length_m,
          statusLabel(c.status),
          c.test_result ?? "Pending",
        ]),
      ),
    );
  };

  if (portalLoading) {
    return (
      <PortalLayout>
        <Loading />
      </PortalLayout>
    );
  }
  if (!activeProject) {
    return (
      <PortalLayout>
        <NoProject />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <PageHeader
        eyebrow="Siyakha Connect"
        title="Project registers & reports"
        description={`Live design registers for ${activeProject.title}. Every total below is derived from the current plan data — devices, recorder channels, structured cabling and rack equipment.`}
      />

      <div className="flex flex-wrap items-center gap-3 mb-8 print:hidden">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} /> Print / PDF
        </Button>
        <Link
          to="/portal/floor-plans"
          className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[11px] uppercase tracking-[0.18em] hover:bg-muted transition-colors"
        >
          <Layers className="h-3.5 w-3.5" strokeWidth={1.5} /> Open interactive plans
        </Link>
      </div>

      {error && <ErrorNote message={error} />}
      {loading && !data && <Loading label="Loading registers…" />}

      {data && devices && nvr && cables && (
        <div className="space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric label="Devices on register" value={devices.total} hint={`${devices.placed} placed · ${devices.unplaced} awaiting placement`} />
            <Metric label="CCTV cameras" value={nvr.cameras} hint={`${nvr.allocated} allocated to recorders`} />
            <Metric label="Structured cabling links" value={cables.total} hint={`${cables.copper} copper · ${cables.fibre} fibre`} />
            <Metric label="Design holds" value={devices.holds} hint={devices.holds ? "Positions outstanding" : "None outstanding"} />
          </div>

          {devices.holds > 0 && (
            <div className="border border-[hsl(32_100%_50%)]/50 bg-[hsl(32_100%_50%)]/5 p-5">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} /> Design holds
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {data.markers
                  .filter((m) => m.design_hold)
                  .map((m) => (
                    <li key={m.id}>
                      <span className="font-mono text-xs mr-2">{m.label}</span>
                      {m.design_hold}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <nav className="flex flex-wrap gap-2 print:hidden" aria-label="Register sections">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-pressed={tab === t.key}
                className={[
                  "border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors",
                  tab === t.key ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* ----------------------------- Devices ---------------------------- */}
          {tab === "devices" && (
            <div className="space-y-6">
              <Panel title="Register summary">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {devices.groups.map((g) => (
                    <div key={g.type} className="border border-border p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{g.label}</p>
                      <p className="mt-2 font-display text-xl font-light">{g.total}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {g.placed} placed · {g.unplaced} awaiting placement
                        {g.holds > 0 && ` · ${g.holds} on hold`}
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>

              <div className="flex flex-wrap gap-3 items-center print:hidden">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by label, area or equipment"
                  className="max-w-xs"
                  aria-label="Search device register"
                />
                <Button variant="outline" size="sm" onClick={exportDevices}>
                  <Download className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} /> Export CSV
                </Button>
              </div>

              <div className="border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="px-4 py-3">Label</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Area</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarkers.map((m) => (
                      <tr key={m.id} className="border-t border-border">
                        <td className="px-4 py-3 font-mono text-xs">{m.label}</td>
                        <td className="px-4 py-3">{deviceGroupLabel(m.marker_type)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{m.area ?? "—"}</td>
                        <td className="px-4 py-3">{statusLabel(m.status)}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {m.is_placed ? "Placed" : "Awaiting placement"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredMarkers.length === 0 && <EmptyState title="No devices match this search" />}
            </div>
          )}

          {/* --------------------------- CCTV / NVRs -------------------------- */}
          {tab === "cctv" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Metric label="Cameras" value={nvr.cameras} />
                <Metric label="Recorder channels" value={nvr.capacity} />
                <Metric label="Channels allocated" value={nvr.allocated} />
                <Metric label="Unallocated cameras" value={nvr.unallocated} />
              </div>

              {nvr.rows.map((row) => (
                <Panel key={row.nvr.id} title={`${row.nvr.label} — ${row.nvr.manufacturer} ${row.nvr.model ?? ""}`.trim()}>
                  <p className="text-sm text-muted-foreground">
                    {row.used} of {row.nvr.channel_count} channels allocated · {row.spare} spare
                    {row.unplaced > 0 && ` · ${row.unplaced} camera position(s) awaiting placement`}
                  </p>
                  {row.over > 0 && (
                    <p className="mt-2 text-sm text-destructive">
                      {row.over} camera(s) exceed this recorder's channel capacity.
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {row.cameras.map((c) => (
                      <span
                        key={c.id}
                        title={`${c.area ?? ""} — channel ${c.nvr_channel ?? "?"}`}
                        className={[
                          "border px-2.5 py-1 font-mono text-[11px]",
                          c.design_hold ? "border-[hsl(32_100%_50%)] text-[hsl(32_100%_50%)]" : "border-border",
                        ].join(" ")}
                      >
                        {c.label}
                        <span className="ml-2 text-muted-foreground">ch{c.nvr_channel}</span>
                      </span>
                    ))}
                  </div>
                  {row.nvr.notes && <p className="mt-4 text-xs text-muted-foreground">{row.nvr.notes}</p>}
                </Panel>
              ))}
              {nvr.rows.length === 0 && <EmptyState title="No recorders registered for this project yet" />}
            </div>
          )}

          {/* ---------------------------- Cabling ----------------------------- */}
          {tab === "cabling" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Metric label="Total links" value={cables.total} />
                <Metric label="Copper" value={cables.copper} />
                <Metric label="Lengths measured" value={cables.measured} hint={`${cables.pendingLength} pending measurement`} />
                <Metric label="Over 90 m" value={cables.overLimit.length} hint={cables.overLimit.length ? "Review route" : "None flagged"} />
              </div>

              <p className="text-xs text-muted-foreground">{COPPER_LIMIT_NOTE}</p>

              {cables.overLimit.length > 0 && (
                <div className="border border-destructive/40 bg-destructive/5 p-5 text-sm">
                  <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} /> Length warnings
                  </p>
                  <ul className="mt-3 space-y-1">
                    {cables.overLimit.map((c) => (
                      <li key={c.id}>
                        {c.route_label} — {c.measured_length_m ?? c.estimated_length_m} m exceeds the {c.max_length_m} m
                        permanent-link design limit.
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="print:hidden">
                <Button variant="outline" size="sm" onClick={exportCables}>
                  <Download className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} /> Export CSV
                </Button>
              </div>

              <div className="border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="px-3 py-3">Link</th>
                      <th className="px-3 py-3">Service</th>
                      <th className="px-3 py-3">Source</th>
                      <th className="px-3 py-3">Destination</th>
                      <th className="px-3 py-3">Cable</th>
                      <th className="px-3 py-3">Panel / port</th>
                      <th className="px-3 py-3">Length</th>
                      <th className="px-3 py-3">Test</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.cables.map((c) => {
                      const len = c.measured_length_m ?? c.estimated_length_m;
                      const over = len != null && len > c.max_length_m;
                      return (
                        <tr key={c.id} className="border-t border-border">
                          <td className="px-3 py-3 font-mono text-xs">{c.route_label}</td>
                          <td className="px-3 py-3">{serviceTypeLabel(c.service_type)}</td>
                          <td className="px-3 py-3">{c.source_label ?? "—"}</td>
                          <td className="px-3 py-3">{c.destination_label ?? "—"}</td>
                          <td className="px-3 py-3 text-muted-foreground">{c.cable_type}</td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {c.patch_panel ? `${c.patch_panel} / ${c.patch_panel_port ?? "—"}` : "—"}
                          </td>
                          <td className={`px-3 py-3 ${over ? "text-destructive" : "text-muted-foreground"}`}>
                            {len != null ? `${len} m` : "Pending measurement"}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">{c.test_result ?? "Pending"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {data.cables.length === 0 && <EmptyState title="No cabling links registered yet" />}
            </div>
          )}

          {/* ------------------------------ Rack ------------------------------ */}
          {tab === "rack" && (
            <div className="space-y-6">
              {racks.map((rack) => {
                const items = data.equipment.filter((e) => e.rack_marker_id === rack.id);
                const rackCables = data.cables.filter((c) => c.floor_id === rack.floor_id);
                const rackNvrs = data.nvrs.filter((n) => n.rack_marker_id === rack.id);
                const cameraCount = data.markers.filter(
                  (m) => m.marker_type === "camera" && m.floor_id === rack.floor_id,
                ).length;
                const v = validateRack({
                  capacityU: rack.capacity_u ?? 6,
                  equipment: items,
                  cables: rackCables,
                  nvrs: rackNvrs,
                  cameras: cameraCount,
                });
                return (
                  <Panel key={rack.id} title={`${rack.label} — ${rack.equipment ?? "Communications rack"}`}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Metric label="Rack units" value={`${v.usedU} / ${v.capacityU}U`} hint={`${v.freeU}U free`} />
                      <Metric label="Switch ports" value={`${v.links} / ${v.switchPorts}`} hint={`${v.spareSwitchPorts} spare`} />
                      <Metric label="Panel terminations" value={`${v.links} / ${v.panelPorts}`} hint={`${v.sparePanelPorts} spare`} />
                      <Metric label="Recorder channels" value={`${cameraCount} / ${v.channels}`} hint={`${v.spareChannels} spare`} />
                    </div>

                    {v.issues.length > 0 && (
                      <ul className="mt-5 space-y-2 text-sm">
                        {v.issues.map((i, idx) => (
                          <li
                            key={idx}
                            className={[
                              "border px-4 py-2.5",
                              i.severity === "warning"
                                ? "border-destructive/40 bg-destructive/5 text-destructive"
                                : "border-border text-muted-foreground",
                            ].join(" ")}
                          >
                            {i.message}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-6 border border-border overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            <th className="px-3 py-3">Equipment</th>
                            <th className="px-3 py-3">Manufacturer</th>
                            <th className="px-3 py-3">Model</th>
                            <th className="px-3 py-3">U</th>
                            <th className="px-3 py-3">Qty</th>
                            <th className="px-3 py-3">Ports</th>
                            <th className="px-3 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((e) => (
                            <tr key={e.id} className="border-t border-border">
                              <td className="px-3 py-3">{e.description ?? e.equipment_type.replace(/_/g, " ")}</td>
                              <td className="px-3 py-3 text-muted-foreground">{e.manufacturer}</td>
                              <td className="px-3 py-3 font-mono text-xs">{e.model}</td>
                              <td className="px-3 py-3">{e.rack_units}</td>
                              <td className="px-3 py-3">{e.quantity}</td>
                              <td className="px-3 py-3 text-muted-foreground">
                                {e.port_count ? `${e.port_count} ${e.port_type ?? ""}` : "—"}
                              </td>
                              <td className="px-3 py-3">{statusLabel(e.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Panel>
                );
              })}
              {racks.length === 0 && <EmptyState title="No racks registered for this project yet" />}
            </div>
          )}

          <p className="text-xs text-muted-foreground border-t border-border pt-6">{REGISTER_DISCLAIMER}</p>
        </div>
      )}
    </PortalLayout>
  );
};

export default PortalRegisters;
