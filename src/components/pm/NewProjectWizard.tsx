import React, { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Chip, Field, selectCls } from "./ui";
import useClientSiteDialogs from "./ClientSiteDialogs";
import { DOCUMENTS_BUCKET } from "@/lib/portalFiles";
import { FLOOR_USES, SURVEY_DISCLAIMER } from "@/lib/floorPlans";
import { planRevisionTransaction } from "@/lib/designApi";
import {
  duplicateFileWarnings,
  normalizeBuildingDetails,
  suggestFloorFromFilename,
  suggestRevisionLabel,
  validateWizardStep,
  type WizardDraft,
} from "@/lib/projectWizard";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";
import { AlertTriangle, Check } from "lucide-react";

type FloorRow = { key: string; level_number: number | string; display_name: string; floor_use: string };
type FileRow = {
  key: string;
  file: File;
  floorKey: string | null;
  drawing_number: string;
  drawing_title: string;
  drawing_scale: string;
  issue_date: string;
  approval_status: string;
  page_number: string;
  rotation_deg: string;
  status: "pending" | "done" | "failed";
  error?: string;
};

const STEPS = ["Client & site", "Project details", "Initial site plans", "Review & create"] as const;
const APPROVALS = ["pending_review", "for_information", "approved"];

/**
 * Guided project creation. Reuses the existing client/site controls, the current
 * plan storage path convention and the existing plan-revision transaction, so no
 * business logic is duplicated. Nothing is created until the final confirmation.
 */
const NewProjectWizard: React.FC<{
  ws: PmWorkspace;
  open: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}> = ({ ws, open, onClose, onCreated }) => {
  const { clients, sites, reload } = ws;
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [busy, setBusy] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const [clientId, setClientId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [details, setDetails] = useState({
    title: "",
    reference: "",
    address: "",
    description: "",
    consultant: "",
    status: "planning",
    start_date: "",
    target_date: "",
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
  const [floors, setFloors] = useState<FloorRow[]>([]);
  const [files, setFiles] = useState<FileRow[]>([]);

  const dialogs = useClientSiteDialogs({
    clients,
    reload,
    onClientSaved: (id) => setClientId(id),
    onSiteSaved: (id) => setSiteId(id),
  });

  const clientSites = useMemo(() => sites.filter((s) => s.client_id === clientId), [sites, clientId]);

  const draft: WizardDraft = {
    client_id: clientId,
    site_id: siteId,
    title: details.title,
    reference: details.reference,
    status: details.status,
    files: files.map((f) => ({ name: f.file.name, floorKey: f.floorKey })),
    floors,
  };
  const errors = validateWizardStep(step, draft);

  const duplicateWarnings = useMemo(
    () => duplicateFileWarnings(files.map((f) => ({ name: f.file.name, size: f.file.size })), []),
    [files],
  );

  const addFloor = (seed?: { level_number: number; display_name: string; floor_use: string }) =>
    setFloors((prev) => {
      const suggestion = seed ?? suggestFloorFromFilename("", prev.length);
      const key = `f${Date.now()}${prev.length}`;
      if (prev.some((p) => Number(p.level_number) === suggestion.level_number))
        return [...prev, { key, ...suggestion, level_number: suggestion.level_number + prev.length }];
      return [...prev, { key, ...suggestion }];
    });

  /** Suggests one floor per uploaded file from the filename, all still editable. */
  const onFilesPicked = (picked: FileList | null) => {
    if (!picked?.length) return;
    const incoming = Array.from(picked);
    setFloors((prevFloors) => {
      const next = [...prevFloors];
      incoming.forEach((file, i) => {
        const s = suggestFloorFromFilename(file.name, next.length + i);
        if (!next.some((f) => Number(f.level_number) === s.level_number))
          next.push({ key: `f${file.name}${s.level_number}`, ...s });
      });
      return next;
    });
    setFiles((prev) => {
      const nextFloorKeys = incoming.map((file, i) => {
        const s = suggestFloorFromFilename(file.name, prev.length + i);
        return `f${file.name}${s.level_number}`;
      });
      return [
        ...prev,
        ...incoming.map((file, i) => ({
          key: `${file.name}-${file.size}-${i}-${Date.now()}`,
          file,
          floorKey: nextFloorKeys[i],
          drawing_number: "",
          drawing_title: file.name.replace(/\.[a-z0-9]+$/i, ""),
          drawing_scale: "",
          issue_date: "",
          approval_status: "pending_review",
          page_number: String(i + 1),
          rotation_deg: "0",
          status: "pending" as const,
        })),
      ];
    });
  };

  const patchFile = (key: string, patch: Partial<FileRow>) =>
    setFiles((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  const patchFloor = (key: string, patch: Partial<FloorRow>) =>
    setFloors((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));

  /**
   * Creates the project, its floors and each plan revision. Already-created
   * records are reused on retry so a failed upload never duplicates a project or
   * overwrites an earlier plan revision.
   */
  const submit = async () => {
    if (errors.length) return;
    setBusy(true);
    try {
      let projectId = createdProjectId;
      if (!projectId) {
        const { data, error } = await supabase
          .from("portal_projects")
          .insert({
            client_id: clientId,
            site_id: siteId || null,
            title: details.title.trim(),
            reference: details.reference.trim() || null,
            address: details.address.trim() || null,
            description: details.description.trim() || null,
            consultant: details.consultant.trim() || null,
            status: details.status,
            start_date: details.start_date || null,
            target_date: details.target_date || null,
            building_details: normalizeBuildingDetails(building) as never,
          } as never)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        projectId = (data as { id: string } | null)?.id ?? null;
        if (!projectId) throw new Error("The project could not be created.");
        setCreatedProjectId(projectId);
      }

      // Existing floors for this project (present on retry) are reused, not duplicated.
      const { data: existingFloors } = await supabase
        .from("portal_floors")
        .select("id, level_number")
        .eq("project_id", projectId);
      const floorIdByKey = new Map<string, string>();
      for (const row of floors) {
        const level = Number(row.level_number);
        const existing = (existingFloors ?? []).find((f) => f.level_number === level);
        if (existing) {
          floorIdByKey.set(row.key, existing.id);
          continue;
        }
        const { data, error } = await supabase
          .from("portal_floors")
          .insert({
            project_id: projectId,
            level_number: level,
            display_name: row.display_name.trim(),
            floor_use: row.floor_use,
            sort_order: level,
            notes: SURVEY_DISCLAIMER,
          })
          .select("id")
          .maybeSingle();
        if (error) throw error;
        floorIdByKey.set(row.key, (data as { id: string }).id);
      }

      let failed = 0;
      for (const row of files) {
        if (row.status === "done") continue;
        const floorId = row.floorKey ? floorIdByKey.get(row.floorKey) : undefined;
        if (!floorId) {
          patchFile(row.key, { status: "failed", error: "No floor was resolved for this file." });
          failed += 1;
          continue;
        }
        try {
          const isPdf = row.file.type === "application/pdf";
          const isImage = row.file.type.startsWith("image/");
          if (!isPdf && !isImage) throw new Error("Only PDF or image plans are supported.");
          const level = Number(floors.find((f) => f.key === row.floorKey)?.level_number ?? 0);
          const ext = row.file.name.split(".").pop()?.toLowerCase() ?? (isPdf ? "pdf" : "png");
          // 'projects/<uuid>/...' is the prefix the plan-revision transaction and storage policies expect.
          const path = `projects/${projectId}/floor-plans/level-${String(level).padStart(2, "0")}-${Date.now()}.${ext}`;
          // upsert:false — an original or earlier revision can never be overwritten.
          const { error: upErr } = await supabase.storage
            .from(DOCUMENTS_BUCKET)
            .upload(path, row.file, { upsert: false });
          if (upErr) throw upErr;
          const res = await planRevisionTransaction("create", {
            floor_id: floorId,
            source_path: path,
            image_path: isImage ? path : null,
            original_filename: row.file.name,
            mime_type: row.file.type,
            file_size: row.file.size,
            page_number: Number(row.page_number) || 1,
            rotation_deg: Number(row.rotation_deg) || 0,
            make_current: true,
            notes: isPdf ? "PDF source retained. Upload an interactive preview image to design on it." : null,
          });
          const revisionId = (res as { revision_id?: string })?.revision_id;
          if (revisionId) {
            await supabase
              .from("portal_plan_revisions")
              .update({
                drawing_number: row.drawing_number.trim() || null,
                drawing_title: row.drawing_title.trim() || null,
                drawing_scale: row.drawing_scale.trim() || null,
                issue_date: row.issue_date || null,
                approval_status: row.approval_status || null,
              } as never)
              .eq("id", revisionId);
          }
          patchFile(row.key, { status: "done", error: undefined });
        } catch (e) {
          failed += 1;
          patchFile(row.key, { status: "failed", error: e instanceof Error ? e.message : String(e) });
        }
      }

      await reload();
      if (failed > 0) {
        toast({
          title: `${failed} plan upload${failed === 1 ? "" : "s"} failed`,
          description: "The project was kept in planning status. Fix the listed files and retry.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Project created", description: "Opening plans & mapping." });
      onCreated(projectId!);
      onClose();
    } catch (e) {
      toast({
        title: "Could not create the project",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const clientName = clients.find((c) => c.id === clientId)?.display_name ?? "—";
  const siteName = sites.find((s) => s.id === siteId)?.name ?? "—";

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
          </DialogHeader>

          <ol className="mb-4 flex flex-wrap gap-2">
            {STEPS.map((label, i) => (
              <li key={label}>
                <Chip className={i + 1 === step ? "border-foreground text-foreground" : "border-border text-muted-foreground"}>
                  {i + 1}. {label}
                </Chip>
              </li>
            ))}
          </ol>

          {step === 1 && (
            <div className="grid gap-4">
              <Field label="Client">
                <select className={selectCls} value={clientId} onChange={(e) => { setClientId(e.target.value); setSiteId(""); }}>
                  <option value="">Select a client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Site (optional)">
                <select className={selectCls} value={siteId} onChange={(e) => setSiteId(e.target.value)} disabled={!clientId}>
                  <option value="">No specific site</option>
                  {clientSites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={dialogs.newClient}>
                  New client
                </Button>
                <Button size="sm" variant="outline" onClick={() => dialogs.newSite(clientId)} disabled={!clientId}>
                  New site
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project title" className="sm:col-span-2">
                <Input value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} />
              </Field>
              <Field label="Reference">
                <Input value={details.reference} onChange={(e) => setDetails({ ...details, reference: e.target.value })} />
              </Field>
              <Field label="Status">
                <select className={selectCls} value={details.status} onChange={(e) => setDetails({ ...details, status: e.target.value })}>
                  {["planning", "design", "in_progress", "on_hold", "complete"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <Input value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} />
              </Field>
              <Field label="Consultant">
                <Input value={details.consultant} onChange={(e) => setDetails({ ...details, consultant: e.target.value })} />
              </Field>
              <Field label="Building type / use">
                <Input value={building.building_type} onChange={(e) => setBuilding({ ...building, building_type: e.target.value })} />
              </Field>
              <Field label="Start date">
                <Input type="date" value={details.start_date} onChange={(e) => setDetails({ ...details, start_date: e.target.value })} />
              </Field>
              <Field label="Target date">
                <Input type="date" value={details.target_date} onChange={(e) => setDetails({ ...details, target_date: e.target.value })} />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea rows={3} value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} />
              </Field>
              <Field label="Total / GFA floor area (m²)">
                <Input value={building.gfa_sqm} onChange={(e) => setBuilding({ ...building, gfa_sqm: e.target.value })} />
              </Field>
              <Field label="Rooms / units">
                <Input value={building.rooms_units} onChange={(e) => setBuilding({ ...building, rooms_units: e.target.value })} />
              </Field>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Building measurements are optional. Nothing is inferred or measured automatically — capture only what
                the drawings or the client confirm.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-5">
              <Field label="Site plans (PDF or image, multiple allowed)">
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => onFilesPicked(e.target.files)}
                  className="text-sm"
                />
              </Field>
              <p className="text-xs text-muted-foreground">
                Every original file is preserved. The first confirmed revision per floor becomes the
                “{suggestRevisionLabel(0)}”; later uploads always create a new revision.
              </p>

              {duplicateWarnings.map((w) => (
                <p key={w} className="flex items-center gap-2 border border-border p-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" /> {w}
                </p>
              ))}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Floors</p>
                  <Button size="sm" variant="outline" onClick={() => addFloor()}>
                    Add floor
                  </Button>
                </div>
                {floors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No floors yet — add one or upload plans.</p>
                ) : (
                  <div className="grid gap-2">
                    {floors.map((f) => (
                      <div key={f.key} className="grid gap-2 border border-border p-3 sm:grid-cols-[90px_1fr_1fr_auto]">
                        <Input
                          value={String(f.level_number)}
                          onChange={(e) => patchFloor(f.key, { level_number: e.target.value })}
                          aria-label="Level number"
                        />
                        <Input
                          value={f.display_name}
                          onChange={(e) => patchFloor(f.key, { display_name: e.target.value })}
                          aria-label="Floor name"
                        />
                        <select className={selectCls} value={f.floor_use} onChange={(e) => patchFloor(f.key, { floor_use: e.target.value })}>
                          {FLOOR_USES.map((u: { value: string; label: string }) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline"
                          onClick={() => {
                            setFloors((prev) => prev.filter((x) => x.key !== f.key));
                            setFiles((prev) => prev.map((x) => (x.floorKey === f.key ? { ...x, floorKey: null } : x)));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {files.length > 0 && (
                <div className="grid gap-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Plan files</p>
                  {files.map((f) => (
                    <div key={f.key} className="grid gap-2 border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">{f.file.name}</p>
                        {f.status === "done" && <Chip className="border-foreground text-foreground">Uploaded</Chip>}
                        {f.status === "failed" && <Chip className="border-destructive text-destructive">Failed</Chip>}
                      </div>
                      {f.error && <p className="text-xs text-destructive">{f.error}</p>}
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Field label="Assign to floor">
                          <select className={selectCls} value={f.floorKey ?? ""} onChange={(e) => patchFile(f.key, { floorKey: e.target.value || null })}>
                            <option value="">Select a floor…</option>
                            {floors.map((fl) => (
                              <option key={fl.key} value={fl.key}>
                                {fl.level_number} · {fl.display_name}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Drawing number">
                          <Input value={f.drawing_number} onChange={(e) => patchFile(f.key, { drawing_number: e.target.value })} />
                        </Field>
                        <Field label="Drawing title">
                          <Input value={f.drawing_title} onChange={(e) => patchFile(f.key, { drawing_title: e.target.value })} />
                        </Field>
                        <Field label="Scale">
                          <Input value={f.drawing_scale} onChange={(e) => patchFile(f.key, { drawing_scale: e.target.value })} placeholder="1:100" />
                        </Field>
                        <Field label="Issue date">
                          <Input type="date" value={f.issue_date} onChange={(e) => patchFile(f.key, { issue_date: e.target.value })} />
                        </Field>
                        <Field label="Approval status">
                          <select className={selectCls} value={f.approval_status} onChange={(e) => patchFile(f.key, { approval_status: e.target.value })}>
                            {APPROVALS.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Page number">
                          <Input value={f.page_number} onChange={(e) => patchFile(f.key, { page_number: e.target.value })} />
                        </Field>
                        <Field label="Rotation (degrees)">
                          <Input value={f.rotation_deg} onChange={(e) => patchFile(f.key, { rotation_deg: e.target.value })} />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-3 text-sm">
              <div className="border border-border p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Client & site</p>
                <p className="mt-1">
                  {clientName} · {siteName}
                </p>
              </div>
              <div className="border border-border p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Project</p>
                <p className="mt-1 font-medium">{details.title}</p>
                <p className="text-xs text-muted-foreground">
                  {[details.reference, details.address, details.status, details.start_date, details.target_date]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {details.description && <p className="mt-2 text-xs text-muted-foreground">{details.description}</p>}
              </div>
              <div className="border border-border p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Building details</p>
                <pre className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                  {JSON.stringify(normalizeBuildingDetails(building) ?? {}, null, 2)}
                </pre>
              </div>
              <div className="border border-border p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Floors ({floors.length}) & files ({files.length})
                </p>
                <ul className="mt-1 text-xs text-muted-foreground">
                  {floors.map((f) => (
                    <li key={f.key}>
                      {f.level_number} · {f.display_name} —{" "}
                      {files.filter((x) => x.floorKey === f.key).map((x) => x.file.name).join(", ") || "no plan yet"}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                Nothing has been created yet. No email or notification is sent at any point.
              </p>
            </div>
          )}

          {errors.length > 0 && (
            <ul className="mt-4 border border-destructive p-3 text-xs text-destructive">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => (step === 1 ? onClose() : setStep((s) => (s - 1) as 1 | 2 | 3))}>
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            {step < 4 ? (
              <Button disabled={errors.length > 0} onClick={() => setStep((s) => (s + 1) as 2 | 3 | 4)}>
                Next
              </Button>
            ) : (
              <Button disabled={busy || errors.length > 0} onClick={submit} className="gap-2">
                <Check className="h-4 w-4" />
                {createdProjectId ? "Retry outstanding uploads" : "Confirm & create project"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {dialogs.dialogs}
    </>
  );
};

export default NewProjectWizard;
