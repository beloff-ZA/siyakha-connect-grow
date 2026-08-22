import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Field, Panel, selectCls } from "./ui";
import useClientSiteDialogs from "./ClientSiteDialogs";
import { FLOOR_USES } from "@/lib/floorPlans";
import { normalizeBuildingDetails, type BuildingDetails } from "@/lib/projectWizard";
import type { PmProject, PmWorkspace } from "@/hooks/usePmWorkspace";

type FloorRow = {
  id: string;
  level_number: number;
  display_name: string;
  floor_use: string | null;
  plan_image_path: string | null;
  client_visible: boolean;
  devices: number;
  revisions: number;
};

/**
 * Project, building schedule and floor schedule editing. Only values the admin
 * types are saved — no dimension or floor detail is ever inferred.
 */
const BuildingSiteTab: React.FC<{ ws: PmWorkspace; project: PmProject }> = ({ ws, project }) => {
  const { toast } = useToast();
  const { clients, sites, reload } = ws;
  const dialogs = useClientSiteDialogs({ clients, reload });
  const [busy, setBusy] = useState(false);
  const [floors, setFloors] = useState<FloorRow[]>([]);

  const [form, setForm] = useState({
    title: project.title,
    reference: project.reference ?? "",
    address: project.address ?? "",
    consultant: project.consultant ?? "",
    description: project.description ?? "",
    status: project.status ?? "planning",
    start_date: project.start_date ?? "",
    target_date: project.target_date ?? "",
  });

  const [building, setBuilding] = useState({
    building_type: "",
    levels_note: "",
    gfa_sqm: "",
    length_m: "",
    width_m: "",
    rooms_units: "",
    occupancy: "",
    notes: "",
  });

  const site = useMemo(() => sites.find((s) => s.id === project.site_id) ?? null, [sites, project.site_id]);

  const loadFloors = useCallback(async () => {
    const [{ data: floorRows }, { data: markerRows }, { data: revRows }] = await Promise.all([
      supabase
        .from("portal_floors")
        .select("id, level_number, display_name, floor_use, plan_image_path, client_visible")
        .eq("project_id", project.id)
        .order("sort_order"),
      supabase.from("portal_floor_markers").select("floor_id").eq("project_id", project.id).is("archived_at", null),
      supabase.from("portal_plan_revisions").select("floor_id").eq("project_id", project.id).is("archived_at", null),
    ]);
    const count = (rows: { floor_id: string | null }[] | null, id: string) =>
      (rows ?? []).filter((r) => r.floor_id === id).length;
    setFloors(
      (floorRows ?? []).map((f) => ({
        ...(f as Omit<FloorRow, "devices" | "revisions">),
        devices: count(markerRows as { floor_id: string | null }[] | null, f.id),
        revisions: count(revRows as { floor_id: string | null }[] | null, f.id),
      })),
    );
  }, [project.id]);

  useEffect(() => {
    loadFloors();
  }, [loadFloors]);

  // Load the stored building schedule without overwriting anything already saved.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("portal_projects").select("building_details").eq("id", project.id).maybeSingle();
      const d = ((data as { building_details?: BuildingDetails | null } | null)?.building_details ?? {}) as BuildingDetails;
      if (cancelled) return;
      setBuilding({
        building_type: d.building_type ?? "",
        levels_note: d.levels_note ?? "",
        gfa_sqm: d.gfa_sqm != null ? String(d.gfa_sqm) : "",
        length_m: d.length_m != null ? String(d.length_m) : "",
        width_m: d.width_m != null ? String(d.width_m) : "",
        rooms_units: d.rooms_units != null ? String(d.rooms_units) : "",
        occupancy: d.occupancy != null ? String(d.occupancy) : "",
        notes: d.notes ?? "",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [project.id]);

  const fail = (e: unknown) =>
    toast({ title: "Could not save", description: (e as Error)?.message ?? String(e), variant: "destructive" });

  const save = async () => {
    if (!form.title.trim()) return toast({ title: "A project title is required", variant: "destructive" });
    setBusy(true);
    try {
      const { error } = await supabase
        .from("portal_projects")
        .update({
          title: form.title.trim(),
          reference: form.reference.trim() || null,
          address: form.address.trim() || null,
          consultant: form.consultant.trim() || null,
          description: form.description.trim() || null,
          status: form.status,
          start_date: form.start_date || null,
          target_date: form.target_date || null,
          building_details: normalizeBuildingDetails(building) as never,
        } as never)
        .eq("id", project.id);
      if (error) throw error;
      toast({ title: "Project updated" });
      await reload();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const saveFloor = async (row: FloorRow, patch: Partial<FloorRow>) => {
    setFloors((prev) => prev.map((f) => (f.id === row.id ? { ...f, ...patch } : f)));
    const { error } = await supabase
      .from("portal_floors")
      .update({
        display_name: (patch.display_name ?? row.display_name).trim(),
        floor_use: patch.floor_use ?? row.floor_use,
        client_visible: patch.client_visible ?? row.client_visible,
      })
      .eq("id", row.id);
    if (error) fail(error);
  };

  return (
    <div>
      <Panel
        title="Project information"
        actions={
          <Button size="sm" onClick={save} disabled={busy}>
            Save changes
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project title" className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Reference">
            <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          </Field>
          <Field label="Status">
            <select className={selectCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {["planning", "design", "in_progress", "on_hold", "complete"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Consultant">
            <Input value={form.consultant} onChange={(e) => setForm({ ...form, consultant: e.target.value })} />
          </Field>
          <Field label="Start date">
            <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </Field>
          <Field label="Target date">
            <Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Building schedule (optional)"
        actions={
          <Button size="sm" onClick={save} disabled={busy}>
            Save changes
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Building type / use">
            <Input value={building.building_type} onChange={(e) => setBuilding({ ...building, building_type: e.target.value })} />
          </Field>
          <Field label={`Levels (${floors.length} floor records)`}>
            <Input
              value={building.levels_note}
              onChange={(e) => setBuilding({ ...building, levels_note: e.target.value })}
              placeholder="e.g. 12 levels plus roof plant"
            />
          </Field>
          <Field label="Total / GFA floor area (m²)">
            <Input value={building.gfa_sqm} onChange={(e) => setBuilding({ ...building, gfa_sqm: e.target.value })} />
          </Field>
          <Field label="Rooms / units">
            <Input value={building.rooms_units} onChange={(e) => setBuilding({ ...building, rooms_units: e.target.value })} />
          </Field>
          <Field label="Building length (m)">
            <Input value={building.length_m} onChange={(e) => setBuilding({ ...building, length_m: e.target.value })} />
          </Field>
          <Field label="Building width (m)">
            <Input value={building.width_m} onChange={(e) => setBuilding({ ...building, width_m: e.target.value })} />
          </Field>
          <Field label="Occupancy / capacity">
            <Input value={building.occupancy} onChange={(e) => setBuilding({ ...building, occupancy: e.target.value })} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea rows={2} value={building.notes} onChange={(e) => setBuilding({ ...building, notes: e.target.value })} />
          </Field>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Leave anything unknown blank. Areas and dimensions are never measured or inferred automatically.
        </p>
      </Panel>

      <Panel
        title="Site information"
        actions={
          site ? (
            <Button size="sm" variant="outline" onClick={() => dialogs.editSite(site)}>
              Edit site
            </Button>
          ) : undefined
        }
      >
        {site ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Site", site.name],
              ["Address", site.address ?? "—"],
              ["City", site.city ?? "—"],
              ["Province", site.province ?? "—"],
              ["Venue type", site.venue_type ?? "—"],
              ["Status", site.status ?? "—"],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{k}</dt>
                <dd className="mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">No site is linked to this project.</p>
        )}
      </Panel>

      <Panel title={`Floor schedule (${floors.length})`}>
        {floors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No floor records yet. Add floors in Plans &amp; mapping.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-2 pr-3">Level</th>
                  <th className="py-2 pr-3">Display name</th>
                  <th className="py-2 pr-3">Floor use</th>
                  <th className="py-2 pr-3">Plan</th>
                  <th className="py-2 pr-3">Revisions</th>
                  <th className="py-2 pr-3">Devices</th>
                  <th className="py-2 pr-3">Client visible</th>
                </tr>
              </thead>
              <tbody>
                {floors.map((f) => (
                  <tr key={f.id} className="border-t border-border">
                    <td className="py-2 pr-3 tabular-nums">{f.level_number}</td>
                    <td className="py-2 pr-3">
                      <Input
                        value={f.display_name}
                        onChange={(e) => setFloors((prev) => prev.map((x) => (x.id === f.id ? { ...x, display_name: e.target.value } : x)))}
                        onBlur={(e) => saveFloor(f, { display_name: e.target.value })}
                        className="h-9"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        className={selectCls}
                        value={f.floor_use ?? "other"}
                        onChange={(e) => saveFloor(f, { floor_use: e.target.value })}
                      >
                        {FLOOR_USES.map((u: { value: string; label: string }) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{f.plan_image_path ? "Interactive" : "Not set"}</td>
                    <td className="py-2 pr-3 tabular-nums">{f.revisions}</td>
                    <td className="py-2 pr-3 tabular-nums">{f.devices}</td>
                    <td className="py-2 pr-3">
                      <input
                        type="checkbox"
                        checked={f.client_visible}
                        onChange={(e) => saveFloor(f, { client_visible: e.target.checked })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {dialogs.dialogs}
    </div>
  );
};

export default BuildingSiteTab;
