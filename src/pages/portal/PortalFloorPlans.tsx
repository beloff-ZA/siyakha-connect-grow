import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  Cable,
  Download,
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
import FloorPlanCanvas, {
  type CanvasRoute,
  type CoverageMode,
} from "@/components/portal/FloorPlanCanvas";
import {
  CABLE_LENGTH_PENDING,
  CABLE_ROUTE_DISCLAIMER,
  ROUTE_DISPLAY_OPTIONS,
  ROUTE_LEGEND,
  downloadCsv,
  insertWaypoint,
  parseWaypoints,
  removeWaypoint,
  routeColor,
  routeStats,
  routesToCsv,
  serviceLabel,
  snapOrthogonal,
  type CableRoute,
  type RouteDisplayMode,
  type Waypoint,
} from "@/lib/cableRoutes";
import {
  COVERAGE_BANDS,
  COVERAGE_DISCLAIMER,
  bearingText,
  cardinalLabel,
  normalizeBearing,
} from "@/lib/planGeometry";
import { DOCUMENTS_BUCKET, signedUrl, formatDate } from "@/lib/portalFiles";
import {
  CAMERA_RANGES,
  FOV_PRESETS,
  MARKER_KINDS,
  RACK_MOVE_HINT,
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
  const [lastDir, setLastDir] = useState(0);

  // ---- Cable routing -------------------------------------------------------
  const [routes, setRoutes] = useState<CableRoute[]>([]);
  const [routeMode, setRouteMode] = useState<RouteDisplayMode>("all");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [editingRoutes, setEditingRoutes] = useState(false);
  const [routeDraft, setRouteDraft] = useState<Record<string, Waypoint[]>>({});
  const [snap, setSnap] = useState(true);
  const [savingRoutes, setSavingRoutes] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [routeFloorFilter, setRouteFloorFilter] = useState<string>("all");
  const [routeServiceFilter, setRouteServiceFilter] = useState<string>("all");
  const [routeStatusFilter, setRouteStatusFilter] = useState<string>("all");



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
    const [
      { data: floorRows, error: fErr },
      { data: markerRows, error: mErr },
      { data: routeRows, error: rErr },
    ] = await Promise.all([
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
      supabase
        .from("portal_cable_routes")
        .select("*")
        .eq("project_id", activeProject.id)
        .order("route_label", { ascending: true }),
    ]);
    if (fErr || mErr || rErr) setError((fErr ?? mErr ?? rErr)?.message ?? "Unable to load plans");
    const list = (floorRows ?? []) as unknown as PortalFloor[];
    setFloors(list);
    setFloorId((prev) => (prev && list.some((f) => f.id === prev) ? prev : list[0]?.id ?? ""));
    setMarkers((markerRows ?? []) as unknown as FloorMarker[]);
    setRoutes(
      (routeRows ?? []).map((r) => ({
        ...(r as unknown as CableRoute),
        waypoints: parseWaypoints((r as { waypoints?: unknown }).waypoints),
      })),
    );
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
      racks: list.filter((m) => m.marker_type === "rack").length,
      other: list.filter(
        (m) => !["wifi_ap", "camera", "rack"].includes(m.marker_type),
      ).length,
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
        setLastDir(normalizeBearing(deg));
        setCamDrafts((list) =>
          list.map((c) => (c.id === id ? { ...c, direction_deg: normalizeBearing(deg) } : c)),
        );
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

  const placeCamera = useCallback(
    (x: number, y: number, direction?: number) => {
      // A drag supplies the aimed bearing; a plain tap reuses the last-used direction.
      const dir = normalizeBearing(direction ?? lastDir);
      const draft: CameraDraft = {
        id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        x,
        y,
        direction_deg: dir,
        fov_deg: 90,
        coverage_range: "medium",
      };
      setLastDir(dir);
      setCamDrafts((list) => [...list, draft]);
      // Select immediately so the aim handle and cone are visible before saving.
      setSelected({
        id: draft.id,
        floor_id: floorId,
        project_id: activeProject?.id ?? "",
        marker_type: "camera",
        x_norm: x,
        y_norm: y,
        label: "New camera",
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
        sort_order: 9999,
        direction_deg: dir,
        fov_deg: 90,
        coverage_range: "medium",
      });
      setCoverage((c) => (c === "off" ? "all" : c));
    },
    [lastDir, floorId, activeProject?.id],
  );

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
    // Newly saved cameras have no cabling yet — offer to add only the missing routes.
    if ((data ?? 0) > 0) setGenOpen(true);
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

  // ---- Cable route derivation ---------------------------------------------
  /** Live marker positions, including unsaved position drafts. */
  const positionOf = useCallback(
    (id: string): Waypoint | null => {
      const m = markers.find((x) => x.id === id);
      if (!m) return null;
      const d = draft[id];
      return d ? { x: d.x, y: d.y } : { x: Number(m.x_norm), y: Number(m.y_norm) };
    },
    [markers, draft],
  );

  const routeById = useMemo(
    () => new Map(routes.map((r) => [r.id, r] as const)),
    [routes],
  );
  const markerById = useMemo(() => new Map(markers.map((m) => [m.id, m] as const)), [markers]);
  const floorById = useMemo(() => new Map(floors.map((f) => [f.id, f] as const)), [floors]);

  const floorRoutes = useMemo(() => routes.filter((r) => r.floor_id === floorId), [routes, floorId]);
  const buildingRouteStats = useMemo(() => routeStats(routes), [routes]);
  const floorRouteStats = useMemo(() => routeStats(floorRoutes), [floorRoutes]);

  /** Waypoints currently displayed for a route — local draft wins. */
  const waypointsOf = useCallback(
    (r: CableRoute) => routeDraft[r.id] ?? r.waypoints,
    [routeDraft],
  );

  const canvasRoutes = useMemo<CanvasRoute[]>(() => {
    if (!visible.cable_route || routeMode === "off") return [];
    const list =
      routeMode === "selected"
        ? floorRoutes.filter((r) => r.id === selectedRouteId)
        : floorRoutes;
    return list.flatMap((r) => {
      const from = positionOf(r.rack_marker_id);
      const to = positionOf(r.device_marker_id);
      if (!from || !to) return [];
      return [
        {
          id: r.id,
          service_type: r.service_type,
          from,
          to,
          waypoints: waypointsOf(r),
          editable: r.status === "planned",
        },
      ];
    });
  }, [visible.cable_route, routeMode, floorRoutes, selectedRouteId, positionOf, waypointsOf]);

  const selectedRoute = selectedRouteId ? routeById.get(selectedRouteId) ?? null : null;
  const pendingRouteIds = useMemo(() => Object.keys(routeDraft), [routeDraft]);

  const moveWaypoint = useCallback(
    (routeId: string, index: number, x: number, y: number) => {
      const r = routeById.get(routeId);
      if (!r || r.status !== "planned") return;
      const current = routeDraft[routeId] ?? r.waypoints;
      const from = positionOf(r.rack_marker_id);
      const to = positionOf(r.device_marker_id);
      const path = [from ?? { x, y }, ...current, to ?? { x, y }];
      const next = [...current];
      next[index] = snap
        ? snapOrthogonal({ x, y }, path[index], path[index + 2], {
            width: 1000,
            height: 1000,
          })
        : { x, y };
      setRouteDraft((d) => ({ ...d, [routeId]: next }));
    },
    [routeById, routeDraft, positionOf, snap],
  );

  const addWaypoint = useCallback(
    (routeId: string, segment: number, x: number, y: number) => {
      const r = routeById.get(routeId);
      if (!r || r.status !== "planned") return;
      const current = routeDraft[routeId] ?? r.waypoints;
      setRouteDraft((d) => ({ ...d, [routeId]: insertWaypoint(current, segment, { x, y }) }));
    },
    [routeById, routeDraft],
  );

  const dropWaypoint = useCallback(
    (routeId: string, index: number) => {
      const r = routeById.get(routeId);
      if (!r || r.status !== "planned") return;
      const current = routeDraft[routeId] ?? r.waypoints;
      setRouteDraft((d) => ({ ...d, [routeId]: removeWaypoint(current, index) }));
    },
    [routeById, routeDraft],
  );

  const cancelRouteEdits = useCallback(() => {
    setRouteDraft({});
    setEditingRoutes(false);
  }, []);

  const saveRouteEdits = useCallback(async () => {
    const entries = Object.entries(routeDraft);
    if (entries.length === 0) return;
    setSavingRoutes(true);
    let failed: string | null = null;
    for (const [routeId, wps] of entries) {
      const { error: wErr } = await supabase.rpc("portal_update_cable_route_waypoints", {
        _route_id: routeId,
        _waypoints: wps as unknown as never,
      });
      if (wErr) {
        failed = wErr.message;
        break;
      }
    }
    setSavingRoutes(false);
    if (failed) {
      toast({ title: "Cable routes not saved", description: failed, variant: "destructive" });
      return;
    }
    setRouteDraft({});
    setEditingRoutes(false);
    await load();
    toast({
      title: "Cable routes saved",
      description: `${entries.length} route${entries.length === 1 ? "" : "s"} updated and recorded in the audit trail.`,
    });
  }, [routeDraft, load, toast]);

  const generateRoutes = useCallback(async () => {
    if (!activeProject) return;
    setGenerating(true);
    const { data, error: gErr } = await supabase.rpc("portal_generate_missing_cable_routes", {
      _project_id: activeProject.id,
    });
    setGenerating(false);
    setGenOpen(false);
    if (gErr) {
      toast({ title: "Routes not generated", description: gErr.message, variant: "destructive" });
      return;
    }
    await load();
    toast({
      title: data ? "Cable routes generated" : "No missing routes",
      description: data
        ? `${data} preliminary Cat6 UTP route${data === 1 ? "" : "s"} added from each level's 6U rack to its unrouted devices.`
        : "Every Wi-Fi access point and camera on a rack-bearing level already has a cable route.",
    });
  }, [activeProject, load, toast]);

  const scheduleRows = useMemo(() => {
    return routes
      .filter((r) => (routeFloorFilter === "all" ? true : r.floor_id === routeFloorFilter))
      .filter((r) => (routeServiceFilter === "all" ? true : r.service_type === routeServiceFilter))
      .filter((r) => (routeStatusFilter === "all" ? true : r.status === routeStatusFilter))
      .map((r) => {
        const f = floorById.get(r.floor_id);
        return {
          id: r.id,
          label: r.route_label,
          floor: f?.display_name ?? "—",
          level: f?.level_number ?? 0,
          rack: markerById.get(r.rack_marker_id)?.label ?? "—",
          destination: markerById.get(r.device_marker_id)?.label ?? "—",
          service: serviceLabel(r.service_type),
          cable: r.cable_type,
          status: stateLabel(r.status),
          waypoints: waypointsOf(r).length,
        };
      })
      .sort((a, b) => a.level - b.level || a.label.localeCompare(b.label));
  }, [
    routes,
    routeFloorFilter,
    routeServiceFilter,
    routeStatusFilter,
    floorById,
    markerById,
    waypointsOf,
  ]);

  const exportSchedule = useCallback(() => {
    downloadCsv(
      `cable-route-schedule-${activeProject?.reference ?? "project"}.csv`,
      routesToCsv(scheduleRows),
    );
  }, [scheduleRows, activeProject?.reference]);

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
        <Metric label="Wi-Fi access points (building)" value={buildingStats.aps} />
        <Metric label="CCTV cameras (building)" value={buildingStats.cameras} />
        <Metric label="Network racks (building)" value={buildingStats.racks} />
        <Metric
          label="Devices (APs + CCTV + racks)"
          value={buildingStats.total}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Metric label="APs planned" value={buildingStats.plannedAps} />
        <Metric label="APs installed / tested" value={buildingStats.installedAps + buildingStats.testedActiveAps} />
        <Metric label="Cameras planned" value={buildingStats.plannedCameras} />
        <Metric
          label="Cameras installed / tested"
          value={buildingStats.installedCameras + buildingStats.testedActiveCameras}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Metric label="Racks planned" value={buildingStats.plannedRacks} />
        <Metric
          label="Racks installed / tested"
          value={buildingStats.installedRacks + buildingStats.testedActiveRacks}
        />
        <Metric label="Planned (all devices)" value={buildingStats.planned} />
        <Metric label="Installed (all devices)" value={buildingStats.installed} />
      </div>
      {/* Cable routes are cabling, not devices — always counted separately. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Metric label="Cable routes (building)" value={buildingRouteStats.total} />
        <Metric label="Cable routes to Wi-Fi APs" value={buildingRouteStats.wifi} />
        <Metric label="Cable routes to CCTV" value={buildingRouteStats.camera} />
        <Metric label="Cable routes planned" value={buildingRouteStats.planned} />
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
                const onFloor = markers.filter((m) => m.floor_id === f.id);
                const apCount = onFloor.filter((m) => m.marker_type === "wifi_ap").length;
                const camCount = onFloor.filter((m) => m.marker_type === "camera").length;
                const rackCount = onFloor.filter((m) => m.marker_type === "rack").length;
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
                    <span className="block text-xs mt-1">
                      {apCount} AP · {camCount} CCTV · {rackCount} rack
                      {rackCount === 1 ? "" : "s"}
                    </span>
                    <span className="block text-[10px] mt-0.5 text-muted-foreground">
                      {onFloor.length} devices ·{" "}
                      {routes.filter((r) => r.floor_id === f.id).length} cable routes
                    </span>


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
                        Click to place, then drag toward the area the camera must face.
                        Release to create the camera — you can re-aim it any time with the amber
                        handle or the direction slider.
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

              {/* Cable routing layer */}
              <div className="mb-5 border border-border p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground mr-1">
                    <Cable className="h-3.5 w-3.5" strokeWidth={1.5} /> Cable routes
                  </span>
                  {ROUTE_DISPLAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={routeMode === opt.value}
                      onClick={() => setRouteMode(opt.value)}
                      className={[
                        "border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors",
                        routeMode === opt.value
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {floorRouteStats.total} on this level
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {ROUTE_LEGEND.map((l) => (
                    <span key={l.service} className="flex items-center gap-2">
                      <span
                        className="inline-block h-0 w-6"
                        style={{
                          borderTop: `2px ${l.service === "camera" ? "dashed" : "solid"} ${routeColor(l.service)}`,
                        }}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {editingRoutes ? (
                    <>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {pendingRouteIds.length} route{pendingRouteIds.length === 1 ? "" : "s"} edited
                      </span>
                      <button
                        type="button"
                        aria-pressed={snap}
                        onClick={() => setSnap((s) => !s)}
                        className={[
                          "border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors",
                          snap
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground",
                        ].join(" ")}
                      >
                        90° snapping
                      </button>
                      <Button type="button" variant="outline" onClick={cancelRouteEdits}>
                        Cancel route edits
                      </Button>
                      <Button
                        type="button"
                        disabled={pendingRouteIds.length === 0 || savingRoutes}
                        onClick={saveRouteEdits}
                      >
                        {savingRoutes ? "Saving…" : "Save cable routes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingRoutes(true);
                          setEditing(false);
                          setPlacingCams(false);
                          setRouteMode((m) => (m === "off" ? "all" : m));
                        }}
                      >
                        <Cable className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
                        Edit cable routes
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setGenOpen(true)}>
                        Generate missing routes
                      </Button>
                    </>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {editingRoutes ? (
                    <>
                      <span className="text-foreground">
                        Select a route, press anywhere along it to add an intermediate waypoint, drag
                        a waypoint to reshape it and double-click a waypoint to remove it.
                      </span>{" "}
                      Route ends stay locked to the 6U rack and the device. {CABLE_ROUTE_DISCLAIMER}
                    </>
                  ) : (
                    CABLE_ROUTE_DISCLAIMER
                  )}
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
                routes={canvasRoutes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
                editingRoutes={editingRoutes}
                onMoveWaypoint={moveWaypoint}
                onAddWaypoint={addWaypoint}
                onRemoveWaypoint={dropWaypoint}
                emptyLabel="Plan image for this level is being prepared."
              />




              {/* Legend */}
              <div className="mt-5 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {MARKER_KINDS.filter((k) => k.value !== "other").map((k) => (
                  <span key={k.value} className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center border text-[7px] ${
                        k.value === "camera" || k.value === "rack" ? "" : "rounded-full"
                      } ${
                        k.value === "rack"
                          ? "border-[hsl(268_85%_58%)] bg-[hsl(268_85%_58%/0.16)] text-[hsl(268_85%_45%)]"
                          : "border-foreground/70"
                      }`}
                    >
                      {k.value === "rack" ? "6U" : k.short}
                    </span>
                    {k.value === "rack" ? "6U network racks" : k.label}
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


              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Wi-Fi access points on level" value={floorStats.aps} />
                <Metric label="CCTV cameras on level" value={floorStats.cameras} />
                <Metric label="Network racks on level" value={floorStats.racks} />
                <Metric label="Devices on level (APs + CCTV + racks)" value={floorStats.total} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Metric label="Planned (all devices)" value={floorStats.planned} />
                <Metric label="Installed (all devices)" value={floorStats.installed} />
                <Metric label="Tested / active (all devices)" value={floorStats.testedActive} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Metric label="Cable routes on level" value={floorRouteStats.total} />
                <Metric label="Routes to Wi-Fi APs" value={floorRouteStats.wifi} />
                <Metric label="Routes to CCTV" value={floorRouteStats.camera} />
              </div>
            </Panel>

            {/* Selected cable route detail */}
            {selectedRoute && (
              <Panel title="Cable route detail">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-xl font-light tracking-tight">
                      {selectedRoute.route_label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {serviceLabel(selectedRoute.service_type)} ·{" "}
                      {stateLabel(selectedRoute.status)}
                    </p>
                  </div>
                  <span
                    className="border px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      borderColor: routeColor(selectedRoute.service_type),
                      color: routeColor(selectedRoute.service_type),
                    }}
                  >
                    {selectedRoute.cable_type}
                  </span>
                </div>
                <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 text-sm">
                  {[
                    ["Source rack", markerById.get(selectedRoute.rack_marker_id)?.label ?? "—"],
                    ["Destination", markerById.get(selectedRoute.device_marker_id)?.label ?? "—"],
                    ["Destination type", serviceLabel(selectedRoute.service_type)],
                    ["Cable", selectedRoute.cable_type],
                    ["Status", stateLabel(selectedRoute.status)],
                    ["Floor", floorById.get(selectedRoute.floor_id)?.display_name ?? "—"],
                    ["Waypoints", String(waypointsOf(selectedRoute).length)],
                    ["Length", CABLE_LENGTH_PENDING],
                  ].map(([k, v]) => (
                    <div
                      key={String(k)}
                      className="flex justify-between gap-4 border-b border-border pb-2"
                    >
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {k}
                      </dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
                {editingRoutes && waypointsOf(selectedRoute).length > 0 && (
                  <ul className="mt-5 border border-border divide-y divide-border text-[11px]">
                    {waypointsOf(selectedRoute).map((w, i) => (
                      <li key={`${w.x}-${w.y}-${i}`} className="flex items-center justify-between px-3 py-2">
                        <span className="font-mono text-muted-foreground">
                          Waypoint {i + 1} · {w.x.toFixed(3)}, {w.y.toFixed(3)}
                        </span>
                        <button
                          type="button"
                          onClick={() => dropWaypoint(selectedRoute.id, i)}
                          className="flex items-center gap-2 border border-border px-2 py-1 uppercase tracking-[0.2em] hover:bg-muted transition-colors"
                        >
                          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  {selectedRoute.notes ?? CABLE_ROUTE_DISCLAIMER}
                </p>
              </Panel>
            )}


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

                {selected.marker_type === "rack" && (
                  <div className="mt-6 border border-[hsl(268_85%_58%)] bg-[hsl(268_85%_58%/0.08)] p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[hsl(268_85%_45%)]">
                      {selected.model ?? "6U"} network rack · {floor?.display_name ?? "Level"}
                    </p>
                    <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2 text-sm">
                      {[
                        ["Rack", selected.label],
                        ["Equipment", selected.equipment ?? "6U Wall-Mount Network Rack"],
                        ["Size", selected.model ?? "6U"],
                        ["Status", stateLabel(selected.status)],
                        ["Floor", floor?.display_name ?? "—"],
                      ].map(([k, v]) => (
                        <div key={String(k)} className="flex justify-between gap-4">
                          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {k}
                          </dt>
                          <dd className="text-right">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selected.notes ??
                        "Provisional placement — move to the approved rack location before final sign-off."}
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">
                      {selected.status === "planned"
                        ? RACK_MOVE_HINT
                        : `This rack is ${stateLabel(selected.status).toLowerCase()}, so its position is locked.`}
                    </p>
                  </div>
                )}



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
                              Direction · {bearingText(o.direction_deg)}
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
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                                <button
                                  key={deg}
                                  type="button"
                                  onClick={() => setSelectedOptics({ direction_deg: deg })}
                                  title={`Face ${deg}° ${cardinalLabel(deg)}`}
                                  className={`border px-2 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
                                    normalizeBearing(o.direction_deg) === deg
                                      ? "border-foreground bg-foreground text-background"
                                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                                  }`}
                                >
                                  {cardinalLabel(deg)}
                                </button>
                              ))}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              0° points to the top of the plan (N) and angles increase clockwise. You
                              can also drag the amber aim handle on the selected camera.
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
                          Aim {bearingText(o.direction_deg)} · {o.fov_deg}° field of view ·{" "}
                          {o.coverage_range}{" "}
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

            {/* Cable route schedule */}
            <Panel title="Cable route schedule">
              <div className="flex flex-wrap items-end gap-3 mb-5">
                <label className="block">
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Level
                  </span>
                  <select
                    value={routeFloorFilter}
                    onChange={(e) => setRouteFloorFilter(e.target.value)}
                    className="border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All levels</option>
                    {floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.display_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Service
                  </span>
                  <select
                    value={routeServiceFilter}
                    onChange={(e) => setRouteServiceFilter(e.target.value)}
                    className="border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All services</option>
                    <option value="wifi_ap">Wi-Fi access point</option>
                    <option value="camera">CCTV camera</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Status
                  </span>
                  <select
                    value={routeStatusFilter}
                    onChange={(e) => setRouteStatusFilter(e.target.value)}
                    className="border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All statuses</option>
                    <option value="planned">Planned</option>
                    <option value="installed">Installed</option>
                    <option value="tested">Tested</option>
                    <option value="active">Active</option>
                  </select>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={exportSchedule}
                  disabled={scheduleRows.length === 0}
                >
                  <Download className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
                  Export CSV
                </Button>
              </div>

              {scheduleRows.length === 0 ? (
                <EmptyState
                  title="No cable routes match these filters"
                  description="Cable routes run from each level's 6U rack to the Wi-Fi access points and cameras on that same level."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        <th className="text-left py-3 pr-4">Route</th>
                        <th className="text-left py-3 pr-4">Level</th>
                        <th className="text-left py-3 pr-4">Source rack</th>
                        <th className="text-left py-3 pr-4">Destination</th>
                        <th className="text-left py-3 pr-4">Service</th>
                        <th className="text-left py-3 pr-4">Cable</th>
                        <th className="text-left py-3 pr-4">Status</th>
                        <th className="text-left py-3">Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleRows.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            const route = routeById.get(r.id);
                            if (route) setFloorId(route.floor_id);
                            setSelectedRouteId(r.id);
                            setRouteMode((m) => (m === "off" ? "all" : m));
                          }}
                        >
                          <td className="py-3 pr-4 font-mono text-xs">{r.label}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{r.floor}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{r.rack}</td>
                          <td className="py-3 pr-4">{r.destination}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{r.service}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{r.cable}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{r.status}</td>
                          <td className="py-3 text-muted-foreground">{CABLE_LENGTH_PENDING}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
                {CABLE_ROUTE_DISCLAIMER}
              </p>
            </Panel>

            {floorStats.cameras === 0 && camDrafts.length === 0 && (
              <div className="border border-dashed border-border p-6 flex items-start gap-3">
                <Camera className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="text-foreground">No cameras placed on this level yet.</span> Use
                  “Place CCTV cameras” to click the plan wherever a camera should be installed, then
                  save your placements.
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
              {pendingSummary.racks > 0
                ? `, ${pendingSummary.racks} network rack${pendingSummary.racks === 1 ? "" : "s"}`
                : ""}
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

      <AlertDialog open={camConfirmOpen} onOpenChange={setCamConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add {camDrafts.length} planned camera{camDrafts.length === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {camDrafts.length} camera{camDrafts.length === 1 ? "" : "s"} will be created on{" "}
              {floor?.display_name ?? "this level"} with a Planned status, sequential labels, and the
              direction and coverage you selected. Every addition is recorded in the project audit
              trail. {SURVEY_DISCLAIMER}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="max-h-40 overflow-auto border border-border/60 divide-y divide-border/60 text-[11px]">
            {camDrafts.map((c, i) => (
              <li key={c.id} className="flex items-center justify-between px-3 py-1.5">
                <span className="font-mono">Camera {i + 1}</span>
                <span className="text-muted-foreground">
                  {bearingText(c.direction_deg)} · {c.fov_deg}° FOV · {c.coverage_range}
                </span>
              </li>
            ))}
          </ul>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={savingCams}>Keep placing</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                saveCameras();
              }}
              disabled={savingCams}
            >
              {savingCams ? "Saving…" : "Save cameras"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );

};

export default PortalFloorPlans;
