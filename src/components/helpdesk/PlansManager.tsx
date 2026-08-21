import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, ArrowUp, MapPin, Trash2, Upload } from "lucide-react";
import { DOCUMENTS_BUCKET, signedUrl } from "@/lib/portalFiles";
import {
  DEVICE_TYPES,
  MARKER_STATUSES,
  STOREY_TYPES,
  clampPct,
  deviceLabel,
  type BuildingLevel,
  type DeviceMarker,
} from "@/lib/buildingPlans";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="border border-border p-5 md:p-6 mb-6">
    <h3 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-4">{title}</h3>
    {children}
  </section>
);

const selectCls = "h-10 border border-input bg-background px-3 text-sm w-full";

const emptyLevel = {
  name: "",
  level_code: "",
  storey_type: "storey",
  status: "draft",
  plan_reference: "",
  drawing_date: "",
  notes: "",
};

const emptyMarker = {
  device_type: "wifi_ap",
  label: "",
  model: "",
  mounting: "",
  status: "preliminary",
  notes: "",
};

const PlansManager: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { toast } = useToast();
  const [levels, setLevels] = useState<BuildingLevel[]>([]);
  const [levelId, setLevelId] = useState("");
  const [markers, setMarkers] = useState<DeviceMarker[]>([]);
  const [planUrl, setPlanUrl] = useState<string | null>(null);
  const [newLevel, setNewLevel] = useState({ ...emptyLevel });
  const [markerDraft, setMarkerDraft] = useState({ ...emptyMarker });
  const [placing, setPlacing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const planFileRef = useRef<HTMLInputElement>(null);

  const fail = (e: unknown) =>
    toast({
      title: "Action failed",
      description: e instanceof Error ? e.message : (e as any)?.message ?? String(e),
      variant: "destructive" as never,
    });

  const load = useCallback(async () => {
    if (!projectId) {
      setLevels([]);
      setMarkers([]);
      return;
    }
    const { data, error } = await supabase
      .from("portal_building_levels")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });
    if (error) return fail(error);
    const list = (data ?? []) as unknown as BuildingLevel[];
    setLevels(list);
    setLevelId((prev) => (prev && list.some((l) => l.id === prev) ? prev : list[0]?.id ?? ""));

    const { data: m, error: mErr } = await supabase
      .from("portal_device_markers")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });
    if (mErr) return fail(mErr);
    setMarkers((m ?? []) as unknown as DeviceMarker[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const level = useMemo(() => levels.find((l) => l.id === levelId) ?? null, [levels, levelId]);
  const levelMarkers = useMemo(() => markers.filter((m) => m.level_id === levelId), [markers, levelId]);

  useEffect(() => {
    let cancelled = false;
    setPlanUrl(null);
    if (!level?.plan_image_path) return;
    signedUrl(DOCUMENTS_BUCKET, level.plan_image_path, 300)
      .then((u) => !cancelled && setPlanUrl(u))
      .catch(fail);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level?.plan_image_path]);

  const createLevel = async () => {
    if (!projectId || !newLevel.name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("portal_building_levels").insert({
      project_id: projectId,
      name: newLevel.name.trim(),
      level_code: newLevel.level_code.trim() || null,
      storey_type: newLevel.storey_type,
      status: newLevel.status,
      plan_reference: newLevel.plan_reference.trim() || null,
      drawing_date: newLevel.drawing_date || null,
      notes: newLevel.notes.trim() || null,
      sort_order: (levels[levels.length - 1]?.sort_order ?? 0) + 1,
    });
    setBusy(false);
    if (error) return fail(error);
    setNewLevel({ ...emptyLevel });
    toast({ title: "Level added" });
    load();
  };

  const updateLevel = async (id: string, patch: Partial<BuildingLevel>) => {
    setBusy(true);
    const { error } = await supabase.from("portal_building_levels").update(patch as never).eq("id", id);
    setBusy(false);
    if (error) return fail(error);
    load();
  };

  const removeLevel = async (id: string) => {
    if (!window.confirm("Delete this level and all of its device markers?")) return;
    setBusy(true);
    const { error } = await supabase.from("portal_building_levels").delete().eq("id", id);
    setBusy(false);
    if (error) return fail(error);
    toast({ title: "Level deleted" });
    load();
  };

  const moveLevel = async (id: string, dir: -1 | 1) => {
    const idx = levels.findIndex((l) => l.id === id);
    const other = levels[idx + dir];
    if (!other) return;
    const current = levels[idx];
    setBusy(true);
    await supabase
      .from("portal_building_levels")
      .update({ sort_order: other.sort_order })
      .eq("id", current.id);
    await supabase
      .from("portal_building_levels")
      .update({ sort_order: current.sort_order })
      .eq("id", other.id);
    setBusy(false);
    load();
  };

  const uploadPlan = async (file: File) => {
    if (!level) return;
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `plans/${projectId}/${level.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file, {
      contentType: file.type || "image/png",
      upsert: true,
    });
    if (error) {
      setBusy(false);
      return fail(error);
    }
    const { error: uErr } = await supabase
      .from("portal_building_levels")
      .update({ plan_image_path: path })
      .eq("id", level.id);
    setBusy(false);
    if (uErr) return fail(uErr);
    toast({ title: "Plan sheet uploaded" });
    load();
  };

  const placeMarker = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placing || !level) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clampPct(((e.clientX - rect.left) / rect.width) * 100);
    const y = clampPct(((e.clientY - rect.top) / rect.height) * 100);
    const { data: auth } = await supabase.auth.getUser();
    const nextIndex = levelMarkers.length + 1;
    const label =
      markerDraft.label.trim() ||
      `${markerDraft.device_type === "wifi_ap" ? "AP" : "DEV"}-${level.level_code ?? "L"}-${String(
        nextIndex,
      ).padStart(2, "0")}`;
    setBusy(true);
    const { error } = await supabase.from("portal_device_markers").insert({
      level_id: level.id,
      project_id: projectId,
      device_type: markerDraft.device_type,
      label,
      model: markerDraft.model.trim() || null,
      mounting: markerDraft.mounting.trim() || null,
      status: markerDraft.status,
      notes: markerDraft.notes.trim() || null,
      x_pct: x,
      y_pct: y,
      sort_order: nextIndex,
      created_by: auth.user?.id ?? null,
    });
    setBusy(false);
    if (error) return fail(error);
    setMarkerDraft({ ...markerDraft, label: "" });
    load();
  };

  const updateMarker = async (id: string, patch: Partial<DeviceMarker>) => {
    const { error } = await supabase.from("portal_device_markers").update(patch as never).eq("id", id);
    if (error) return fail(error);
    load();
  };

  const removeMarker = async (id: string) => {
    const { error } = await supabase.from("portal_device_markers").delete().eq("id", id);
    if (error) return fail(error);
    load();
  };

  if (!projectId) {
    return <p className="text-sm text-muted-foreground">Select a project to manage building plans.</p>;
  }

  return (
    <div>
      <Section title="Add building level">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lvl-name">Level name</Label>
            <Input
              id="lvl-name"
              value={newLevel.name}
              onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lvl-code">Level code</Label>
            <Input
              id="lvl-code"
              value={newLevel.level_code}
              onChange={(e) => setNewLevel({ ...newLevel, level_code: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lvl-type">Storey type</Label>
            <select
              id="lvl-type"
              className={selectCls}
              value={newLevel.storey_type}
              onChange={(e) => setNewLevel({ ...newLevel, storey_type: e.target.value })}
            >
              {STOREY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lvl-ref">Drawing reference</Label>
            <Input
              id="lvl-ref"
              value={newLevel.plan_reference}
              onChange={(e) => setNewLevel({ ...newLevel, plan_reference: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lvl-date">Drawing date</Label>
            <Input
              id="lvl-date"
              type="date"
              value={newLevel.drawing_date}
              onChange={(e) => setNewLevel({ ...newLevel, drawing_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lvl-status">Visibility</Label>
            <select
              id="lvl-status"
              className={selectCls}
              value={newLevel.status}
              onChange={(e) => setNewLevel({ ...newLevel, status: e.target.value })}
            >
              <option value="draft">Draft (internal only)</option>
              <option value="shared">Shared with client</option>
            </select>
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <Label htmlFor="lvl-notes">Notes</Label>
          <Textarea
            id="lvl-notes"
            value={newLevel.notes}
            onChange={(e) => setNewLevel({ ...newLevel, notes: e.target.value })}
          />
        </div>
        <Button className="mt-4" onClick={createLevel} disabled={busy || !newLevel.name.trim()}>
          Add level
        </Button>
      </Section>

      <Section title={`Levels (${levels.length})`}>
        {levels.length === 0 ? (
          <p className="text-sm text-muted-foreground">No levels yet for this project.</p>
        ) : (
          <ul className="divide-y divide-border">
            {levels.map((l, i) => (
              <li key={l.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <button
                  type="button"
                  className={`text-left text-sm ${l.id === levelId ? "font-medium" : "text-muted-foreground"}`}
                  onClick={() => setLevelId(l.id)}
                >
                  {l.name}
                  <span className="block text-xs text-muted-foreground">
                    {l.level_code ?? "—"} · {l.status === "shared" ? "Shared" : "Draft"} ·{" "}
                    {markers.filter((m) => m.level_id === l.id).length} devices
                  </span>
                </button>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => moveLevel(l.id, -1)} disabled={i === 0}>
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveLevel(l.id, 1)}
                    disabled={i === levels.length - 1}
                  >
                    <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateLevel(l.id, { status: l.status === "shared" ? "draft" : "shared" })}
                    disabled={busy}
                  >
                    {l.status === "shared" ? "Unshare" : "Share with client"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeLevel(l.id)} disabled={busy}>
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {level && (
        <>
          <Section title={`Device placement — ${level.name}`}>
            <div className="flex flex-wrap items-end gap-4 mb-5">
              <div className="space-y-2 w-48">
                <Label htmlFor="m-type">Device type</Label>
                <select
                  id="m-type"
                  className={selectCls}
                  value={markerDraft.device_type}
                  onChange={(e) => setMarkerDraft({ ...markerDraft, device_type: e.target.value })}
                >
                  {DEVICE_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 w-40">
                <Label htmlFor="m-label">Label (optional)</Label>
                <Input
                  id="m-label"
                  value={markerDraft.label}
                  onChange={(e) => setMarkerDraft({ ...markerDraft, label: e.target.value })}
                  placeholder="Auto"
                />
              </div>
              <div className="space-y-2 w-40">
                <Label htmlFor="m-model">Model</Label>
                <Input
                  id="m-model"
                  value={markerDraft.model}
                  onChange={(e) => setMarkerDraft({ ...markerDraft, model: e.target.value })}
                />
              </div>
              <div className="space-y-2 w-40">
                <Label htmlFor="m-status">Status</Label>
                <select
                  id="m-status"
                  className={selectCls}
                  value={markerDraft.status}
                  onChange={(e) => setMarkerDraft({ ...markerDraft, status: e.target.value })}
                >
                  {MARKER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant={placing ? "default" : "outline"} onClick={() => setPlacing((p) => !p)}>
                <MapPin className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
                {placing ? "Click the plan to place" : "Place device"}
              </Button>
              <input
                ref={planFileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadPlan(f);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" onClick={() => planFileRef.current?.click()} disabled={busy}>
                <Upload className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
                Upload plan sheet
              </Button>
            </div>

            {planUrl ? (
              <div
                className={`relative border border-border ${placing ? "cursor-crosshair" : ""}`}
                onClick={placeMarker}
              >
                <img src={planUrl} alt={`${level.name} plan sheet`} className="w-full h-auto block grayscale" />
                {levelMarkers.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(selected === m.id ? null : m.id);
                    }}
                    style={{ left: `${m.x_pct}%`, top: `${m.y_pct}%` }}
                    title={`${m.label} — ${deviceLabel(m.device_type)}`}
                    className={[
                      "absolute -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full border text-[9px] flex items-center justify-center",
                      selected === m.id
                        ? "bg-foreground text-background border-foreground scale-125"
                        : "bg-background/90 text-foreground border-foreground",
                    ].join(" ")}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Upload a plan sheet for this level to place devices visually.
              </p>
            )}
          </Section>

          <Section title={`Device schedule — ${levelMarkers.length} device(s)`}>
            {levelMarkers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No devices placed on this level yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="py-2 pr-3 font-normal">Label</th>
                      <th className="py-2 pr-3 font-normal">Type</th>
                      <th className="py-2 pr-3 font-normal">Model</th>
                      <th className="py-2 pr-3 font-normal">Status</th>
                      <th className="py-2 pr-3 font-normal">X %</th>
                      <th className="py-2 pr-3 font-normal">Y %</th>
                      <th className="py-2 font-normal" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {levelMarkers.map((m) => (
                      <tr key={m.id} className={selected === m.id ? "bg-muted/50" : undefined}>
                        <td className="py-2 pr-3">
                          <Input
                            className="h-9"
                            defaultValue={m.label}
                            onBlur={(e) =>
                              e.target.value !== m.label && updateMarker(m.id, { label: e.target.value })
                            }
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <select
                            className="h-9 border border-input bg-background px-2 text-sm"
                            value={m.device_type}
                            onChange={(e) => updateMarker(m.id, { device_type: e.target.value })}
                          >
                            {DEVICE_TYPES.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-3">
                          <Input
                            className="h-9"
                            defaultValue={m.model ?? ""}
                            onBlur={(e) =>
                              e.target.value !== (m.model ?? "") &&
                              updateMarker(m.id, { model: e.target.value || null })
                            }
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <select
                            className="h-9 border border-input bg-background px-2 text-sm"
                            value={m.status}
                            onChange={(e) => updateMarker(m.id, { status: e.target.value })}
                          >
                            {MARKER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-3">
                          <Input
                            className="h-9 w-20"
                            type="number"
                            step="0.1"
                            defaultValue={m.x_pct}
                            onBlur={(e) => updateMarker(m.id, { x_pct: clampPct(Number(e.target.value)) })}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <Input
                            className="h-9 w-20"
                            type="number"
                            step="0.1"
                            defaultValue={m.y_pct}
                            onBlur={(e) => updateMarker(m.id, { y_pct: clampPct(Number(e.target.value)) })}
                          />
                        </td>
                        <td className="py-2">
                          <Button size="sm" variant="outline" onClick={() => removeMarker(m.id)}>
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
};

export default PlansManager;
