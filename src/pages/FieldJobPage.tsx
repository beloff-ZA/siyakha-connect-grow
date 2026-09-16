import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { applyGuestPrivacyMeta } from "@/lib/shareLinks";
import { PHOTO_CATEGORIES, UPDATE_CATEGORIES, type PhotoCategory } from "@/lib/siteDelivery";
import {
  clearDevice,
  linkMessage,
  loadFieldJob,
  readyPhotos,
  rememberThisDevice,
  reportFieldIssue,
  submitFieldUpdate,
  uploadFieldPhoto,
  type DraftPhoto,
  type FieldJob,
} from "@/lib/siteDeliveryClient";
import { toast } from "@/hooks/use-toast";

const today = () => new Date().toISOString().slice(0, 10);

const label = "block text-[11px] uppercase tracking-[0.18em] text-muted-foreground";
const input = "mt-1 w-full min-h-[44px] border border-input bg-background px-3 py-2 text-base";
const area = "mt-1 w-full border border-input bg-background px-3 py-2 text-base";
const action = "min-h-[48px] w-full border border-foreground px-4 text-sm uppercase tracking-[0.18em]";
const ghost = "min-h-[44px] border border-border px-3 text-xs uppercase tracking-[0.16em]";

type Tab = "update" | "issue" | "timeline" | "drawings";

const emptyUpdate = () => ({
  shift_date: today(),
  category: "Site Work",
  floor_id: "",
  area_label: "",
  work_completed: "",
  work_outstanding: "",
  blockers: "",
  materials_required: "",
  team_onsite: "",
  progress_pct: 0,
  next_shift_plan: "",
  notes: "",
});

const LOCKED = new Set(["approved", "locked"]);

/**
 * Mobile-first field page for an onsite engineer. Reached only through that
 * engineer's own secure, revocable link — the engineer's identity comes from the
 * link, and no financials, other projects or admin settings are reachable here.
 */
const FieldJobPage: React.FC = () => {
  const { token = "" } = useParams();
  const [job, setJob] = useState<FieldJob | null>(null);
  const [tab, setTab] = useState<Tab>("update");
  const [form, setForm] = useState(emptyUpdate());
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [issue, setIssue] = useState({ title: "", description: "", severity: "medium", floor_id: "", location_note: "" });
  const [busy, setBusy] = useState(false);
  const draftKey = `siyakha_field_draft_${token}`;

  useEffect(() => {
    applyGuestPrivacyMeta();
    document.title = "Site update — Siyakha Technology Solutions";
  }, []);

  const reload = useCallback(async () => {
    try {
      setJob(await loadFieldJob(token));
    } catch {
      setJob({ state: "unavailable" });
    }
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Poor-signal safety net: the typed update survives a reload or a lost tab.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) setForm({ ...emptyUpdate(), ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, [draftKey]);

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [draftKey, form]);

  const engineer = job?.technician?.name ?? "";
  const floors = job?.floors ?? [];
  const floorName = (id: string | null) => floors.find((f) => f.id === id)?.display_name ?? "Whole site";
  const timeline = useMemo(
    () => [...(job?.updates ?? [])].sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1)),
    [job?.updates],
  );

  const uploadOne = useCallback(
    async (localId: string, file: File) => {
      try {
        const meta = await uploadFieldPhoto(token, file);
        setPhotos((list) => list.map((p) => (p.localId === localId ? { ...p, ...meta, status: "ready" } : p)));
      } catch (e: any) {
        setPhotos((list) =>
          list.map((p) =>
            p.localId === localId
              ? { ...p, status: "failed", errorMessage: e?.message ?? "Upload failed — tap retry when you have signal." }
              : p,
          ),
        );
      }
    },
    [token],
  );

  const addPhotos = async (files: FileList | null, category: PhotoCategory) => {
    if (!files?.length) return;
    const picked = Array.from(files).slice(0, 12);
    const drafts: DraftPhoto[] = picked.map((file) => ({
      localId: crypto.randomUUID(),
      status: "uploading",
      storage_path: "",
      category,
      caption: "",
      floor_id: form.floor_id || null,
      previewUrl: URL.createObjectURL(file),
      file,
    }));
    setPhotos((list) => [...list, ...drafts]);
    for (const draft of drafts) await uploadOne(draft.localId, draft.file!);
  };

  const uploading = photos.some((p) => p.status === "uploading");
  const ready = readyPhotos(photos);

  const submitUpdate = async () => {
    setBusy(true);
    try {
      const res = await submitFieldUpdate(token, {
        ...form,
        floor_id: form.floor_id || null,
        progress_pct: Number(form.progress_pct) || 0,
        photos: ready,
      });
      if (res.error) throw new Error(res.error);
      setForm(emptyUpdate());
      setPhotos([]);
      localStorage.removeItem(draftKey);
      toast({ title: "Update sent to the office" });
      setTab("timeline");
      await reload();
    } catch (e: any) {
      toast({ title: "Update not sent", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const submitIssue = async () => {
    setBusy(true);
    try {
      const res = await reportFieldIssue(token, {
        ...issue,
        floor_id: issue.floor_id || null,
        photos: ready.map((p) => ({ ...p, category: "issue" as PhotoCategory })),
      });
      if (res.error) throw new Error(res.error);
      setIssue({ title: "", description: "", severity: "medium", floor_id: "", location_note: "" });
      setPhotos([]);
      toast({ title: "Issue reported" });
      await reload();
    } catch (e: any) {
      toast({ title: "Issue not reported", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (!job) return <p className="p-6 text-center text-sm text-muted-foreground">Loading your job…</p>;
  if (job.state !== "ok")
    return (
      <div className="mx-auto max-w-sm p-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Siyakha Technology Solutions</p>
        <p className="mt-3 text-sm">{linkMessage(job.state)}</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-xl px-4 pb-24">
      <header className="sticky top-0 -mx-4 border-b border-border bg-background px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Siyakha Technology Solutions</p>
        <h1 className="mt-1 text-base font-semibold leading-tight">{job.project?.title}</h1>
        <p className="text-xs text-muted-foreground">
          {[job.project?.client_name, job.project?.site_name].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-1 text-xs">
          Signed in as <span className="font-semibold">{engineer}</span>
          {job.technician?.role_label ? ` · ${job.technician.role_label}` : ""}
        </p>
        <nav className="mt-3 grid grid-cols-4 gap-1">
          {(
            [
              ["update", "Update"],
              ["issue", "Issue"],
              ["timeline", "History"],
              ["drawings", "Plans"],
            ] as [Tab, string][]
          ).map(([value, text]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`min-h-[44px] border text-[11px] uppercase tracking-[0.14em] ${
                tab === value ? "border-foreground bg-foreground text-background" : "border-border"
              }`}
            >
              {text}
            </button>
          ))}
        </nav>
      </header>

      {tab === "update" && (
        <div className="mt-4 space-y-4">
          {job.project?.scope && (
            <details className="border border-border p-3">
              <summary className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Scope of work</summary>
              <p className="mt-2 whitespace-pre-wrap text-sm">{job.project.scope}</p>
            </details>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Date</span>
              <input
                type="date"
                className={input}
                value={form.shift_date}
                onChange={(e) => setForm({ ...form, shift_date: e.target.value })}
              />
            </div>
            <div>
              <span className={label}>Progress %</span>
              <input
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                className={input}
                value={form.progress_pct}
                onChange={(e) => setForm({ ...form, progress_pct: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <span className={label}>Category</span>
            <select className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {UPDATE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Floor</span>
            <select className={input} value={form.floor_id} onChange={(e) => setForm({ ...form, floor_id: e.target.value })}>
              <option value="">Whole site</option>
              {floors.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.display_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Area / room</span>
            <input className={input} value={form.area_label} onChange={(e) => setForm({ ...form, area_label: e.target.value })} />
          </div>

          {(
            [
              ["work_completed", "Work completed today"],
              ["work_outstanding", "Work outstanding"],
              ["blockers", "Blockers / issues"],
              ["materials_required", "Materials required"],
              ["team_onsite", "Team on site"],
              ["next_shift_plan", "Plan for next shift"],
              ["notes", "Notes"],
            ] as [keyof typeof form, string][]
          ).map(([key, text]) => (
            <div key={key as string}>
              <span className={label}>{text}</span>
              <textarea
                rows={key === "team_onsite" ? 2 : 3}
                className={area}
                value={form[key] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}

          <PhotoBlock photos={photos} setPhotos={setPhotos} onPick={addPhotos} onRetry={uploadOne} defaultFloor={form.floor_id} />

          <button type="button" className={action} disabled={busy || uploading} onClick={submitUpdate}>
            {busy ? "Sending…" : uploading ? "Waiting for photos…" : `Send site update${ready.length ? ` (${ready.length} photos)` : ""}`}
          </button>

          {!job.device_remembered ? (
            <button
              type="button"
              className={ghost}
              disabled={busy}
              onClick={async () => {
                await rememberThisDevice(token, navigator.userAgent.slice(0, 80));
                await reload();
                toast({ title: "This device is remembered" });
              }}
            >
              Remember this device
            </button>
          ) : (
            <button
              type="button"
              className={ghost}
              onClick={() => {
                clearDevice();
                reload();
                toast({ title: "Device forgotten on this phone" });
              }}
            >
              Forget this device
            </button>
          )}
        </div>
      )}

      {tab === "issue" && (
        <div className="mt-4 space-y-4">
          <div>
            <span className={label}>What is the problem?</span>
            <input className={input} value={issue.title} onChange={(e) => setIssue({ ...issue, title: e.target.value })} />
          </div>
          <div>
            <span className={label}>Severity</span>
            <select className={input} value={issue.severity} onChange={(e) => setIssue({ ...issue, severity: e.target.value })}>
              {["low", "medium", "high", "critical"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Floor</span>
            <select className={input} value={issue.floor_id} onChange={(e) => setIssue({ ...issue, floor_id: e.target.value })}>
              <option value="">Whole site</option>
              {floors.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.display_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Where exactly</span>
            <input
              className={input}
              value={issue.location_note}
              onChange={(e) => setIssue({ ...issue, location_note: e.target.value })}
            />
          </div>
          <div>
            <span className={label}>Details</span>
            <textarea
              rows={4}
              className={area}
              value={issue.description}
              onChange={(e) => setIssue({ ...issue, description: e.target.value })}
            />
          </div>
          <PhotoBlock photos={photos} setPhotos={setPhotos} onPick={addPhotos} onRetry={uploadOne} defaultFloor={issue.floor_id} />
          <button type="button" className={action} disabled={busy || uploading || !issue.title.trim()} onClick={submitIssue}>
            {busy ? "Sending…" : "Report issue"}
          </button>
        </div>
      )}

      {tab === "timeline" && (
        <div className="mt-4 space-y-3">
          {timeline.map((u: any) => (
            <div key={u.id} className="border border-border p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {new Date(u.shift_date).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })} ·{" "}
                {u.category ? `${u.category} · ` : ""}
                {floorName(u.floor_id)}
              </p>
              <p className="mt-1 text-sm font-medium">{u.submitted_by_name}</p>
              {u.work_completed && <p className="mt-1 whitespace-pre-wrap text-sm">{u.work_completed}</p>}
              {u.work_outstanding && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">Outstanding: {u.work_outstanding}</p>
              )}
              {u.photos_outstanding && (
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">Photos still outstanding</p>
              )}
              {LOCKED.has(u.approval_status) ? (
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Signed off by the office — read only
                </p>
              ) : (
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Awaiting office review</p>
              )}
            </div>
          ))}
          {!timeline.length && <p className="text-sm text-muted-foreground">No updates yet.</p>}
        </div>
      )}

      {tab === "drawings" && (
        <div className="mt-4 space-y-3">
          {floors.map((f) => (
            <div key={f.id} className="border border-border p-3">
              <p className="text-sm font-medium">{f.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {f.progress_pct}% · {f.status.replace("_", " ")}
              </p>
              {f.drawing_url ? (
                <a href={f.drawing_url} target="_blank" rel="noreferrer" className={`${ghost} mt-2 inline-flex items-center`}>
                  Open layout
                </a>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">No layout attached yet.</p>
              )}
            </div>
          ))}
          {!!job.documents?.length && (
            <div className="border border-border p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Project documents</p>
              <ul className="mt-2 space-y-2">
                {job.documents.map((d) => (
                  <li key={d.id}>
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-sm underline">
                        {d.title}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">{d.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** Camera-first photo capture with per-photo upload state, retry and captions. */
const PhotoBlock: React.FC<{
  photos: DraftPhoto[];
  setPhotos: React.Dispatch<React.SetStateAction<DraftPhoto[]>>;
  onPick: (files: FileList | null, category: PhotoCategory) => Promise<void>;
  onRetry: (localId: string, file: File) => Promise<void>;
  defaultFloor: string;
}> = ({ photos, setPhotos, onPick, onRetry, defaultFloor }) => {
  const [category, setCategory] = useState<PhotoCategory>("during");
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border border-border p-3">
      <span className={label}>Photos of the work</span>
      <select className={input} value={category} onChange={(e) => setCategory(e.target.value as PhotoCategory)}>
        {PHOTO_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files, category);
          e.target.value = "";
        }}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files, category);
          e.target.value = "";
        }}
      />

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" className={action} onClick={() => cameraRef.current?.click()}>
          Take photo
        </button>
        <button type="button" className={action} onClick={() => libraryRef.current?.click()}>
          Choose photos
        </button>
      </div>

      {!!photos.length && (
        <div className="mt-3 space-y-2">
          {photos.map((p) => (
            <div key={p.localId} className="flex gap-2 border border-border p-2">
              {p.previewUrl && <img src={p.previewUrl} alt="Site photo" className="h-16 w-16 object-cover" />}
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {p.category}
                  {p.status === "uploading" && " · uploading…"}
                  {p.status === "ready" && " · ready"}
                  {p.status === "failed" && " · failed"}
                </p>
                <input
                  className="mt-1 min-h-[40px] w-full border border-input bg-background px-2 text-sm"
                  placeholder="Caption"
                  value={p.caption}
                  onChange={(e) =>
                    setPhotos((list) => list.map((x) => (x.localId === p.localId ? { ...x, caption: e.target.value } : x)))
                  }
                />
                {p.status === "failed" && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] text-destructive">{p.errorMessage}</span>
                    <button
                      type="button"
                      className={ghost}
                      onClick={() => {
                        setPhotos((list) =>
                          list.map((x) => (x.localId === p.localId ? { ...x, status: "uploading", errorMessage: undefined } : x)),
                        );
                        if (p.file) onRetry(p.localId, p.file);
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}
                {p.status === "ready" && !p.floor_id && defaultFloor && (
                  <button
                    type="button"
                    className={`${ghost} mt-1`}
                    onClick={() => setPhotos((list) => list.map((x) => (x.localId === p.localId ? { ...x, floor_id: defaultFloor } : x)))}
                  >
                    Tag to selected floor
                  </button>
                )}
              </div>
              <button type="button" className={ghost} onClick={() => setPhotos((list) => list.filter((x) => x.localId !== p.localId))}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FieldJobPage;
