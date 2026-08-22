import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import FloorPlanCanvas from "@/components/portal/FloorPlanCanvas";
import { DOCUMENTS_BUCKET, signedUrl } from "@/lib/portalFiles";
import {
  FLOOR_USES,
  MARKER_KINDS,
  MARKER_STATES,
  SURVEY_DISCLAIMER,
  clamp01,
  kindLabel,
  kindShort,
  markerStats,
  stateLabel,
  type FloorMarker,
  type MarkerKind,
  type MarkerState,
  type PortalFloor,
} from "@/lib/floorPlans";
import { parseWaypoints, routeStats, type CableRoute } from "@/lib/cableRoutes";
import { markerTransaction, reconciliationNote } from "@/lib/designApi";

type CatalogProduct = {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  discipline: string | null;
  default_marker_type: MarkerKind | null;
  unit: string | null;
};

const Section: React.FC<{ title: string; children: React.ReactNode; note?: string }> = ({
  title,
  children,
  note,
}) => (
  <section className="border border-border p-5 space-y-4">
    <div>
      <h3 className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{title}</h3>
      {note && <p className="text-xs text-muted-foreground mt-2">{note}</p>}
    </div>
    {children}
  </section>
);

const selectCls =
  "w-full border border-border bg-background text-foreground text-sm px-3 py-2";

const FloorPlansManager: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [floors, setFloors] = useState<PortalFloor[]>([]);
  const [markers, setMarkers] = useState<FloorMarker[]>([]);
  const [routes, setRoutes] = useState<CableRoute[]>([]);
  const [floorId, setFloorId] = useState("");
  const [planUrl, setPlanUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeKind, setPlaceKind] = useState<MarkerKind>("wifi_ap");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [placeProductId, setPlaceProductId] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selected, setSelected] = useState<FloorMarker | null>(null);
  const [bulk, setBulk] = useState({ prefix: "", count: 10, kind: "wifi_ap" as MarkerKind });
  const [copyTargets, setCopyTargets] = useState<string[]>([]);
  const [newFloor, setNewFloor] = useState({ level_number: "", display_name: "", floor_use: "accommodation" });

  const load = useCallback(async () => {
    if (!projectId) return;
    const [{ data: f }, { data: m }, { data: r }, { data: pc }] = await Promise.all([
      supabase.from("portal_floors").select("*").eq("project_id", projectId).order("sort_order"),
      supabase.from("portal_floor_markers").select("*").eq("project_id", projectId).order("sort_order"),
      supabase.from("portal_cable_routes").select("*").eq("project_id", projectId).order("route_label"),
      supabase
        .from("portal_product_catalog")
        .select("id,name,manufacturer,model,discipline,default_marker_type,unit")
        .eq("is_active", true)
        .is("archived_at", null)
        .order("name"),
    ]);
    setProducts((pc ?? []) as unknown as CatalogProduct[]);
    const list = (f ?? []) as unknown as PortalFloor[];
    setFloors(list);
    setFloorId((prev) => (prev && list.some((x) => x.id === prev) ? prev : list[0]?.id ?? ""));
    setMarkers((m ?? []) as unknown as FloorMarker[]);
    setRoutes(
      (r ?? []).map((row) => ({
        ...(row as unknown as CableRoute),
        waypoints: parseWaypoints((row as { waypoints?: unknown }).waypoints),
      })),
    );
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const floor = useMemo(() => floors.find((f) => f.id === floorId) ?? null, [floors, floorId]);
  // Archived devices stay on record but never appear on the plan or in quantities.
  const activeMarkers = useMemo(() => markers.filter((m) => !m.archived_at), [markers]);
  const floorMarkers = useMemo(
    () => activeMarkers.filter((m) => m.floor_id === floorId),
    [activeMarkers, floorId],
  );
  const archivedFloorMarkers = useMemo(
    () => markers.filter((m) => m.floor_id === floorId && m.archived_at),
    [markers, floorId],
  );
  const stats = useMemo(() => markerStats(floorMarkers), [floorMarkers]);
  const floorRouteStats = useMemo(
    () => routeStats(routes.filter((r) => r.floor_id === floorId)),
    [routes, floorId],
  );
  const buildingStats = useMemo(() => markerStats(activeMarkers), [activeMarkers]);

  useEffect(() => {
    let cancelled = false;
    setPlanUrl(null);
    setSelected(null);
    if (!floor?.plan_image_path) return;
    signedUrl(DOCUMENTS_BUCKET, floor.plan_image_path, 900)
      .then((u) => !cancelled && setPlanUrl(u))
      .catch(() => !cancelled && setPlanUrl(null));
    return () => {
      cancelled = true;
    };
  }, [floor?.id, floor?.plan_image_path]);

  const logHistory = async (action: string, detail: string, markerId?: string) => {
    await supabase.from("portal_floor_marker_history").insert({
      marker_id: markerId ?? null,
      floor_id: floorId || null,
      actor_user_id: user?.id ?? null,
      actor_type: "admin",
      action,
      detail,
    });
  };

  const fail = (message: string) => toast({ title: "Action failed", description: message, variant: "destructive" });

  /* ---------------- Floors ---------------- */

  const createFloor = async () => {
    const level = Number(newFloor.level_number);
    if (!Number.isInteger(level) || level < 0) return fail("Level number must be 0 or greater.");
    if (!newFloor.display_name.trim()) return fail("Display name is required.");
    if (floors.some((f) => f.level_number === level))
      return fail(`Level ${level} already exists for this project.`);
    setBusy(true);
    const { error } = await supabase.from("portal_floors").insert({
      project_id: projectId,
      level_number: level,
      display_name: newFloor.display_name.trim(),
      floor_use: newFloor.floor_use,
      sort_order: level,
      notes: SURVEY_DISCLAIMER,
    });
    setBusy(false);
    if (error) return fail(error.message);
    setNewFloor({ level_number: "", display_name: "", floor_use: "accommodation" });
    toast({ title: "Level added" });
    load();
  };

  const updateFloor = async (patch: Partial<PortalFloor>) => {
    if (!floor) return;
    setBusy(true);
    const { error } = await supabase.from("portal_floors").update(patch).eq("id", floor.id);
    setBusy(false);
    if (error) return fail(error.message);
    load();
  };

  /**
   * Upload a plan as PDF or image. The original file is always retained under a
   * unique timestamped path, prior revisions are never overwritten, and the
   * interactive workspace image is switched only for image uploads (a PDF is kept
   * as the source until an interactive preview image is uploaded for it).
   */
  const uploadPlan = async (file: File) => {
    if (!floor) return;
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) return fail("Upload a PDF or an image (PNG, JPG or WEBP).");
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? (isPdf ? "pdf" : "png");
    const stamp = Date.now();
    const path = `${projectId}/floor-plans/level-${String(floor.level_number).padStart(2, "0")}-${stamp}.${ext}`;
    // upsert:false so an earlier revision can never be overwritten.
    const { error: upErr } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file, { upsert: false });
    if (upErr) {
      setBusy(false);
      return fail(upErr.message);
    }

    const { count } = await supabase
      .from("portal_plan_revisions")
      .select("id", { count: "exact", head: true })
      .eq("floor_id", floor.id);
    const revisionLabel = `Rev ${String((count ?? 0) + 1).padStart(2, "0")}`;

    // Only one revision per floor stays current.
    await supabase.from("portal_plan_revisions").update({ is_current: false }).eq("floor_id", floor.id);
    const { error: revErr } = await supabase.from("portal_plan_revisions").insert({
      project_id: projectId,
      floor_id: floor.id,
      revision_label: revisionLabel,
      source_path: path,
      image_path: isImage ? path : null,
      original_filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      is_current: true,
      uploaded_by: user?.id ?? null,
      notes: isPdf
        ? "PDF source retained. Upload an interactive preview image to make this revision the design workspace."
        : null,
    });
    if (revErr) {
      setBusy(false);
      return fail(revErr.message);
    }

    if (isImage) {
      const { error } = await supabase.from("portal_floors").update({ plan_image_path: path }).eq("id", floor.id);
      if (error) {
        setBusy(false);
        return fail(error.message);
      }
    }

    setBusy(false);
    await logHistory(
      "plan_upload",
      `${revisionLabel} uploaded for ${floor.display_name} (${file.name})${isImage ? " and set as the interactive workspace" : " — PDF source retained"}`,
    );
    toast({
      title: isImage ? "Plan revision uploaded" : "PDF source uploaded",
      description: isImage
        ? `${revisionLabel} is now the interactive design workspace. Earlier revisions are retained.`
        : `${revisionLabel} source stored. Upload an image preview to design on it.`,
    });
    load();
  };

  /* ---------------- Markers ---------------- */

  /**
   * Every design change goes through one server transaction that also reconciles
   * the project's nominated design bill, so devices and quantities cannot drift.
   */
  const runTransaction = async (
    action: "save" | "archive" | "restore" | "delete",
    payload: Record<string, unknown>,
    successTitle: string,
  ) => {
    setBusy(true);
    try {
      const res = await markerTransaction(action, payload);
      const note = reconciliationNote(res.reconciliation);
      toast({ title: successTitle, description: note });
      await load();
      return res;
    } catch (e) {
      fail(e instanceof Error ? e.message : "Unexpected error");
      await load();
      return null;
    } finally {
      setBusy(false);
    }
  };

  const addMarker = async (x: number, y: number, direction?: number) => {
    if (!floor) return;
    const product = products.find((p) => p.id === placeProductId) ?? null;
    const kind = product?.default_marker_type ?? placeKind;
    const existing = floorMarkers.filter((m) => m.marker_type === kind).length;
    const label = `${kindShort(kind)}-L${String(floor.level_number).padStart(2, "0")}-${String(existing + 1).padStart(2, "0")}`;
    await runTransaction(
      "save",
      {
        floor_id: floor.id,
        marker_type: kind,
        label,
        status: "planned",
        is_placed: true,
        x_norm: clamp01(x),
        y_norm: clamp01(y),
        ...(direction != null ? { direction_deg: Math.round(direction) } : {}),
        notes: SURVEY_DISCLAIMER,
        ...(product ? { product_id: product.id } : {}),
      },
      product ? `${label} placed — ${product.name}` : `${label} placed`,
    );
  };

  const moveMarker = (id: string, x: number, y: number) => {
    setMarkers((prev) => prev.map((m) => (m.id === id ? { ...m, x_norm: x, y_norm: y } : m)));
  };

  /** Persists the exact release position reported by the canvas, never a stale render value. */
  const persistMove = async (id: string, x: number, y: number) => {
    const m = markers.find((v) => v.id === id);
    if (!m) return;
    setMarkers((prev) => prev.map((v) => (v.id === id ? { ...v, x_norm: x, y_norm: y } : v)));
    try {
      await markerTransaction("save", {
        id,
        floor_id: m.floor_id,
        is_placed: true,
        x_norm: clamp01(x),
        y_norm: clamp01(y),
      });
    } catch (e) {
      fail(e instanceof Error ? e.message : "Could not save the new position");
      await load();
    }
  };

  const saveMarker = async (patch: Partial<FloorMarker>) => {
    if (!selected) return;
    // Catalogue linkage is quantity-bearing: it is only ever written through the
    // transactional API so the design bill is reconciled in the same transaction.
    const linkProduct = Object.prototype.hasOwnProperty.call(patch, "product_id");
    const rest = { ...patch };
    delete (rest as { product_id?: string | null }).product_id;

    setBusy(true);
    if (Object.keys(rest).length > 0) {
      const { error } = await supabase.from("portal_floor_markers").update(rest).eq("id", selected.id);
      if (error) {
        setBusy(false);
        return fail(error.message);
      }
      await logHistory("marker_update", `${selected.label} updated`, selected.id);
    }
    setBusy(false);

    if (linkProduct) {
      await runTransaction(
        "save",
        { id: selected.id, floor_id: selected.floor_id, product_id: patch.product_id ?? null },
        "Device and bill updated",
      );
      return;
    }
    toast({ title: "Marker saved" });
    load();
  };

  const archiveMarker = async () => {
    if (!selected) return;
    await runTransaction(
      "archive",
      { id: selected.id },
      `${selected.label} archived — kept on record, removed from quantities`,
    );
    setSelected(null);
  };

  const restoreMarker = async (id: string, label: string) => {
    await runTransaction("restore", { id }, `${label} restored to the active design`);
  };

  const deleteMarker = async () => {
    if (!selected) return;
    const attached = routes.filter(
      (r) => r.rack_marker_id === selected.id || r.device_marker_id === selected.id,
    ).length;
    const routeWarning = attached
      ? `\n\n${attached} preliminary cable route${attached === 1 ? "" : "s"} reference this device and will be removed with it. Remaining devices and their routes are unaffected.`
      : "";
    if (
      !window.confirm(
        `Delete marker ${selected.label}? This cannot be undone — archive it instead if it has any site history.${routeWarning}`,
      )
    )
      return;
    const res = await runTransaction("delete", { id: selected.id }, `${selected.label} deleted`);
    if (res) setSelected(null);
  };

  const duplicateMarker = async () => {
    if (!selected || !floor) return;
    const same = floorMarkers.filter((m) => m.marker_type === selected.marker_type).length;
    const base = selected.label.replace(/-\d+$/, "");
    const { error } = await supabase.from("portal_floor_markers").insert({
      floor_id: selected.floor_id,
      project_id: projectId,
      marker_type: selected.marker_type,
      x_norm: Math.min(1, Number(selected.x_norm) + 0.03),
      y_norm: Math.min(1, Number(selected.y_norm) + 0.03),
      label: `${base}-${String(same + 1).padStart(2, "0")}`,
      equipment: selected.equipment,
      model: selected.model,
      status: selected.status,
      client_visible: selected.client_visible,
      description: selected.description,
      sort_order: same + 1,
      created_by: user?.id ?? null,
    });
    if (error) return fail(error.message);
    toast({ title: "Marker duplicated" });
    load();
  };

  const bulkCreate = async () => {
    if (!floor) return;
    const count = Number(bulk.count);
    if (!Number.isInteger(count) || count < 1 || count > 60) return fail("Count must be between 1 and 60.");
    const prefix = (bulk.prefix.trim() || (bulk.kind === "camera" ? "CAM" : "AP")).toUpperCase();
    const existing = floorMarkers.filter((m) => m.marker_type === bulk.kind).length;
    const rows = Array.from({ length: count }, (_, i) => {
      const n = existing + i + 1;
      const col = i % 5;
      const row = Math.floor(i / 5);
      return {
        floor_id: floor.id,
        project_id: projectId,
        marker_type: bulk.kind,
        x_norm: Number((0.18 + 0.16 * col).toFixed(4)),
        y_norm: Number((0.22 + 0.18 * row).toFixed(4)),
        label: `${prefix}-L${String(floor.level_number).padStart(2, "0")}-${String(n).padStart(2, "0")}`,
        status: "planned" as MarkerState,
        description: SURVEY_DISCLAIMER,
        sort_order: n,
        created_by: user?.id ?? null,
      };
    });
    setBusy(true);
    const { error } = await supabase.from("portal_floor_markers").insert(rows);
    setBusy(false);
    if (error) return fail(error.message);
    await logHistory("marker_bulk_create", `${count} ${kindLabel(bulk.kind)} markers created on ${floor.display_name}`);
    toast({ title: `${count} markers created` });
    load();
  };

  const copyLayout = async () => {
    if (!floor || copyTargets.length === 0) return fail("Select at least one target level.");
    const clash = copyTargets.filter((id) => markers.some((m) => m.floor_id === id));
    if (
      clash.length > 0 &&
      !window.confirm(
        `${clash.length} selected level(s) already have markers. Existing markers on those levels — and any preliminary cable routes attached to them — will be deleted and replaced. Continue?`,
      )
    )
      return;
    setBusy(true);
    const { error: delErr } = await supabase
      .from("portal_floor_markers")
      .delete()
      .in("floor_id", copyTargets);
    if (delErr) {
      setBusy(false);
      return fail(delErr.message);
    }
    const rows = copyTargets.flatMap((targetId) => {
      const target = floors.find((f) => f.id === targetId);
      return floorMarkers.map((m) => ({
        floor_id: targetId,
        project_id: projectId,
        marker_type: m.marker_type,
        x_norm: m.x_norm,
        y_norm: m.y_norm,
        label: target
          ? m.label.replace(/L\d{2}/, `L${String(target.level_number).padStart(2, "0")}`)
          : m.label,
        equipment: m.equipment,
        model: m.model,
        status: "planned" as MarkerState,
        client_visible: m.client_visible,
        description: m.description,
        sort_order: m.sort_order,
        created_by: user?.id ?? null,
      }));
    });
    const { error } = await supabase.from("portal_floor_markers").insert(rows);
    setBusy(false);
    if (error) return fail(error.message);
    await logHistory("layout_copy", `Layout copied from ${floor.display_name} to ${copyTargets.length} level(s)`);
    toast({ title: "Layout copied" });
    setCopyTargets([]);
    load();
  };

  if (!projectId) return <p className="text-sm text-muted-foreground">Select a project above.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2 min-w-[240px]">
          <Label htmlFor="fp-level">Level</Label>
          <select id="fp-level" className={selectCls} value={floorId} onChange={(e) => setFloorId(e.target.value)}>
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.display_name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">
          Building: {buildingStats.aps} Wi-Fi APs · {buildingStats.cameras} CCTV cameras ·{" "}
          {buildingStats.racks} network racks · {buildingStats.total} devices total (APs + CCTV +
          racks) · {buildingStats.planned} planned (all devices) · {buildingStats.installed}{" "}
          installed · {buildingStats.testedActive} tested/active
        </p>
        {busy && <span className="text-xs text-muted-foreground">Working…</span>}
        <a
          href="/portal/building-view"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.18em] hover:bg-muted"
        >
          Preview client building view
        </a>
      </div>

      <Section title="Add level">
        <div className="grid sm:grid-cols-4 gap-4">
          <Input
            placeholder="Level number"
            value={newFloor.level_number}
            onChange={(e) => setNewFloor({ ...newFloor, level_number: e.target.value })}
          />
          <Input
            placeholder="Display name"
            value={newFloor.display_name}
            onChange={(e) => setNewFloor({ ...newFloor, display_name: e.target.value })}
          />
          <select
            className={selectCls}
            value={newFloor.floor_use}
            onChange={(e) => setNewFloor({ ...newFloor, floor_use: e.target.value })}
          >
            {FLOOR_USES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          <Button onClick={createFloor}>Add level</Button>
        </div>
      </Section>

      {floor && (
        <>
          <Section title={`Plan image – ${floor.display_name}`} note="Stored in private client storage; clients see it via short-lived signed links only.">
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadPlan(f);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                {floor.plan_image_path ? "Upload new plan revision" : "Upload plan (PDF or image)"}
              </Button>
              <Button
                variant="outline"
                onClick={() => updateFloor({ client_visible: !floor.client_visible })}
              >
                {floor.client_visible ? "Hide level from client" : "Show level to client"}
              </Button>
              <span className="text-xs text-muted-foreground">
                {floor.plan_image_path ?? "No plan image yet"}
              </span>
            </div>
            <Textarea
              rows={2}
              value={floor.notes ?? ""}
              onChange={(e) => setFloors((prev) => prev.map((f) => (f.id === floor.id ? { ...f, notes: e.target.value } : f)))}
              onBlur={(e) => updateFloor({ notes: e.target.value })}
              placeholder="Level notes"
            />
          </Section>

          <Section
            title="Place & edit devices"
            note="Pick a catalogue product (or a plain device type), switch placement mode on and click the plan. Each catalogue-linked device you place, archive or delete updates the project's design bill of quantities in the same transaction."
          >
            <div className="flex flex-wrap items-center gap-3">
              <select
                className={selectCls + " max-w-[320px]"}
                value={placeProductId}
                onChange={(e) => setPlaceProductId(e.target.value)}
              >
                <option value="">No catalogue product (device type only)</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {[p.manufacturer, p.model, p.name].filter(Boolean).join(" ")}
                  </option>
                ))}
              </select>
              <select
                className={selectCls + " max-w-[220px]"}
                value={placeKind}
                onChange={(e) => setPlaceKind(e.target.value as MarkerKind)}
                disabled={!!placeProductId}
              >
                {MARKER_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
              <Button variant={placing ? "default" : "outline"} onClick={() => setPlacing((p) => !p)}>
                {placing ? "Placement mode: on" : "Placement mode: off"}
              </Button>
              <span className="text-xs text-muted-foreground">
                This level: {stats.aps} Wi-Fi APs · {stats.cameras} CCTV cameras · {stats.racks}{" "}
                racks · {stats.total} devices · {floorRouteStats.total} cable routes (
                {floorRouteStats.wifi} Wi-Fi / {floorRouteStats.camera} CCTV)
                {archivedFloorMarkers.length > 0 && ` · ${archivedFloorMarkers.length} archived`}
              </span>
            </div>

            <FloorPlanCanvas
              imageUrl={planUrl}
              markers={floorMarkers}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
              onPlace={(x, y, deg) => addMarker(x, y, deg)}
              onMove={(id, x, y) => moveMarker(id, x, y)}
              onMoveEnd={(id, x, y) => persistMove(id, x, y)}
              placing={placing}
              height="h-[55vh]"
              emptyLabel="Upload a plan image for this level to start placing devices."
            />
            <p className="text-xs text-muted-foreground">
              Dragged positions save automatically when you release the marker.
            </p>
          </Section>

          {selected && (
            <Section title={`Marker – ${selected.label}`}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={selected.label}
                    onChange={(e) => setSelected({ ...selected, label: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className={selectCls}
                    value={selected.marker_type}
                    onChange={(e) => setSelected({ ...selected, marker_type: e.target.value as MarkerKind })}
                  >
                    {MARKER_KINDS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className={selectCls}
                    value={selected.status}
                    onChange={(e) => setSelected({ ...selected, status: e.target.value as MarkerState })}
                  >
                    {MARKER_STATES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Catalogue product (drives bill quantity)</Label>
                  <select
                    className={selectCls}
                    value={selected.product_id ?? ""}
                    onChange={(e) =>
                      saveMarker({ product_id: e.target.value || null } as Partial<FloorMarker>)
                    }
                    disabled={busy}
                  >
                    <option value="">Not linked to the catalogue</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {[p.manufacturer, p.model, p.name].filter(Boolean).join(" ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Equipment</Label>
                  <Input
                    value={selected.equipment ?? ""}
                    onChange={(e) => setSelected({ ...selected, equipment: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input value={selected.model ?? ""} onChange={(e) => setSelected({ ...selected, model: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Serial</Label>
                  <Input
                    value={selected.serial_number ?? ""}
                    onChange={(e) => setSelected({ ...selected, serial_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>MAC address</Label>
                  <Input
                    value={selected.mac_address ?? ""}
                    onChange={(e) => setSelected({ ...selected, mac_address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Installed date</Label>
                  <Input
                    type="date"
                    value={selected.installed_on ?? ""}
                    onChange={(e) => setSelected({ ...selected, installed_on: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tested date</Label>
                  <Input
                    type="date"
                    value={selected.tested_on ?? ""}
                    onChange={(e) => setSelected({ ...selected, tested_on: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Installation evidence reference</Label>
                  <Input
                    value={selected.evidence_note ?? ""}
                    onChange={(e) => setSelected({ ...selected, evidence_note: e.target.value })}
                    placeholder="e.g. photo set / test report reference"
                  />
                </div>
              </div>
              <Textarea
                rows={3}
                value={selected.notes ?? ""}
                onChange={(e) => setSelected({ ...selected, notes: e.target.value })}
                placeholder="Internal notes"
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    if (!selected.label.trim()) return fail("Label is required.");
                    if (selected.status !== "planned" && !selected.installed_on)
                      return fail("Set an installed date before moving past Planned.");
                    saveMarker({
                      label: selected.label.trim(),
                      marker_type: selected.marker_type,
                      status: selected.status,
                      equipment: selected.equipment || null,
                      model: selected.model || null,
                      serial_number: selected.serial_number || null,
                      mac_address: selected.mac_address || null,
                      installed_on: selected.installed_on || null,
                      tested_on: selected.tested_on || null,
                      evidence_note: selected.evidence_note || null,
                      notes: selected.notes || null,
                      x_norm: selected.x_norm,
                      y_norm: selected.y_norm,
                    });
                  }}
                >
                  Save marker
                </Button>
                <Button variant="outline" onClick={() => saveMarker({ client_visible: !selected.client_visible })}>
                  {selected.client_visible ? "Hide from client" : "Show to client"}
                </Button>
                <Button variant="outline" onClick={duplicateMarker}>
                  Duplicate
                </Button>
                <Button variant="outline" onClick={archiveMarker} disabled={busy}>
                  Archive device
                </Button>
                <Button variant="outline" onClick={deleteMarker} disabled={busy}>
                  Delete
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Current status: {stateLabel(selected.status)} · client visible:{" "}
                {selected.client_visible ? "yes" : "no"}
              </p>
            </Section>
          )}

          {archivedFloorMarkers.length > 0 && (
            <Section
              title={`Archived devices on ${floor.display_name}`}
              note="Archived devices are excluded from the plan and from bill quantities, but their history is retained. Restoring one puts its quantity back."
            >
              <Button variant="outline" onClick={() => setShowArchived((v) => !v)}>
                {showArchived ? "Hide archived devices" : `Show ${archivedFloorMarkers.length} archived device(s)`}
              </Button>
              {showArchived && (
                <ul className="divide-y divide-border border border-border">
                  {archivedFloorMarkers.map((m) => (
                    <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm">
                      <span>
                        {m.label} · {kindLabel(m.marker_type)} · {stateLabel(m.status)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => restoreMarker(m.id, m.label)}
                      >
                        Restore
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          <Section title="Bulk create numbered markers">
            <div className="grid sm:grid-cols-4 gap-4">
              <Input
                placeholder="Label prefix (e.g. AP)"
                value={bulk.prefix}
                onChange={(e) => setBulk({ ...bulk, prefix: e.target.value })}
              />
              <Input
                type="number"
                min={1}
                max={60}
                value={bulk.count}
                onChange={(e) => setBulk({ ...bulk, count: Number(e.target.value) })}
              />
              <select className={selectCls} value={bulk.kind} onChange={(e) => setBulk({ ...bulk, kind: e.target.value as MarkerKind })}>
                {MARKER_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
              <Button onClick={bulkCreate}>Create markers</Button>
            </div>
          </Section>

          <Section title="Copy this level's layout to other levels" note="Existing markers on the selected target levels are replaced. You will be asked to confirm first.">
            <div className="grid sm:grid-cols-3 gap-2">
              {floors
                .filter((f) => f.id !== floor.id)
                .map((f) => (
                  <label key={f.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={copyTargets.includes(f.id)}
                      onChange={(e) =>
                        setCopyTargets((prev) =>
                          e.target.checked ? [...prev, f.id] : prev.filter((x) => x !== f.id),
                        )
                      }
                    />
                    {f.display_name}
                  </label>
                ))}
            </div>
            <Button variant="outline" onClick={copyLayout} disabled={copyTargets.length === 0}>
              Copy layout to {copyTargets.length} level(s)
            </Button>
          </Section>
        </>
      )}
    </div>
  );
};

export default FloorPlansManager;
