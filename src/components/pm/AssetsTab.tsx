import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Panel, Field, Stat, selectCls } from "./ui";
import { ASSET_STATUSES, assetStatusLabel, deviceTypeLabel, disciplineFor, NOT_PROCURED } from "@/lib/lifecycle";
import { ASSET_CSV_COLUMNS, applyAssetImport, loadAssets, planAssetImport, saveAssetForMarker, type AssetPatch, type ProjectAsset } from "@/lib/assets";
import { downloadCsv } from "@/lib/projectPack";
import { formatDate } from "@/lib/portalFiles";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";

const db = supabase as unknown as { from: (t: string) => any };

type Marker = {
  id: string;
  floor_id: string;
  marker_type: string;
  label: string;
  model: string | null;
  area: string | null;
  status: string;
  serial_number: string | null;
  mac_address: string | null;
  nvr_channel: number | null;
  switch_port: number | null;
};

const EDIT_FIELDS: { key: keyof AssetPatch; label: string; type?: string }[] = [
  { key: "asset_tag", label: "Asset tag" },
  { key: "serial_number", label: "Serial number" },
  { key: "mac_address", label: "MAC address" },
  { key: "ip_address", label: "IP address" },
  { key: "manufacturer", label: "Manufacturer" },
  { key: "model", label: "Model" },
  { key: "supplier", label: "Supplier (internal)" },
  { key: "purchase_date", label: "Purchase date", type: "date" },
  { key: "po_reference", label: "PO / reference" },
  { key: "warranty_expiry", label: "Warranty expiry", type: "date" },
  { key: "area", label: "Floor / area" },
  { key: "rack_label", label: "Rack" },
  { key: "switch_label", label: "Switch" },
  { key: "switch_port", label: "Switch port", type: "number" },
  { key: "patch_panel", label: "Patch panel" },
  { key: "patch_panel_port", label: "Patch-panel port", type: "number" },
  { key: "nvr_label", label: "NVR" },
  { key: "nvr_channel", label: "NVR channel", type: "number" },
  { key: "installer", label: "Installer" },
  { key: "installed_on", label: "Installation date", type: "date" },
  { key: "test_result", label: "Test result" },
  { key: "tested_on", label: "Tested on", type: "date" },
  { key: "commissioned_on", label: "Commissioning date", type: "date" },
];

const AssetsTab: React.FC<{ ws: PmWorkspace; projectId: string; setProjectId: (id: string) => void }> = ({
  ws,
  projectId,
  setProjectId,
}) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [floors, setFloors] = useState<{ id: string; display_name: string }[]>([]);
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [floorFilter, setFloorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("");
  const [editing, setEditing] = useState<Marker | null>(null);
  const [draft, setDraft] = useState<AssetPatch>({});
  const [importLog, setImportLog] = useState<string[]>([]);

  const options = useMemo(
    () =>
      ws.projects.map((p) => ({
        id: p.id,
        label: [ws.clients.find((c) => c.id === p.client_id)?.display_name ?? "Unassigned", p.title].join(" — "),
      })),
    [ws.projects, ws.clients],
  );

  const load = async (id: string) => {
    setLoading(true);
    try {
      const [m, f, a] = await Promise.all([
        db
          .from("portal_floor_markers")
          .select("id, floor_id, marker_type, label, model, area, status, serial_number, mac_address, nvr_channel, switch_port")
          .eq("project_id", id)
          .order("sort_order"),
        db.from("portal_floors").select("id, display_name").eq("project_id", id).order("sort_order"),
        loadAssets(id),
      ]);
      setMarkers((m.data ?? []) as Marker[]);
      setFloors((f.data ?? []) as any[]);
      setAssets(a);
    } catch (e) {
      toast({ title: "Could not load asset register", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) load(projectId);
    else {
      setMarkers([]);
      setAssets([]);
      setFloors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const assetByMarker = useMemo(() => new Map(assets.filter((a) => a.marker_id).map((a) => [a.marker_id as string, a])), [assets]);
  const floorName = useMemo(() => new Map(floors.map((f) => [f.id, f.display_name])), [floors]);

  const rows = useMemo(
    () =>
      markers.filter((m) => {
        const a = assetByMarker.get(m.id);
        if (floorFilter && m.floor_id !== floorFilter) return false;
        if (disciplineFilter && disciplineFor(m.marker_type) !== disciplineFilter) return false;
        if (statusFilter && (a?.lifecycle_status ?? "planned") !== statusFilter) return false;
        return true;
      }),
    [markers, assetByMarker, floorFilter, statusFilter, disciplineFilter],
  );

  const disciplines = useMemo(() => Array.from(new Set(markers.map((m) => disciplineFor(m.marker_type)))).sort(), [markers]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const m of markers) {
      const s = assetByMarker.get(m.id)?.lifecycle_status ?? "planned";
      out[s] = (out[s] ?? 0) + 1;
    }
    return out;
  }, [markers, assetByMarker]);

  const openEdit = (m: Marker) => {
    const a = assetByMarker.get(m.id);
    setEditing(m);
    setDraft({
      lifecycle_status: a?.lifecycle_status ?? "planned",
      asset_tag: a?.asset_tag ?? "",
      serial_number: a?.serial_number ?? m.serial_number ?? "",
      mac_address: a?.mac_address ?? m.mac_address ?? "",
      ip_address: a?.ip_address ?? "",
      manufacturer: a?.manufacturer ?? "",
      model: a?.model ?? m.model ?? "",
      supplier: a?.supplier ?? "",
      purchase_date: a?.purchase_date ?? "",
      po_reference: a?.po_reference ?? "",
      warranty_expiry: a?.warranty_expiry ?? "",
      area: a?.area ?? m.area ?? "",
      rack_label: a?.rack_label ?? "",
      switch_label: a?.switch_label ?? "",
      switch_port: a?.switch_port ?? m.switch_port ?? null,
      patch_panel: a?.patch_panel ?? "",
      patch_panel_port: a?.patch_panel_port ?? null,
      nvr_label: a?.nvr_label ?? "",
      nvr_channel: a?.nvr_channel ?? m.nvr_channel ?? null,
      installer: a?.installer ?? "",
      installed_on: a?.installed_on ?? "",
      test_result: a?.test_result ?? "",
      tested_on: a?.tested_on ?? "",
      commissioned_on: a?.commissioned_on ?? "",
      notes: a?.notes ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const dupSerial =
      draft.serial_number &&
      assets.find((a) => a.marker_id !== editing.id && (a.serial_number ?? "").trim().toLowerCase() === String(draft.serial_number).trim().toLowerCase());
    if (dupSerial) {
      toast({ title: "Duplicate serial", description: "That serial number is already used in this project.", variant: "destructive" as never });
      return;
    }
    const patch: AssetPatch = {};
    Object.entries(draft).forEach(([k, v]) => {
      (patch as any)[k] = v === "" ? null : v;
    });
    try {
      await saveAssetForMarker(projectId, editing.id, editing.floor_id, patch);
      setEditing(null);
      await load(projectId);
      toast({ title: "Asset saved" });
    } catch (e) {
      toast({ title: "Could not save asset", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    }
  };

  const exportCsv = () => {
    const header = [...ASSET_CSV_COLUMNS];
    const body = rows.map((m) => {
      const a = assetByMarker.get(m.id);
      return [
        m.label,
        floorName.get(m.floor_id) ?? "",
        deviceTypeLabel(m.marker_type),
        a?.lifecycle_status ?? "planned",
        a?.asset_tag ?? "",
        a?.serial_number ?? m.serial_number ?? "",
        a?.mac_address ?? m.mac_address ?? "",
        a?.ip_address ?? "",
        a?.manufacturer ?? "",
        a?.model ?? m.model ?? "",
        a?.supplier ?? "",
        a?.purchase_date ?? "",
        a?.po_reference ?? "",
        a?.warranty_expiry ?? "",
        a?.area ?? m.area ?? "",
        a?.rack_label ?? "",
        a?.switch_label ?? "",
        a?.switch_port ?? m.switch_port ?? "",
        a?.patch_panel ?? "",
        a?.patch_panel_port ?? "",
        a?.nvr_label ?? "",
        a?.nvr_channel ?? m.nvr_channel ?? "",
        a?.installer ?? "",
        a?.installed_on ?? "",
        a?.test_result ?? "",
        a?.tested_on ?? "",
        a?.commissioned_on ?? "",
        a?.notes ?? "",
      ];
    });
    downloadCsv(`asset-register-${projectId.slice(0, 8)}.csv`, [header, ...body]);
  };

  const onImport = async (file: File) => {
    setImportLog([]);
    const text = await file.text();
    const plan = planAssetImport(text, markers.map((m) => ({ id: m.id, label: m.label, floor_id: m.floor_id })), assets);
    if (!plan.rows.length) {
      setImportLog(plan.errors.length ? plan.errors : ["No valid rows found."]);
      toast({ title: "Nothing imported", description: "See the validation report below.", variant: "destructive" as never });
      return;
    }
    const result = await applyAssetImport(projectId, plan);
    await load(projectId);
    setImportLog([`${result.applied} device(s) updated.`, ...plan.errors, ...result.failures]);
    toast({ title: "Import complete", description: `${result.applied} updated, ${plan.errors.length + result.failures.length} skipped.` });
  };

  return (
    <div>
      <Panel title="Device asset register">
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
        <p className="mt-3 text-xs text-muted-foreground">
          Each plan marker is the planned device instance. Serial, MAC, IP, warranty and installation data are captured
          here once equipment is procured — until then schedules show “{NOT_PROCURED}”.
        </p>
      </Panel>

      {projectId && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Stat label="Planned devices" value={markers.length} />
            {ASSET_STATUSES.filter((s) => counts[s.value]).map((s) => (
              <Stat key={s.value} label={s.label} value={counts[s.value]} />
            ))}
          </div>

          <Panel
            title="Register"
            actions={
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={exportCsv}>
                  Export CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                  Import CSV
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onImport(f);
                    e.target.value = "";
                  }}
                />
              </div>
            }
          >
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <Field label="Floor / area">
                <select className={selectCls} value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
                  <option value="">All floors</option>
                  {floors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.display_name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Discipline">
                <select className={selectCls} value={disciplineFilter} onChange={(e) => setDisciplineFilter(e.target.value)}>
                  <option value="">All disciplines</option>
                  {disciplines.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Lifecycle status">
                <select className={selectCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All statuses</option>
                  {ASSET_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead>
                    <tr className="border-y border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      <th className="py-2 pr-3">Tag</th>
                      <th className="py-2 pr-3">Type</th>
                      <th className="py-2 pr-3">Floor</th>
                      <th className="py-2 pr-3">Serial</th>
                      <th className="py-2 pr-3">MAC</th>
                      <th className="py-2 pr-3">IP</th>
                      <th className="py-2 pr-3">Warranty</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((m) => {
                      const a = assetByMarker.get(m.id);
                      return (
                        <tr key={m.id} className="border-b border-border">
                          <td className="py-2 pr-3 font-medium">{m.label}</td>
                          <td className="py-2 pr-3">{deviceTypeLabel(m.marker_type)}</td>
                          <td className="py-2 pr-3">{floorName.get(m.floor_id) ?? "—"}</td>
                          <td className="py-2 pr-3">{a?.serial_number ?? m.serial_number ?? <span className="text-muted-foreground">{NOT_PROCURED}</span>}</td>
                          <td className="py-2 pr-3">{a?.mac_address ?? m.mac_address ?? "—"}</td>
                          <td className="py-2 pr-3">{a?.ip_address ?? "—"}</td>
                          <td className="py-2 pr-3">{a?.warranty_expiry ? formatDate(a.warranty_expiry) : "—"}</td>
                          <td className="py-2 pr-3">{assetStatusLabel(a?.lifecycle_status)}</td>
                          <td className="py-2 text-right">
                            <Button size="sm" variant="outline" onClick={() => openEdit(m)}>
                              Edit
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {!rows.length && (
                      <tr>
                        <td colSpan={9} className="py-3 text-sm text-muted-foreground">
                          No devices match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {importLog.length > 0 && (
              <div className="mt-4 border border-border p-3">
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Import report</p>
                <ul className="space-y-1 text-xs">
                  {importLog.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>

          {editing && (
            <Panel title={`Edit asset — ${editing.label}`}>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Lifecycle status">
                  <select
                    className={selectCls}
                    value={(draft.lifecycle_status as string) ?? "planned"}
                    onChange={(e) => setDraft({ ...draft, lifecycle_status: e.target.value })}
                  >
                    {ASSET_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
                {EDIT_FIELDS.map((f) => (
                  <Field key={String(f.key)} label={f.label}>
                    <Input
                      type={f.type ?? "text"}
                      value={((draft as any)[f.key] ?? "") as string}
                      onChange={(e) =>
                        setDraft({ ...draft, [f.key]: f.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value } as AssetPatch)
                      }
                    />
                  </Field>
                ))}
                <Field label="Notes (internal)" className="md:col-span-3">
                  <Textarea rows={2} value={(draft.notes as string) ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                </Field>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={saveEdit}>Save asset</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  );
};

export default AssetsTab;
