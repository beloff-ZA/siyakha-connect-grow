import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Printer, Layers, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePortal } from "@/hooks/usePortal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, Panel, EmptyState, Loading, ErrorNote, NoProject, StatusPill } from "@/components/portal/ui";
import { DOCUMENTS_BUCKET, signedUrl, formatDate } from "@/lib/portalFiles";
import {
  countByType,
  deviceLabel,
  deviceShort,
  type BuildingLevel,
  type DeviceMarker,
} from "@/lib/buildingPlans";

const PortalPlans: React.FC = () => {
  const { activeProject, loading: portalLoading } = usePortal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<BuildingLevel[]>([]);
  const [markers, setMarkers] = useState<DeviceMarker[]>([]);
  const [levelId, setLevelId] = useState("");
  const [planUrl, setPlanUrl] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [openMarker, setOpenMarker] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Virtual building plans | Siyakha Client Portal";
  }, []);

  const load = useCallback(async () => {
    if (!activeProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: levelRows, error: lErr } = await supabase
      .from("portal_building_levels")
      .select("*")
      .eq("project_id", activeProject.id)
      .order("sort_order", { ascending: true });
    if (lErr) {
      setError(lErr.message);
      setLoading(false);
      return;
    }
    const list = (levelRows ?? []) as unknown as BuildingLevel[];
    setLevels(list);
    setLevelId((prev) => (prev && list.some((l) => l.id === prev) ? prev : list[0]?.id ?? ""));

    const { data: markerRows, error: mErr } = await supabase
      .from("portal_device_markers")
      .select("*")
      .eq("project_id", activeProject.id)
      .order("sort_order", { ascending: true });
    if (mErr) setError(mErr.message);
    setMarkers((markerRows ?? []) as unknown as DeviceMarker[]);
    setLoading(false);
  }, [activeProject]);

  useEffect(() => {
    load();
  }, [load]);

  const level = useMemo(() => levels.find((l) => l.id === levelId) ?? null, [levels, levelId]);
  const levelMarkers = useMemo(
    () => markers.filter((m) => m.level_id === levelId),
    [markers, levelId],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return levelMarkers;
    return levelMarkers.filter((m) =>
      [m.label, m.model, deviceLabel(m.device_type), m.mounting, m.notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [levelMarkers, query]);

  useEffect(() => {
    let cancelled = false;
    setPlanUrl(null);
    if (!level?.plan_image_path) return;
    setPlanLoading(true);
    signedUrl(DOCUMENTS_BUCKET, level.plan_image_path, 300)
      .then((url) => {
        if (!cancelled) setPlanUrl(url);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not open the plan sheet.");
      })
      .finally(() => {
        if (!cancelled) setPlanLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [level?.plan_image_path]);

  const totals = useMemo(() => countByType(markers), [markers]);

  if (portalLoading || loading) return <Loading />;
  if (!activeProject) return <NoProject />;

  return (
    <div>
      <PageHeader
        eyebrow="Virtual building plans"
        title="Building plans & device placement"
        description="Level-by-level plan sheets with indicative network and device positions. Placements marked preliminary are design intent only and are confirmed on site survey."
      />

      {error && (
        <div className="mb-6">
          <ErrorNote message={error} />
        </div>
      )}

      {levels.length === 0 ? (
        <EmptyState
          title="No plan levels shared yet"
          description="Once Siyakha publishes the building levels and device layouts for this project, they will appear here."
        />
      ) : (
        <div className="space-y-6">
          <Panel title="Project device summary">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-display text-3xl font-light tracking-tight">{levels.length}</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1">Levels</p>
              </div>
              <div>
                <p className="font-display text-3xl font-light tracking-tight">{markers.length}</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1">
                  Devices marked
                </p>
              </div>
              {Object.entries(totals)
                .slice(0, 2)
                .map(([type, count]) => (
                  <div key={type}>
                    <p className="font-display text-3xl font-light tracking-tight">{count}</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1">
                      {deviceLabel(type)}s
                    </p>
                  </div>
                ))}
            </div>
          </Panel>

          <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">
            <Panel title="Levels" className="lg:sticky lg:top-6">
              <nav aria-label="Building levels" className="space-y-1">
                {levels.map((l) => {
                  const count = markers.filter((m) => m.level_id === l.id).length;
                  const active = l.id === levelId;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setLevelId(l.id);
                        setOpenMarker(null);
                      }}
                      aria-current={active ? "true" : undefined}
                      className={[
                        "w-full text-left px-3 py-2 border-l-2 text-sm transition-colors",
                        active
                          ? "border-foreground bg-muted text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      ].join(" ")}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate">{l.name}</span>
                        <span className="text-[10px] tracking-[0.16em] text-muted-foreground">{count}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </Panel>

            <div className="space-y-6 min-w-0">
              <Panel>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-light tracking-tight">{level?.name}</h2>
                    <p className="text-xs text-muted-foreground mt-2">
                      {[
                        level?.level_code ? `Level ${level.level_code}` : null,
                        level?.plan_reference ? `Drawing ${level.plan_reference}` : null,
                        `Drawing date ${formatDate(level?.drawing_date)}`,
                        `${levelMarkers.length} device${levelMarkers.length === 1 ? "" : "s"}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={level?.status} />
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                      <Printer className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
                      Print
                    </Button>
                  </div>
                </div>

                <div className="relative border border-border bg-muted/30">
                  {planLoading && (
                    <div className="p-12 text-center text-sm text-muted-foreground">Opening plan sheet…</div>
                  )}
                  {!planLoading && !planUrl && (
                    <div className="p-12 text-center">
                      <Layers className="h-5 w-5 mx-auto text-muted-foreground" strokeWidth={1.5} />
                      <p className="mt-3 text-sm text-muted-foreground">
                        No plan sheet attached to this level yet.
                      </p>
                    </div>
                  )}
                  {planUrl && (
                    <div className="relative">
                      <img
                        src={planUrl}
                        alt={`${level?.name} plan sheet with indicative device placement`}
                        className="w-full h-auto block grayscale"
                        loading="lazy"
                      />
                      {levelMarkers.map((m, i) => {
                        const active = openMarker === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setOpenMarker(active ? null : m.id)}
                            title={`${m.label} — ${deviceLabel(m.device_type)}`}
                            aria-label={`${m.label}, ${deviceLabel(m.device_type)}, ${m.status}`}
                            style={{ left: `${m.x_pct}%`, top: `${m.y_pct}%` }}
                            className={[
                              "absolute -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full border text-[9px] font-medium",
                              "flex items-center justify-center transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-foreground",
                              active
                                ? "bg-foreground text-background border-foreground scale-125"
                                : "bg-background/90 text-foreground border-foreground",
                            ].join(" ")}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {openMarker && (
                  <div className="mt-4 border border-border p-4">
                    {(() => {
                      const m = levelMarkers.find((x) => x.id === openMarker);
                      if (!m) return null;
                      return (
                        <div>
                          <p className="text-sm font-medium">
                            {m.label} · {deviceLabel(m.device_type)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Status {m.status} · Model {m.model ?? "TBC"}
                            {m.mounting ? ` · ${m.mounting}` : ""}
                          </p>
                          {m.notes && (
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{m.notes}</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {level?.notes && <p className="mt-4 text-xs text-muted-foreground">{level.notes}</p>}
              </Panel>

              <Panel title="Device schedule">
                <div className="relative mb-4 max-w-sm">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search devices on this level"
                    aria-label="Search devices on this level"
                    className="pl-9"
                  />
                </div>

                {filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {levelMarkers.length === 0
                      ? "No devices are marked on this level yet."
                      : "No devices match your search."}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          <th className="py-2 pr-4 font-normal">Ref</th>
                          <th className="py-2 pr-4 font-normal">Device</th>
                          <th className="py-2 pr-4 font-normal">Type</th>
                          <th className="py-2 pr-4 font-normal">Model</th>
                          <th className="py-2 pr-4 font-normal">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filtered.map((m) => (
                          <tr key={m.id} className="align-top">
                            <td className="py-3 pr-4 text-muted-foreground">
                              {deviceShort(m.device_type)}
                            </td>
                            <td className="py-3 pr-4">{m.label}</td>
                            <td className="py-3 pr-4 text-muted-foreground">{deviceLabel(m.device_type)}</td>
                            <td className="py-3 pr-4 text-muted-foreground">{m.model ?? "TBC"}</td>
                            <td className="py-3 pr-4 text-muted-foreground capitalize">{m.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalPlans;
