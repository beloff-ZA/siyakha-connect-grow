import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Building2, Layers, Network } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePortal } from "@/hooks/usePortal";
import {
  PageHeader,
  Panel,
  Loading,
  ErrorNote,
  NoProject,
  EmptyState,
} from "@/components/portal/ui";
import { DOCUMENTS_BUCKET, signedUrl } from "@/lib/portalFiles";
import { type FloorMarker, type PortalFloor } from "@/lib/floorPlans";
import { parseWaypoints, type CableRoute } from "@/lib/cableRoutes";
import { type RackEquipment } from "@/lib/rackEquipment";
import {
  ARCHITECTURAL_CAPTION,
  ELEVATION_SOURCE,
  OCCUPANCY_LABEL,
  ROOFTOP_HOLD,
  TYPICAL_PLAN_NOTE,
  floorUseLabel,
  levelCode,
  statusText,
  summariseBuilding,
  type ElevationSheet,
} from "@/lib/buildingView";
import BuildingStack, {
  DEFAULT_FILTERS,
  FILTER_OPTIONS,
  FloorChips,
  type StackFilters,
} from "@/components/portal/BuildingStack";
import BuildingElevations from "@/components/portal/BuildingElevations";
import BuildingRiser from "@/components/portal/BuildingRiser";
import AllFloorPlans from "@/components/portal/AllFloorPlans";
import { RackContents } from "@/components/portal/RackEquipment";
import la101 from "@/assets/353-anton-lembede-la-101-north-west-elevations.png.asset.json";
import la102 from "@/assets/353-anton-lembede-la-102-east-south-elevations.png.asset.json";

const SHEETS: ElevationSheet[] = [
  {
    id: "la-101",
    label: "North / West",
    drawing: "LA-101",
    url: la101.url,
    alt: "Architect's North and West elevations, drawing LA-101, Council Submission LTK 207_353 dated 12 August 2026",
  },
  {
    id: "la-102",
    label: "East / South",
    drawing: "LA-102",
    url: la102.url,
    alt: "Architect's East and South elevations, drawing LA-102, Council Submission LTK 207_353 dated 12 August 2026",
  },
];

type Mode = "stack" | "elevations" | "riser";

const MODES: { value: Mode; label: string; icon: typeof Layers }[] = [
  { value: "stack", label: "High-rise plans", icon: Building2 },
  { value: "elevations", label: "Architectural elevations", icon: Layers },
  { value: "riser", label: "Infrastructure section", icon: Network },
];

const Metric: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="border border-border p-4">
    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
    <p className="mt-2 font-display text-2xl font-light tracking-tight">{value}</p>
  </div>
);

/** Read-only "Building view" overview. Editing stays in the Floor plans module. */
const PortalBuildingView: React.FC = () => {
  const { activeProject, loading: portalLoading } = usePortal();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [floors, setFloors] = useState<PortalFloor[]>([]);
  const [markers, setMarkers] = useState<FloorMarker[]>([]);
  const [routes, setRoutes] = useState<CableRoute[]>([]);
  const [equipment, setEquipment] = useState<RackEquipment[]>([]);
  const [planUrls, setPlanUrls] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<Mode>("stack");
  const [filters, setFilters] = useState<StackFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Building view | Siyakha Client Portal";
  }, []);

  useEffect(() => {
    if (!activeProject) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const [f, m, r, e] = await Promise.all([
        supabase
          .from("portal_floors")
          .select("*")
          .eq("project_id", activeProject.id)
          .order("sort_order", { ascending: true }),
        supabase.from("portal_floor_markers").select("*").eq("project_id", activeProject.id),
        supabase.from("portal_cable_routes").select("*").eq("project_id", activeProject.id),
        supabase
          .from("portal_rack_equipment")
          .select("*")
          .eq("project_id", activeProject.id)
          .order("sort_order", { ascending: true }),
      ]);
      if (cancelled) return;
      const err = f.error ?? m.error ?? r.error ?? e.error;
      if (err) setError(err.message);
      const list = (f.data ?? []) as unknown as PortalFloor[];
      setFloors(list);
      setMarkers((m.data ?? []) as unknown as FloorMarker[]);
      setRoutes(
        (r.data ?? []).map((row) => ({
          ...(row as unknown as CableRoute),
          waypoints: parseWaypoints((row as { waypoints?: unknown }).waypoints),
        })),
      );
      setEquipment((e.data ?? []) as unknown as RackEquipment[]);
      setSelectedId((prev) => prev ?? list[0]?.id ?? null);
      setLoading(false);

      // Private signed URLs only — raw storage paths never reach the DOM.
      const entries = await Promise.all(
        list
          .filter((fl) => fl.plan_image_path)
          .map(async (fl) => {
            try {
              const url = await signedUrl(DOCUMENTS_BUCKET, fl.plan_image_path as string, 900);
              return [fl.id, url] as const;
            } catch {
              return null;
            }
          }),
      );
      if (cancelled) return;
      setPlanUrls(Object.fromEntries(entries.filter(Boolean) as [string, string][]));
    })();

    return () => {
      cancelled = true;
    };
  }, [activeProject]);

  const building = useMemo(
    () => summariseBuilding(floors, markers, routes, equipment),
    [floors, markers, routes, equipment],
  );
  const selected = useMemo(
    () => building.summaries.find((s) => s.floor.id === selectedId) ?? null,
    [building.summaries, selectedId],
  );

  const openPlan = useCallback(
    (floorId: string) => navigate(`/portal/floor-plans?floor=${encodeURIComponent(floorId)}`),
    [navigate],
  );

  if (portalLoading || loading) return <Loading label="Loading building view…" />;
  if (!activeProject) return <NoProject />;

  return (
    <div className="space-y-10 building-print-root">
      <PageHeader
        eyebrow="Building view"
        title={activeProject.title}
        description={`${OCCUPANCY_LABEL}. Read-only navigation across the whole tower — every count below is derived live from the current design. ${ARCHITECTURAL_CAPTION}`}
      />

      {error && <ErrorNote message={error} />}

      {floors.length === 0 ? (
        <EmptyState
          title="No floor plans published yet"
          description="Floor plans, device markers and rack equipment will appear here as soon as they are shared to your portal."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Occupied levels" value={building.occupiedLevels} />
            <Metric label="Wi-Fi access points" value={building.totals.aps} />
            <Metric label="CCTV cameras" value={building.totals.cameras} />
            <Metric label="Racks (levels 0–10)" value={building.totals.racks} />
            <Metric label="Cable routes" value={building.totals.routes} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Building view modes">
              {MODES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={mode === value}
                  onClick={() => setMode(value)}
                  className={[
                    "inline-flex items-center gap-2 border px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors",
                    mode === value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-muted",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {label}
                </button>
              ))}
            </div>
            <Link
              to="/portal/floor-plans"
              className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[10px] uppercase tracking-[0.18em] hover:bg-muted"
            >
              Interactive floor plans <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Layers
            </span>
            {FILTER_OPTIONS.map(({ key, label, tone }) => (
              <button
                key={key}
                type="button"
                aria-pressed={filters[key]}
                onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
                className="border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition-opacity"
                style={{
                  borderColor: filters[key] ? tone : "hsl(var(--border))",
                  color: filters[key] ? tone : "hsl(var(--muted-foreground))",
                  opacity: filters[key] ? 1 : 0.6,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "stack" && (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] print:block">
              <Panel title="High-rise · exploded plans">
                <BuildingStack
                  occupied={building.occupied}
                  rooftop={building.rooftop}
                  planUrls={planUrls}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  filters={filters}
                />
              </Panel>

              <Panel title="Selected level">
                {selected ? (
                  <div className="space-y-5">
                    <div>
                      <p className="font-display text-xl font-light tracking-tight">
                        {selected.floor.display_name}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {levelCode(selected.level)} · {floorUseLabel(selected.floor.floor_use)} ·{" "}
                        {statusText[selected.status]}
                      </p>
                    </div>

                    <div className="aspect-[4/3] w-full overflow-hidden border border-border bg-muted/30">
                      {planUrls[selected.floor.id] ? (
                        <img
                          src={planUrls[selected.floor.id]}
                          alt={`${selected.floor.display_name} plan preview`}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          Plan pending
                        </div>
                      )}
                    </div>

                    <FloorChips s={selected} filters={filters} />

                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        ["Wi-Fi APs", selected.aps],
                        ["CCTV cameras", selected.cameras],
                        ["Racks", selected.racks],
                        ["Cable routes", selected.routes],
                        [
                          "Routed ports",
                          selected.portCount
                            ? `${selected.portsUsed} / ${selected.portCount}`
                            : "—",
                        ],
                        ["Spare ports", selected.portCount ? selected.portsSpare : "—"],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="border border-border p-3">
                          <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            {label}
                          </dt>
                          <dd className="mt-1">{value}</dd>
                        </div>
                      ))}
                    </dl>

                    {selected.rackMarkers.map((rack) => (
                      <RackContents
                        key={rack.id}
                        rack={rack}
                        floor={selected.floor}
                        items={selected.equipment.filter((e) => e.rack_marker_id === rack.id)}
                        routes={routes}
                      />
                    ))}

                    {selected.isRooftop && (
                      <p className="border border-border p-3 text-xs text-muted-foreground leading-relaxed">
                        {ROOFTOP_HOLD}
                      </p>
                    )}

                    {selected.floor.notes && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {selected.floor.notes}
                      </p>
                    )}

                    {selected.floor.floor_use === "accommodation" && (
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {TYPICAL_PLAN_NOTE}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => openPlan(selected.floor.id)}
                      className="w-full border border-foreground px-4 py-3 text-[10px] uppercase tracking-[0.18em] hover:bg-foreground hover:text-background print:hidden"
                    >
                      Open interactive plan
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a level in the stack.</p>
                )}
              </Panel>
            </div>
          )}

          {mode === "elevations" && (
            <Panel title="Architectural elevations">
              <BuildingElevations
                sheets={SHEETS}
                levels={building.summaries}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onOpenPlan={openPlan}
              />
            </Panel>
          )}

          {mode === "riser" && (
            <Panel title="Infrastructure section · riser">
              <BuildingRiser
                occupied={building.occupied}
                rooftop={building.rooftop}
                equipment={equipment}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </Panel>
          )}

          <Panel title="All floor plans">
            <AllFloorPlans
              occupied={building.occupied}
              rooftop={building.rooftop}
              planUrls={planUrls}
              filters={filters}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onOpen={openPlan}
            />
          </Panel>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Source: {ELEVATION_SOURCE}
          </p>
        </>
      )}
    </div>
  );
};

export default PortalBuildingView;
