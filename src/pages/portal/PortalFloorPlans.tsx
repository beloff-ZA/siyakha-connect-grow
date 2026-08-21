import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Info, Layers, MessageSquare, Search, Wifi } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePortal } from "@/hooks/usePortal";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  PageHeader,
  Panel,
  EmptyState,
  Loading,
  ErrorNote,
  NoProject,
} from "@/components/portal/ui";
import FloorPlanCanvas from "@/components/portal/FloorPlanCanvas";
import { DOCUMENTS_BUCKET, signedUrl, formatDate } from "@/lib/portalFiles";
import {
  MARKER_KINDS,
  SURVEY_DISCLAIMER,
  kindLabel,
  kindShort,
  markerStats,
  stateLabel,
  type FloorMarker,
  type MarkerKind,
  type PortalFloor,
} from "@/lib/floorPlans";

const LAYERS: { kind: MarkerKind; label: string }[] = [
  { kind: "wifi_ap", label: "Wi-Fi Access Points" },
  { kind: "camera", label: "CCTV Cameras" },
  { kind: "rack", label: "Racks" },
  { kind: "cable_route", label: "Cable Routes" },
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
  const shown = useMemo(() => floorMarkers.filter((m) => visible[m.marker_type]), [floorMarkers, visible]);
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

              <FloorPlanCanvas
                imageUrl={planUrl}
                markers={shown}
                selectedId={selected?.id ?? null}
                onSelect={setSelected}
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
                  Planned
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-5 w-5 rounded-full border border-foreground" />
                  Installed / tested
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
    </div>
  );
};

export default PortalFloorPlans;
