import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, MapPin, MapPinOff, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { markerTransaction } from "@/lib/designApi";

import {
  DISCIPLINES,
  disciplineLabel,
  listProducts,
  type CatalogProduct,
  type Discipline,
} from "@/lib/productCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CAMERA_RANGES,
  FOV_PRESETS,
  MARKER_ENVIRONMENTS,
  MARKER_KINDS,
  MARKER_STATES,
  kindLabel,
  kindShort,
  stateLabel,
  type CameraRange,
  type FloorMarker,
  type MarkerKind,
  type MarkerState,
  type PortalFloor,
} from "@/lib/floorPlans";

type FormState = {
  id?: string;
  marker_type: MarkerKind;
  label: string;
  status: MarkerState;
  area: string;
  equipment: string;
  model: string;
  environment: string;
  lens_model: string;
  mounting_height_m: string;
  nvr_channel: string;
  notes: string;
  /** True only when the record already has plan coordinates. */
  is_placed: boolean;
  direction_deg: number;
  fov_deg: number;
  coverage_range: CameraRange;
  /** Catalogue product this instance represents — drives BOQ quantities. */
  product_id: string | null;
  discipline: string | null;
};

const blank = (kind: MarkerKind = "camera"): FormState => ({
  marker_type: kind,
  label: "",
  status: "planned",
  area: "",
  equipment: "",
  model: "",
  environment: "",
  lens_model: "",
  mounting_height_m: "",
  nvr_channel: "",
  notes: "",
  is_placed: false,
  direction_deg: 0,
  fov_deg: 90,
  coverage_range: "medium",
  product_id: null,
  discipline: null,
});

const fromMarker = (m: FloorMarker): FormState => ({
  id: m.id,
  marker_type: m.marker_type,
  label: m.label,
  status: m.status,
  area: m.area ?? "",
  equipment: m.equipment ?? "",
  model: m.model ?? "",
  environment: m.environment ?? "",
  lens_model: m.lens_model ?? "",
  mounting_height_m: m.mounting_height_m == null ? "" : String(m.mounting_height_m),
  nvr_channel: m.nvr_channel == null ? "" : String(m.nvr_channel),
  notes: m.notes ?? "",
  is_placed: m.is_placed ?? true,
  direction_deg: Number(m.direction_deg ?? 0),
  fov_deg: Number(m.fov_deg ?? 90),
  coverage_range: (m.coverage_range ?? "medium") as CameraRange,
  product_id: (m as any).product_id ?? null,
  discipline: (m as any).discipline ?? null,
});

const prefixFor = (kind: MarkerKind) =>
  kind === "camera" ? "CAM" : kind === "wifi_ap" ? "AP" : kind === "rack" ? "RACK" : "DEV";

/** Next free sequential label for a device type on a level, e.g. CAM-L03-07. */
const suggestLabel = (kind: MarkerKind, level: number, onFloor: FloorMarker[]) => {
  const stem = `${prefixFor(kind)}-L${String(level).padStart(2, "0")}-`;
  const used = onFloor
    .filter((m) => m.label.toUpperCase().startsWith(stem))
    .map((m) => Number(m.label.slice(stem.length)) || 0);
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `${stem}${String(next).padStart(2, "0")}`;
};

/** Unique "…-copy" style label for a duplicated device. */
const duplicateLabel = (source: FloorMarker, level: number, onFloor: FloorMarker[]) => {
  const taken = new Set(onFloor.map((m) => m.label.toLowerCase()));
  const sequential = suggestLabel(source.marker_type, level, onFloor);
  if (!taken.has(sequential.toLowerCase())) return sequential;
  for (let i = 2; i < 200; i += 1) {
    const candidate = `${source.label}-COPY${i}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  return `${source.label}-COPY`;
};

const selectClass =
  "w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground";

type Props = {
  floor: PortalFloor | null;
  floorMarkers: FloorMarker[];
  selected: FloorMarker | null;
  onSelect: (m: FloorMarker | null) => void;
  onChanged: () => void;
  /** Ask the plan to enter one-shot placement mode for this marker. */
  onRequestPlace: (markerId: string, label: string) => void;
  /** "sidebar" sits beside the plan on desktop, "sheet" is the mobile drawer. */
  layout?: "sidebar" | "sheet";
};

/**
 * Plan-side device management: create, duplicate, edit, place, unplace and delete
 * devices on the selected level. Rendered only for users the backend allows to
 * manage the project. Placement always happens by clicking the plan — a device is
 * never given an arbitrary default position.
 */
const DeviceManager: React.FC<Props> = ({
  floor,
  floorMarkers,
  selected,
  onSelect,
  onChanged,
  onRequestPlace,
  layout = "sidebar",
}) => {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FloorMarker | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MarkerKind>("all");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [palette, setPalette] = useState<"all" | Discipline>("all");

  // Active catalogue products power the plan palette for every discipline.
  useEffect(() => {
    let alive = true;
    void listProducts()
      .then((list) => alive && setProducts(list.filter((p) => p.is_active)))
      .catch(() => alive && setProducts([]));
    return () => {
      alive = false;
    };
  }, []);

  const paletteProducts = useMemo(
    () => products.filter((p) => (palette === "all" ? true : p.discipline === palette)),
    [products, palette],
  );

  /** Applying a product sets sensible defaults but every field stays editable. */
  const applyProduct = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId) ?? null;
      setForm((f) => {
        if (!f) return f;
        if (!product) return { ...f, product_id: null };
        return {
          ...f,
          product_id: product.id,
          discipline: product.discipline,
          marker_type: (product.default_marker_type ?? f.marker_type) as MarkerKind,
          equipment: product.name,
          model: [product.manufacturer, product.model].filter(Boolean).join(" ") || f.model,
          fov_deg: product.default_fov_deg ?? f.fov_deg,
          coverage_range: (product.default_coverage_range ?? f.coverage_range) as CameraRange,
        };
      });
    },
    [products],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  // Editing follows the plan selection so clicking a marker opens its record.
  useEffect(() => {
    if (!selected || form?.id === selected.id) return;
    if (form && !form.id) return; // don't discard an in-progress new device
    setForm(fromMarker(selected));
  }, [selected, form]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return floorMarkers
      .filter((m) => (typeFilter === "all" ? true : m.marker_type === typeFilter))
      .filter((m) =>
        !q
          ? true
          : [m.label, m.area, m.equipment, m.model].some((v) => (v ?? "").toLowerCase().includes(q)),
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [floorMarkers, typeFilter, query]);

  const unplaced = useMemo(() => floorMarkers.filter((m) => m.is_placed === false), [floorMarkers]);

  const startCreate = useCallback(
    (kind: MarkerKind = "camera") => {
      if (!floor) return;
      onSelect(null);
      setForm({
        ...blank(kind),
        label: suggestLabel(kind, floor.level_number, floorMarkers),
      });
    },
    [floor, floorMarkers, onSelect],
  );

  const startEdit = useCallback(
    (m: FloorMarker) => {
      onSelect(m);
      setForm(fromMarker(m));
    },
    [onSelect],
  );

  /** Copy a device's specification into a new unplaced record for the user to review. */
  const startDuplicate = useCallback(
    (m: FloorMarker) => {
      if (!floor) return;
      onSelect(null);
      setForm({
        ...fromMarker(m),
        id: undefined,
        is_placed: false,
        label: duplicateLabel(m, floor.level_number, floorMarkers),
      });
      toast({
        title: "Duplicate ready",
        description: `Review the label and details for the copy of ${m.label}, then add it and place it on the plan.`,
      });
    },
    [floor, floorMarkers, onSelect, toast],
  );

  const savePayload = useCallback(
    async (payload: Record<string, unknown>) => {
      const res = await markerTransaction("save", payload);
      return res.marker_id ?? "";
    },
    [],
  );


  /** Remove a device from the drawing while keeping its register record. */
  const markUnplaced = useCallback(
    async (m: FloorMarker) => {
      if (!floor) return;
      setBusyId(m.id);
      try {
        await savePayload({ id: m.id, floor_id: floor.id, is_placed: false });
        toast({
          title: "Device unplaced",
          description: `${m.label} stays in the register but no longer appears on the drawing.`,
        });
        setForm((f) => (f?.id === m.id ? { ...f, is_placed: false } : f));
        onChanged();
      } catch (e) {
        toast({
          title: "Device not unplaced",
          description: e instanceof Error ? e.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        setBusyId(null);
      }
    },
    [floor, onChanged, savePayload, toast],
  );

  const save = async () => {
    if (!floor || !form) return;
    if (!form.label.trim()) {
      toast({
        title: "Label required",
        description: "Give the device a unique label.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const existing = form.id ? floorMarkers.find((m) => m.id === form.id) : null;
    const hasCoords =
      existing != null && existing.x_norm != null && existing.y_norm != null && existing.is_placed !== false;
    // A device only stays placed if it already has coordinates; otherwise the user
    // places it by clicking the plan — never at an invented default position.
    const keepPlaced = form.is_placed && hasCoords;

    const payload: Record<string, unknown> = {
      id: form.id ?? null,
      floor_id: floor.id,
      marker_type: form.marker_type,
      label: form.label.trim(),
      status: form.status,
      area: form.area,
      equipment: form.equipment,
      model: form.model,
      environment: form.environment,
      lens_model: form.lens_model,
      mounting_height_m: form.mounting_height_m,
      nvr_channel: form.nvr_channel,
      notes: form.notes,
      is_placed: keepPlaced,
      direction_deg: form.direction_deg,
      fov_deg: form.fov_deg,
      coverage_range: form.coverage_range,
      product_id: form.product_id,
      discipline: form.discipline,
    };

    try {
      const id = await savePayload(payload);
      const label = form.label.trim();
      const needsPlacement = form.is_placed && !keepPlaced;
      toast({
        title: form.id ? "Device updated" : "Device added",
        description: needsPlacement
          ? `${label} saved. Click the plan to set its position.`
          : `${label} saved on ${floor.display_name}.`,
      });
      setForm(null);
      onSelect(null);
      onChanged();
      if (needsPlacement && id) onRequestPlace(id, label);
    } catch (e) {
      toast({
        title: "Device not saved",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await markerTransaction("archive", { id: deleteTarget.id });
    } catch (e) {
      setDeleting(false);
      toast({
        title: "Device not archived",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
      return;
    }
    setDeleting(false);

    toast({
      title: "Device deleted",
      description: `${deleteTarget.label} and its cable routes were removed.`,
    });
    setDeleteTarget(null);
    setForm(null);
    onSelect(null);
    onChanged();
  };

  const isCamera = form?.marker_type === "camera";
  const editingMarker = form?.id ? floorMarkers.find((m) => m.id === form.id) ?? null : null;

  if (!floor) return null;

  return (
    <div
      className={[
        "print:hidden",
        layout === "sidebar" ? "border border-border" : "",
      ].join(" ")}
    >
      <div className="border-b border-border px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Device management
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {floor.display_name} · {floorMarkers.length} device
          {floorMarkers.length === 1 ? "" : "s"}
          {unplaced.length > 0 && ` · ${unplaced.length} not placed`}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(["camera", "wifi_ap", "rack"] as MarkerKind[]).map((k) => (
            <Button key={k} type="button" variant="outline" size="sm" onClick={() => startCreate(k)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
              Add {kindShort(k)}
            </Button>
          ))}
        </div>
      </div>

      {/* Register */}
      <div className="border-b border-border">
        <div className="flex flex-wrap items-center gap-2 p-4">
          <div className="relative flex-1 min-w-[150px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.5}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search label, area or model"
              className="pl-9"
              aria-label="Search devices on this level"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | MarkerKind)}
            className={`${selectClass} w-auto`}
            aria-label="Filter devices by type"
          >
            <option value="all">All types</option>
            {MARKER_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        <div className="max-h-[300px] overflow-y-auto border-t border-border">
          {rows.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">
              No devices match this filter on {floor.display_name}.
            </p>
          ) : (
            rows.map((m) => (
              <div
                key={m.id}
                className={[
                  "flex items-center justify-between gap-2 border-b border-border px-4 py-3 last:border-b-0",
                  selected?.id === m.id ? "bg-muted" : "",
                ].join(" ")}
              >
                <button type="button" onClick={() => startEdit(m)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm">{m.label}</span>
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {kindShort(m.marker_type)} · {stateLabel(m.status)}
                    {m.is_placed === false ? " · Not placed" : ""}
                    {m.area ? ` · ${m.area}` : ""}
                  </span>
                </button>
                <div className="flex flex-shrink-0 items-center gap-0.5">
                  {m.is_placed === false && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRequestPlace(m.id, m.label)}
                      aria-label={`Place ${m.label} on the plan`}
                      title="Place on plan"
                    >
                      <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(m)}
                    aria-label={`Edit ${m.label}`}
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(m)}
                    aria-label={`Delete ${m.label}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="p-4">
        {!form ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select a device in the list or on the plan to edit it, or add a new device above. New
            devices are created as register records and placed by clicking the plan.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {form.id ? `Editing ${form.label || "device"}` : "New device"}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setForm(null);
                  onSelect(null);
                }}
                aria-label="Close device editor"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="dm-discipline">Design discipline</Label>
                <select
                  id="dm-discipline"
                  value={palette}
                  onChange={(e) => setPalette(e.target.value as "all" | Discipline)}
                  className={selectClass}
                >
                  <option value="all">All disciplines</option>
                  {DISCIPLINES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="dm-product">Catalogue product</Label>
                <select
                  id="dm-product"
                  value={form.product_id ?? ""}
                  onChange={(e) => applyProduct(e.target.value)}
                  className={selectClass}
                >
                  <option value="">No catalogue product (not billed from the plan)</option>
                  {paletteProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {[p.manufacturer, p.model, p.name].filter(Boolean).join(" ")}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  {form.product_id
                    ? `Plan-linked — this instance adds 1 to the ${disciplineLabel(form.discipline)} product quantity on the linked BOQ. Moving or rotating it does not change quantities.`
                    : "Link a catalogue product so this device feeds the project bill of quantities automatically."}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dm-type">Device type</Label>
                <select
                  id="dm-type"
                  value={form.marker_type}
                  onChange={(e) => set("marker_type", e.target.value as MarkerKind)}
                  className={selectClass}
                >
                  {MARKER_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dm-label">Label</Label>
                <Input
                  id="dm-label"
                  value={form.label}
                  onChange={(e) => set("label", e.target.value)}
                  placeholder="CAM-L03-07"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dm-status">Status</Label>
                <select
                  id="dm-status"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as MarkerState)}
                  className={selectClass}
                >
                  {MARKER_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dm-area">Area / location</Label>
                <Input
                  id="dm-area"
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                  placeholder="Lift lobby"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dm-equipment">Equipment</Label>
                <Input
                  id="dm-equipment"
                  value={form.equipment}
                  onChange={(e) => set("equipment", e.target.value)}
                  placeholder="Dome camera"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dm-model">Model</Label>
                <Input
                  id="dm-model"
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="Hikvision DS-2CD1143G2"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dm-env">Environment</Label>
                <select
                  id="dm-env"
                  value={form.environment}
                  onChange={(e) => set("environment", e.target.value)}
                  className={selectClass}
                >
                  <option value="">Not specified</option>
                  {MARKER_ENVIRONMENTS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dm-height">Mounting height (m)</Label>
                <Input
                  id="dm-height"
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.mounting_height_m}
                  onChange={(e) => set("mounting_height_m", e.target.value)}
                />
              </div>
              {isCamera && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="dm-lens">Lens</Label>
                    <Input
                      id="dm-lens"
                      value={form.lens_model}
                      onChange={(e) => set("lens_model", e.target.value)}
                      placeholder="2.8 mm fixed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dm-channel">NVR channel</Label>
                    <Input
                      id="dm-channel"
                      type="number"
                      min="1"
                      value={form.nvr_channel}
                      onChange={(e) => set("nvr_channel", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dm-dir">Direction (°, 0 = north)</Label>
                    <Input
                      id="dm-dir"
                      type="number"
                      min="0"
                      max="359"
                      value={form.direction_deg}
                      onChange={(e) =>
                        set("direction_deg", Math.min(359, Math.max(0, Number(e.target.value) || 0)))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dm-fov">Field of view</Label>
                    <select
                      id="dm-fov"
                      value={form.fov_deg}
                      onChange={(e) => set("fov_deg", Number(e.target.value))}
                      className={selectClass}
                    >
                      {FOV_PRESETS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dm-range">Coverage range</Label>
                    <select
                      id="dm-range"
                      value={form.coverage_range}
                      onChange={(e) => set("coverage_range", e.target.value as CameraRange)}
                      className={selectClass}
                    >
                      {CAMERA_RANGES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dm-notes">Notes</Label>
              <Textarea
                id="dm-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Survey note, containment or power requirement"
              />
            </div>

            <p className="border border-border px-3 py-2 text-xs text-muted-foreground leading-relaxed">
              {editingMarker && editingMarker.is_placed !== false ? (
                <>
                  <span className="text-foreground">Placed on the plan.</span> Drag the marker in
                  reposition mode to adjust it, or use “Mark unplaced” to keep it in the register
                  only.
                </>
              ) : (
                <>
                  <span className="text-foreground">Register record only.</span> Use “Place on plan”
                  and click the drawing to set its position.
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" onClick={save} disabled={saving}>
                {saving ? "Saving…" : form.id ? "Save changes" : "Add device"}
              </Button>
              {editingMarker && editingMarker.is_placed === false && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onRequestPlace(editingMarker.id, editingMarker.label)}
                >
                  <MapPin className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                  Place on plan
                </Button>
              )}
              {editingMarker && editingMarker.is_placed !== false && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busyId === editingMarker.id}
                  onClick={() => markUnplaced(editingMarker)}
                >
                  <MapPinOff className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                  {busyId === editingMarker.id ? "Working…" : "Mark unplaced"}
                </Button>
              )}
              {editingMarker && (
                <Button type="button" variant="outline" onClick={() => startDuplicate(editingMarker)}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                  Duplicate
                </Button>
              )}
              {editingMarker && (
                <Button type="button" variant="outline" onClick={() => setDeleteTarget(editingMarker)}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}

        {unplaced.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> Not yet on the plan
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {unplaced.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onRequestPlace(m.id, m.label)}
                  className="border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:border-foreground hover:text-foreground"
                  title={`Place ${m.label} on the plan`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the{" "}
              {deleteTarget ? kindLabel(deleteTarget.marker_type).toLowerCase() : "device"} from{" "}
              {floor.display_name} together with any cable routes drawn to it. The deletion is
              recorded in the project activity log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep device</AlertDialogCancel>
            <AlertDialogAction onClick={remove} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete device"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeviceManager;
