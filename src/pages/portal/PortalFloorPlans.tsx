import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  Info,
  Layers,
  Lock,
  MessageSquare,
  Move,
  Radio,
  Search,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePortal } from "@/hooks/usePortal";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  PageHeader,
  Panel,
  EmptyState,
  Loading,
  ErrorNote,
  NoProject,
} from "@/components/portal/ui";
import FloorPlanCanvas, { type CoverageMode } from "@/components/portal/FloorPlanCanvas";
import { COVERAGE_BANDS, COVERAGE_DISCLAIMER } from "@/lib/planGeometry";
import { DOCUMENTS_BUCKET, signedUrl, formatDate } from "@/lib/portalFiles";
import {
  CAMERA_RANGES,
  FOV_PRESETS,
  MARKER_KINDS,
  SURVEY_DISCLAIMER,
  kindLabel,
  kindShort,
  markerStats,
  stateLabel,
  type CameraRange,
  type FloorMarker,
  type MarkerKind,
  type PortalFloor,
} from "@/lib/floorPlans";

type CameraDraft = {
  id: string;
  x: number;
  y: number;
  direction_deg: number;
  fov_deg: number;
  coverage_range: CameraRange;
};

type Optics = { direction_deg: number; fov_deg: number; coverage_range: CameraRange };



const LAYERS: { kind: MarkerKind; label: string }[] = [
  { kind: "wifi_ap", label: "Wi-Fi Access Points" },
  { kind: "camera", label: "CCTV Cameras" },
  { kind: "rack", label: "Racks" },
  { kind: "cable_route", label: "Cable Routes" },
];

const COVERAGE_OPTIONS: { value: CoverageMode; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "selected", label: "Selected device" },
  { value: "all", label: "All on this level" },
];

const Metric: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="border border-border p-4">
    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
    <p className="mt-2 font-display text-2xl font-light tracking-tight">{value}</p>
  </div>
);

const PortalFloorPlans: React.FC = () => {
  const { activeProject, clientUser, loading: portalLoading } = usePortal();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [floors, setFloors] = useState<PortalFloor[]>([]);
  const [markers, setMarkers] = useState<FloorMarker[]>([]);
  const [floorId, setFloorId] = useState("");
  const [planUrl, setPlanUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState<Record<MarkerKind, boolean>>({
    wifi_ap: true,
    camera: true,
    rack: true,
    cable_route: true,
    other: true,
  });
  const [selected, setSelected] = useState<FloorMarker | null>(null);
  const [query, setQuery] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, { x: number; y: number }>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coverage, setCoverage] = useState<CoverageMode>("off");
  const [placingCams, setPlacingCams] = useState(false);
  const [camDrafts, setCamDrafts] = useState<CameraDraft[]>([]);
  const [optics, setOptics] = useState<Record<string, Optics>>({});
  const [camConfirmOpen, setCamConfirmOpen] = useState(false);
  const [savingCams, setSavingCams] = useState(false);


  // Selecting a device defaults the coverage view to that device only.
  useEffect(() => {
    if (selected) setCoverage((c) => (c === "off" ? "selected" : c));
  }, [selected]);


  useEffect(() => {
    document.title = "Building floor plans | Siyakha Client Portal";
  }, []);

  const load = useCallback(async () => {
    if (!activeProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const [{ data: floorRows, error: fErr }, { data: markerRows, error: mErr }] = await Promise.all([
      supabase
        .from("portal_floors")
        .select("*")
        .eq("project_id", activeProject.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("portal_floor_markers")
        .select("*")
        .eq("project_id", activeProject.id)
        .order("sort_order", { ascending: true }),
    ]);
    if (fErr || mErr) setError((fErr ?? mErr)?.message ?? "Unable to load plans");
    const list = (floorRows ?? []) as unknown as PortalFloor[];
    setFloors(list);
    setFloorId((prev) => (prev && list.some((f) => f.id === prev) ? prev : list[0]?.id ?? ""));
    setMarkers((markerRows ?? []) as unknown as FloorMarker[]);
    setLoading(false);
  }, [activeProject]);

  useEffect(() => {
    load();
  }, [load]);

  const floor = useMemo(() => floors.find((f) => f.id === floorId) ?? null, [floors, floorId]);
  const floorMarkers = useMemo(() => markers.filter((m) => m.floor_id === floorId), [markers, floorId]);
  const draftCameras = useMemo<FloorMarker[]>(
    () =>
      camDrafts.map((c, i) => ({
        id: c.id,
        floor_id: floorId,
        project_id: activeProject?.id ?? "",
        marker_type: "camera" as MarkerKind,
        x_norm: c.x,
        y_norm: c.y,
        label: `New camera ${i + 1}`,
        equipment: null,
        model: null,
        status: "planned",
        client_visible: true,
        description: null,
        notes: null,
        installed_on: null,
        tested_on: null,
        serial_number: null,
        mac_address: null,
        evidence_path: null,
        evidence_note: null,
        sort_order: 9000 + i,
        direction_deg: c.direction_deg,
        fov_deg: c.fov_deg,
        coverage_range: c.coverage_range,
      })),
    [camDrafts, floorId, activeProject?.id],
  );

  const shown = useMemo(() => {
    const base = floorMarkers.filter((m) => visible[m.marker_type]).map((m) => {
      const o = optics[m.id];
      const p = draft[m.id];
      if (!o && !p) return m;
      return { ...m, ...(p ? { x_norm: p.x, y_norm: p.y } : {}), ...(o ?? {}) };
    });
    return visible.camera ? [...base, ...draftCameras] : base;
  }, [floorMarkers, visible, draft, optics, draftCameras]);

  const canDrag = useCallback(
    (m: FloorMarker) => m.status === "planned" && (editing || m.id.startsWith("draft-")),
    [editing],
  );

  const pendingIds = useMemo(
    () => Array.from(new Set([...Object.keys(draft), ...Object.keys(optics)])),
    [draft, optics],
  );
  const pendingSummary = useMemo(() => {
    const list = markers.filter((m) => draft[m.id] || optics[m.id]);
    return {
      total: list.length,
      aps: list.filter((m) => m.marker_type === "wifi_ap").length,
      cameras: list.filter((m) => m.marker_type === "camera").length,
      other: list.filter((m) => m.marker_type !== "wifi_ap" && m.marker_type !== "camera").length,
    };
  }, [markers, draft, optics]);

  const opticsOf = useCallback(
    (m: FloorMarker): Optics =>
      optics[m.id] ?? {
        direction_deg: Number(m.direction_deg ?? 0),
        fov_deg: Number(m.fov_deg ?? 90),
        coverage_range: (m.coverage_range ?? "medium") as CameraRange,
      },
    [optics],
  );

  const handleDrag = useCallback((id: string, x: number, y: number) => {
    if (id.startsWith("draft-")) {
      setCamDrafts((list) => list.map((c) => (c.id === id ? { ...c, x, y } : c)));
      return;
    }
    setDraft((d) => ({ ...d, [id]: { x, y } }));
  }, []);

  /** Aim a camera: drafts update in place, saved planned cameras become optics drafts. */
  const handleAim = useCallback(
    (id: string, deg: number) => {
      if (id.startsWith("draft-")) {
        setCamDrafts((list) => list.map((c) => (c.id === id ? { ...c, direction_deg: deg } : c)));
        return;
      }
      const m = markers.find((x) => x.id === id);
      if (!m || m.status !== "planned") return;
      setOptics((o) => ({ ...o, [id]: { ...opticsOf(m), ...o[id], direction_deg: deg } }));
    },
    [markers, opticsOf],
  );

  const setSelectedOptics = useCallback(
    (patch: Partial<Optics>) => {
      if (!selected) return;
      if (selected.id.startsWith("draft-")) {
        setCamDrafts((list) => list.map((c) => (c.id === selected.id ? { ...c, ...patch } : c)));
        return;
      }
      if (selected.status !== "planned") return;
      setOptics((o) => ({ ...o, [selected.id]: { ...opticsOf(selected), ...o[selected.id], ...patch } }));
    },
    [selected, opticsOf],
  );

  const placeCamera = useCallback((x: number, y: number) => {
    setCamDrafts((list) => [
      ...list,
      {
        id: `draft-${Date.now()}-${list.length}`,
        x,
        y,
        direction_deg: 0,
        fov_deg: 90,
        coverage_range: "medium",
      },
    ]);
  }, []);

  const removeDraftCamera = useCallback((id: string) => {
    setCamDrafts((list) => list.filter((c) => c.id !== id));
    setSelected((s) => (s?.id === id ? null : s));
  }, []);

  const cancelCameras = useCallback(() => {
    setCamDrafts([]);
    setPlacingCams(false);
    setSelected((s) => (s?.id.startsWith("draft-") ? null : s));
  }, []);

  const saveCameras = useCallback(async () => {
    if (!floor || camDrafts.length === 0) return;
    setSavingCams(true);
    const { data, error: rpcErr } = await supabase.rpc("portal_add_floor_cameras", {
      _floor_id: floor.id,
      _cameras: camDrafts.map((c) => ({
        x: c.x,
        y: c.y,
        direction_deg: c.direction_deg,
        fov_deg: c.fov_deg,
        coverage_range: c.coverage_range,
      })) as unknown as never,
    });
    setSavingCams(false);
    setCamConfirmOpen(false);
    if (rpcErr) {
      toast({ title: "Cameras not saved", description: rpcErr.message, variant: "destructive" });
      return;
    }
    setCamDrafts([]);
    setPlacingCams(false);
    setSelected(null);
    await load();
    toast({
      title: "Cameras added",
      description: `${data ?? 0} planned camera${data === 1 ? "" : "s"} created on ${floor.display_name} and recorded in the audit trail.`,
    });
  }, [camDrafts, floor, load, toast]);

  const cancelChanges = useCallback(() => {
    setDraft({});
    setOptics({});
    setEditing(false);
  }, []);

  const savePositions = useCallback(async () => {
    setSaving(true);
    const moves = Object.entries(draft).map(([id, p]) => ({ id, x: p.x, y: p.y }));
    const opticUpdates = Object.entries(optics).map(([id, o]) => ({ id, ...o }));
    const { data, error: rpcErr } = moves.length
      ? await supabase.rpc("portal_move_floor_markers", { _moves: moves as unknown as never })
      : { data: 0, error: null };
    const { error: oErr } = opticUpdates.length
      ? await supabase.rpc("portal_update_camera_optics", {
          _updates: opticUpdates as unknown as never,
        })
      : { error: null };
    setSaving(false);
    setConfirmOpen(false);
    if (rpcErr || oErr) {
      toast({
        title: "Changes not saved",
        description: (rpcErr ?? oErr)?.message ?? "Unknown error",
        variant: "destructive",
      });
      return;
    }
    setDraft({});
    setOptics({});
    setEditing(false);
    await load();
    toast({
      title: "Changes saved",
      description: `${data ?? 0} position${data === 1 ? "" : "s"} and ${opticUpdates.length} camera setting${opticUpdates.length === 1 ? "" : "s"} updated and recorded in the audit trail.`,
    });

  }, [draft, optics, load, toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shown;
    return shown.filter((m) =>
      [m.label, m.equipment, m.model, kindLabel(m.marker_type), m.serial_number, m.notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [shown, query]);

  const floorStats = useMemo(() => markerStats(floorMarkers), [floorMarkers]);
  const buildingStats = useMemo(() => markerStats(markers), [markers]);

  useEffect(() => {
    let cancelled = false;
    setPlanUrl(null);
    setSelected(null);
    if (!floor?.plan_image_path) return;
    signedUrl(DOCUMENTS_BUCKET, floor.plan_image_path, 600)
      .then((url) => {
        if (!cancelled) setPlanUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPlanUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [floor?.id, floor?.plan_image_path]);

  const submitComment = async () => {
    if (!floor || !comment.trim() || !user) return;
    setSending(true);
    const { error: cErr } = await supabase.from("portal_floor_marker_comments").insert({
      floor_id: floor.id,
      marker_id: selected?.id ?? null,
      author_user_id: user.id,
      author_name: clientUser?.full_name ?? user.email ?? null,
      author_type: "client",
      body: comment.trim(),
    });
    setSending(false);
    if (cErr) {
      toast({ title: "Comment not sent", description: cErr.message, variant: "destructive" });
      return;
    }
    setComment("");
    toast({
      title: "Comment sent",
      description: "The Siyakha project team will respond in the portal.",
    });
  };

  if (portalLoading || loading) return <Loading label="Loading building plans…" />;
  if (!activeProject) return <NoProject />;

  return (
    <div>
      <PageHeader
        eyebrow="Virtual building plans"
        title="Building floor plans & device placement"
        description={`Level 0 through Level 11 for ${activeProject.title}. ${SURVEY_DISCLAIMER}`}
      />

      {error && (
        <div className="mb-6">
          <ErrorNote message={error} />
        </div>
      )}

      <div className="border border-foreground/30 bg-muted/40 px-4 py-3 mb-8 flex items-start gap-3">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground">{SURVEY_DISCLAIMER}</span> Access point counts and
          positions shown are preliminary placeholders for planning only and will be confirmed after
          the final site survey, RF testing and your approval.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Metric label="Planned APs (building)" value={buildingStats.planned} />
        <Metric label="Installed" value={buildingStats.installed} />
        <Metric label="Tested / active" value={buildingStats.testedActive} />
        <Metric label="Planned cameras" value={buildingStats.cameras} />
      </div>

      {floors.length === 0 ? (
        <EmptyState
          title="Floor plans not shared yet"
          description="Your Siyakha project team will publish the building levels and device placement here."
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[220px,1fr]">
          {/* Floor selector */}
          <div className="border border-border">
            <p className="px-4 py-3 border-b border-border text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Levels
            </p>
            <div className="max-h-[320px] lg:max-h-none overflow-y-auto">
              {floors.map((f) => {
                const count = markers.filter((m) => m.floor_id === f.id).length;
                const active = f.id === floorId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFloorId(f.id)}
                    className={[
                      "w-full text-left px-4 py-3 border-b border-border last:border-b-0 transition-colors",
                      active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60",
                    ].join(" ")}
                  >
                    <span className="block text-[11px] uppercase tracking-[0.18em]">
                      Level {f.level_number}
                    </span>
                    <span className="block text-xs mt-1">{count} devices</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <Panel title={floor?.display_name ?? "Level"}>
              {/* Layer toggles */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground mr-1">
                  <Layers className="h-3.5 w-3.5" strokeWidth={1.5} /> Layers
                </span>
                {LAYERS.map(({ kind, label }) => {
                  const on = visible[kind];
                  const n = floorMarkers.filter((m) => m.marker_type === kind).length;
                  return (
                    <button
                      key={kind}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setVisible((v) => ({ ...v, [kind]: !v[kind] }))}
                      className={[
                        "border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors",
                        on
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground",
                      ].join(" ")}
                    >
                      {label} ({n})
                    </button>
                  );
                })}
              </div>

              {/* Reposition controls */}
              <div className="mb-5 border border-border p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <Move className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {editing ? (
                      <>
                        <span className="text-foreground">
                          Drag planned devices to their proposed positions. Save when the layout is
                          ready.
                        </span>{" "}
                        Devices that are installed, tested or active are locked and cannot be moved.
                      </>
                    ) : (
                      <>
                        Positions are preliminary. Turn on edit mode to drag planned devices to the
                        exact positions you want.
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {editing ? (
                    <>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {pendingIds.length} unsaved
                      </span>
                      <Button type="button" variant="outline" onClick={cancelChanges}>
                        Cancel changes
                      </Button>
                      <Button
                        type="button"
                        disabled={pendingIds.length === 0 || saving}
                        onClick={() => setConfirmOpen(true)}
                      >
                        Save positions
                      </Button>
                    </>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => setEditing(true)}>
                      <Move className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
                      Edit positions
                    </Button>
                  )}
                </div>
              </div>

              {/* CCTV placement */}
              <div className="mb-5 border border-border p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <Camera className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {placingCams ? (
                      <span className="text-foreground">
                        Click the plan where each camera should be installed. Select a camera to
                        adjust its direction and coverage.
                      </span>
                    ) : (
                      <>
                        Add proposed CCTV positions yourself. Cameras stay unsaved until you confirm
                        them, and remain movable while their status is Planned.
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {placingCams ? (
                    <>
                      <span className="border border-[hsl(32_100%_50%)] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[hsl(32_100%_38%)]">
                        {camDrafts.length} unsaved camera{camDrafts.length === 1 ? "" : "s"}
                      </span>
                      <Button
                        type="button"
                        disabled={camDrafts.length === 0 || savingCams}
                        onClick={() => setCamConfirmOpen(true)}
                      >
                        Save cameras
                      </Button>
                      <Button type="button" variant="outline" onClick={cancelCameras}>
                        Cancel additions
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setPlacingCams(false)}>
                        Done placing
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setPlacingCams(true);
                        setEditing(false);
                        setCoverage((c) => (c === "off" ? "all" : c));
                      }}
                    >
                      <Camera className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
                      Place CCTV cameras
                    </Button>
                  )}
                </div>
              </div>



              {/* Coverage layer */}
              <div className="mb-5 border border-border p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground mr-1">
                    <Radio className="h-3.5 w-3.5" strokeWidth={1.5} /> Coverage
                  </span>
                  {COVERAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={coverage === opt.value}
                      onClick={() => setCoverage(opt.value)}
                      className={[
                        "border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors",
                        coverage === opt.value
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {coverage !== "off" && (
                  <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {COVERAGE_BANDS.map((b, i) => (
                      <span key={b.key} className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full border"
                          style={{
                            background: `hsl(190 100% 45% / ${[0.34, 0.2, 0.1][i]})`,
                            borderColor: "hsl(190 100% 45% / 0.5)",
                          }}
                        />
                        {b.label}
                      </span>
                    ))}
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3"
                        style={{
                          background: "hsl(32 100% 50% / 0.3)",
                          border: "1px solid hsl(32 100% 50% / 0.6)",
                        }}
                      />
                      CCTV field of view
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {COVERAGE_DISCLAIMER}
                </p>
              </div>

              <FloorPlanCanvas
                imageUrl={planUrl}
                markers={shown}
                selectedId={selected?.id ?? null}
                onSelect={setSelected}
                editing={editing}
                placing={placingCams}
                unsavedIds={camDrafts.map((c) => c.id)}
                canDrag={canDrag}
                coverage={coverage}
                onMove={handleDrag}
                onMoveEnd={undefined}
                onAim={handleAim}
                onPlace={placingCams ? placeCamera : undefined}
                emptyLabel="Plan image for this level is being prepared."
              />




              {/* Legend */}
              <div className="mt-5 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {MARKER_KINDS.filter((k) => k.value !== "other").map((k) => (
                  <span key={k.value} className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center border border-foreground/70 text-[7px] ${
                        k.value === "camera" ? "" : "rounded-full"
                      }`}
                    >
                      {k.short}
                    </span>
                    {k.label}
                  </span>
                ))}
                <span className="flex items-center gap-2">
                  <span className="inline-block h-5 w-5 rounded-full border border-dashed border-foreground/70" />
                  Planned / not installed

                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-5 w-5 rounded-full border border-foreground" />
                  Installed / tested
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-foreground/70">
                    <Lock className="h-3 w-3" strokeWidth={2} />
                  </span>
                  Locked — cannot be moved
                </span>
              </div>


              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                <Metric label="Devices on level" value={floorStats.total} />
                <Metric label="Planned" value={floorStats.planned} />
                <Metric label="Installed" value={floorStats.installed} />
                <Metric label="Tested / active" value={floorStats.testedActive} />
              </div>
            </Panel>

            {/* Selected marker detail */}
            {selected && (
              <Panel title="Device detail">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-xl font-light tracking-tight">{selected.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {kindLabel(selected.marker_type)} · {stateLabel(selected.status)}
                    </p>
                  </div>
                  <span className="border border-border px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {kindShort(selected.marker_type)}
                  </span>
                </div>
                <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 text-sm">
                  {[
                    ["Equipment", selected.equipment],
                    ["Model", selected.model],
                    ["Serial", selected.serial_number],
                    ["MAC", selected.mac_address],
                    ["Installed", selected.installed_on ? formatDate(selected.installed_on) : null],
                    ["Tested", selected.tested_on ? formatDate(selected.tested_on) : null],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between gap-4 border-b border-border pb-2">
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{k}</dt>
                      <dd className="text-right">{v || "TBC"}</dd>
                    </div>
                  ))}
                </dl>

                {/* Camera optics — editable while the camera is planned or an unsaved draft */}
                {selected.marker_type === "camera" && (() => {
                  const live = shown.find((m) => m.id === selected.id) ?? selected;
                  const o = opticsOf(live);
                  const isDraft = selected.id.startsWith("draft-");
                  const editableOptics = isDraft || selected.status === "planned";
                  return (
                    <div className="mt-6 border border-border p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          Camera direction & coverage
                        </p>
                        {isDraft && (
                          <button
                            type="button"
                            onClick={() => removeDraftCamera(selected.id)}
                            className="flex items-center gap-2 border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-colors"
                          >
                            <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                            Remove
                          </button>
                        )}
                      </div>

                      {editableOptics ? (
                        <>
                          <div>
                            <label
                              htmlFor="cam-dir"
                              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                            >
                              Direction · {o.direction_deg}°
                            </label>
                            <input
                              id="cam-dir"
                              type="range"
                              min={0}
                              max={359}
                              value={o.direction_deg}
                              onChange={(e) =>
                                setSelectedOptics({ direction_deg: Number(e.target.value) })
                              }
                              className="mt-2 w-full accent-foreground"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">
                              0° points to the top of the plan. You can also drag the aim handle on
                              the selected camera.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {FOV_PRESETS.map((f) => (
                              <button
                                key={f.value}
                                type="button"
                                onClick={() => setSelectedOptics({ fov_deg: f.value })}
                                className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                                  o.fov_deg === f.value
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border hover:bg-muted"
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {CAMERA_RANGES.map((r) => (
                              <button
                                key={r.value}
                                type="button"
                                onClick={() => setSelectedOptics({ coverage_range: r.value })}
                                className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                                  o.coverage_range === r.value
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border hover:bg-muted"
                                }`}
                              >
                                {r.label} range
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Aim {o.direction_deg}° · {o.fov_deg}° field of view · {o.coverage_range}{" "}
                          range. This camera is {stateLabel(selected.status).toLowerCase()}, so its
                          position and optics are locked.
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {COVERAGE_DISCLAIMER}
                      </p>
                    </div>
                  );
                })()}

                {selected.description && (
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {selected.description}
                  </p>
                )}
                <div className="mt-6 border-t border-border pt-5">
                  <label
                    htmlFor="marker-comment"
                    className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3"
                  >
                    <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Comment or query on {selected.label}
                  </label>
                  <Textarea
                    id="marker-comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. please confirm coverage in the corner bedrooms on this level."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    disabled={sending || !comment.trim()}
                    onClick={submitComment}
                  >
                    {sending ? "Sending…" : "Send comment"}
                  </Button>
                </div>
              </Panel>
            )}

            {/* Schedule */}
            <Panel title="Device schedule">
              <div className="flex items-center gap-3 mb-5 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search label, model or serial"
                  aria-label="Search devices on this level"
                />
              </div>
              {floorMarkers.length === 0 ? (
                <EmptyState
                  title="No devices allocated to this level yet"
                  description="Device placement for this level will appear once Siyakha publishes it."
                />
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground">No devices match your search.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        <th className="text-left py-3 pr-4">Label</th>
                        <th className="text-left py-3 pr-4">Type</th>
                        <th className="text-left py-3 pr-4">Equipment</th>
                        <th className="text-left py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((m) => (
                        <tr
                          key={m.id}
                          className="border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                          onClick={() => setSelected(m)}
                        >
                          <td className="py-3 pr-4">{m.label}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{kindLabel(m.marker_type)}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {m.equipment ?? m.model ?? "TBC"}
                          </td>
                          <td className="py-3 text-muted-foreground">{stateLabel(m.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            {floorStats.cameras === 0 && (
              <div className="border border-dashed border-border p-6 flex items-start gap-3">
                <Wifi className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="text-foreground">CCTV layout awaiting design.</span> No camera
                  positions have been issued for this level yet. Surveillance placement will be added
                  once the security design is agreed.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save device positions?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingSummary.aps} Wi-Fi access point{pendingSummary.aps === 1 ? "" : "s"} and{" "}
              {pendingSummary.cameras} camera{pendingSummary.cameras === 1 ? "" : "s"}
              {pendingSummary.other > 0 ? ` and ${pendingSummary.other} other device(s)` : ""} will
              move to their new positions. Every move is recorded in the project audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                savePositions();
              }}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save positions"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

};

export default PortalFloorPlans;
