import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Lock, Save, Send } from "lucide-react";
import { applyGuestPrivacyMeta } from "@/lib/shareLinks";
import FieldPhotoStep from "@/components/site/FieldPhotoStep";
import VoiceTextArea from "@/components/site/VoiceTextArea";
import type { PhotoCategory } from "@/lib/siteDelivery";
import {
  answersFromUpdate,
  buildUpdatePayload,
  dateChoiceLabel,
  dayRecord,
  emptyAnswers,
  isLockedUpdate,
  localDate,
  problemSeverity,
  PROBLEM_LABELS,
  QUANTITY_UNITS,
  readyToSave,
  readyToSend,
  savedTime,
  workSummary,
  WORK_CHIPS,
  type FieldAnswers,
  type ProblemLevel,
  type StoredUpdate,
} from "@/lib/fieldForm";
import {
  linkMessage,
  loadFieldJob,
  readyPhotos,
  reportFieldIssue,
  saveFieldUpdate,
  setFieldStepStatus,
  submitFieldUpdate,
  uploadFieldPhoto,
  type DraftPhoto,
  type FieldJob,
} from "@/lib/siteDeliveryClient";
import { toast } from "@/hooks/use-toast";

/** Big, plain-language step wrappers. */
const bigOption =
  "min-h-[64px] w-full border-2 px-4 text-left text-lg font-semibold flex items-center justify-between gap-3";
const navBtn = "min-h-[56px] flex-1 border-2 border-foreground text-base font-semibold flex items-center justify-center gap-2";
/**
 * The two deliberate colour exceptions on this page, approved for the site form:
 * green keeps the day's report up to date, red hands it to the office.
 */
const saveBtn =
  "min-h-[64px] w-full border-2 border-[#127A3E] bg-[#127A3E] text-lg font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50";
const submitBtn =
  "min-h-[76px] w-full border-2 border-[#B01B1B] bg-[#B01B1B] text-xl font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50";

const STEPS = ["Where", "What", "How much", "Problems", "Needs", "Photos", "Next", "Send"] as const;


const FieldJobPage: React.FC = () => {
  const { token = "" } = useParams();
  const [job, setJob] = useState<FieldJob | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FieldAnswers>(() => emptyAnswers(localDate()));
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [timestampUsed, setTimestampUsed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<null | { work_date: string; work: string; photos: number }>(null);
  const [showHistory, setShowHistory] = useState(false);
  const draftKey = `siyakha_field_simple_${token}`;

  const set = (patch: Partial<FieldAnswers>) => setAnswers((a) => ({ ...a, ...patch }));

  useEffect(() => {
    applyGuestPrivacyMeta();
    document.title = "Siyakha site update";
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

  // Signal drops on site: keep his typing safe.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) setAnswers({ ...emptyAnswers(localDate()), ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, [draftKey]);

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(answers));
    } catch {
      /* ignore */
    }
  }, [draftKey, answers]);

  const engineer = job?.technician?.name ?? "";
  const floors = job?.floors ?? [];
  const floorName = (id: string | null) => floors.find((f) => f.id === id)?.display_name ?? "Whole site";

  const markStep = async (id: string, status: string) => {
    try {
      await setFieldStepStatus(token, id, status);
      await reload();
    } catch {
      /* the button simply stays as it was; he can try again */
    }
  };

  const timeline = useMemo(
    () => [...(job?.updates ?? [])].sort((a, b) => (a.shift_date < b.shift_date ? 1 : -1)),
    [job?.updates],
  );

  const uploadOne = useCallback(
    async (localId: string, file: File) => {
      try {
        const meta = await uploadFieldPhoto(token, file);
        setPhotos((list) => list.map((p) => (p.localId === localId ? { ...p, ...meta, status: "ready" } : p)));
      } catch {
        setPhotos((list) =>
          list.map((p) =>
            p.localId === localId ? { ...p, status: "failed", errorMessage: "Did not load. Tap try again." } : p,
          ),
        );
      }
    },
    [token],
  );

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const drafts: DraftPhoto[] = Array.from(files)
      .slice(0, 12)
      .map((file) => ({
        localId: crypto.randomUUID(),
        status: "uploading",
        storage_path: "",
        category: "during",
        title: "",
        caption: "",
        floor_id: answers.floor_id || null,
        timestamp_confirmed: timestampUsed,
        previewUrl: URL.createObjectURL(file),
        file,
      }));
    setPhotos((list) => [...list, ...drafts]);
    for (const draft of drafts) await uploadOne(draft.localId, draft.file!);
  };

  const ready = readyPhotos(photos).map((p) => ({ ...p, timestamp_confirmed: timestampUsed, floor_id: p.floor_id ?? (answers.floor_id || null) }));
  const uploading = photos.some((p) => p.status === "uploading");
  const unnamed = photos.some((p) => p.status === "ready" && !p.title.trim());
  const blocker = unnamed ? "Give every photo a short name." : readyToSend(answers, ready.length, uploading);

  const send = async () => {
    setBusy(true);
    try {
      const payload = buildUpdatePayload(answers, ready.length);
      const res = await submitFieldUpdate(token, { ...payload, photos: ready });
      if (res.error) throw new Error(res.error);
      if (answers.problem !== "none") {
        await reportFieldIssue(token, {
          title: `${PROBLEM_LABELS[answers.problem]} — ${floorName(answers.floor_id || null)}`,
          description: answers.problem_text,
          severity: problemSeverity(answers.problem),
          floor_id: answers.floor_id || null,
          location_note: answers.area_label,
          photos: ready.filter((p) => p.category === "issue").map((p) => ({ ...p, category: "issue" as PhotoCategory })),
        });
      }
      setSent({ work_date: answers.work_date, work: workSummary(answers), photos: ready.length });
      setAnswers(emptyAnswers(localDate()));
      setPhotos([]);
      setTimestampUsed(false);
      setStep(0);
      localStorage.removeItem(draftKey);
      await reload();
    } catch (e: any) {
      toast({ title: "Not sent", description: e?.message ?? "Try again when you have signal.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (!job) return <p className="p-8 text-center text-lg">Opening your job…</p>;
  if (job.state !== "ok")
    return (
      <div className="mx-auto max-w-sm p-8 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Siyakha Technology Solutions</p>
        <p className="mt-4 text-lg">{linkMessage(job.state)}</p>
      </div>
    );

  if (sent)
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <CheckCircle2 className="mx-auto h-20 w-20" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold">UPDATE SENT</h1>
        <p className="mt-1 text-lg">Thank you {engineer}.</p>
        <div className="mt-6 border-2 border-border p-4 text-left text-base">
          <p className="font-semibold">{dateChoiceLabel(sent.work_date)}</p>
          <p className="mt-2 whitespace-pre-wrap">{sent.work}</p>
          <p className="mt-2">{sent.photos} photo{sent.photos === 1 ? "" : "s"} sent</p>
        </div>
        <button type="button" className={`${navBtn} mt-6 w-full`} onClick={() => setSent(null)}>
          Send another update
        </button>
      </div>
    );

  return (
    <div className="mx-auto max-w-md px-4 pb-10">
      <header className="sticky top-0 -mx-4 border-b-2 border-foreground bg-background px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight">SIYAKHA SITE UPDATE</h1>
        <p className="text-sm font-semibold">{job.project?.title}</p>
        <p className="text-sm text-muted-foreground">
          {engineer} · {new Date().toLocaleDateString("en-ZA", { weekday: "short", day: "2-digit", month: "short" })}
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </header>

      <main className="mt-5 space-y-4">
        {step === 0 && (
          <>
            <h2 className="text-xl font-bold">WHERE DID YOU WORK TODAY?</h2>
            <div className="grid grid-cols-2 gap-3">
              {floors.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => set({ floor_id: f.id })}
                  className={`min-h-[64px] border-2 text-lg font-semibold ${
                    answers.floor_id === f.id ? "border-foreground bg-foreground text-background" : "border-border"
                  }`}
                >
                  {f.display_name.replace(" Floor", "")}
                </button>
              ))}
              <button
                type="button"
                onClick={() => set({ floor_id: "" })}
                className={`min-h-[64px] border-2 text-lg font-semibold ${
                  answers.floor_id === "" ? "border-foreground bg-foreground text-background" : "border-border"
                }`}
              >
                Other
              </button>
            </div>
            <label className="block text-base">
              Room or area (if you want)
              <input
                className="mt-1 min-h-[56px] w-full border-2 border-input bg-background px-3 text-lg"
                value={answers.area_label}
                onChange={(e) => set({ area_label: e.target.value })}
              />
            </label>

            <div className="border-2 border-border p-3">
              <p className="text-base font-semibold">Which day was this work?</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {[
                  ["Today", localDate()],
                  ["Yesterday", localDate(-1)],
                ].map(([text, value]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set({ work_date: value })}
                    className={`min-h-[56px] border-2 text-base font-semibold ${
                      answers.work_date === value ? "border-foreground bg-foreground text-background" : "border-border"
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
              <label className="mt-3 block text-base">
                Choose another day
                <input
                  type="date"
                  max={localDate()}
                  className="mt-1 min-h-[56px] w-full border-2 border-input bg-background px-3 text-lg"
                  value={answers.work_date}
                  onChange={(e) => set({ work_date: e.target.value })}
                />
              </label>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-xl font-bold">WHAT DID YOU DO TODAY?</h2>
            <div className="grid grid-cols-2 gap-2">
              {WORK_CHIPS.map((chip) => {
                const on = answers.chips.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() =>
                      set({ chips: on ? answers.chips.filter((c) => c !== chip) : [...answers.chips, chip] })
                    }
                    className={`min-h-[56px] border-2 px-2 text-base ${
                      on ? "border-foreground bg-foreground text-background" : "border-border"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
            <VoiceTextArea
              value={answers.work_text}
              onChange={(work_text) => set({ work_text })}
              placeholder="Tell us in your own words what you did."
            />
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold">HOW MUCH DID YOU DO?</h2>
            <p className="text-base text-muted-foreground">Leave this empty if you are not sure.</p>
            <div className="flex gap-3">
              <input
                inputMode="numeric"
                placeholder="9"
                className="min-h-[64px] w-28 border-2 border-input bg-background px-3 text-xl"
                value={answers.quantity}
                onChange={(e) => set({ quantity: e.target.value.replace(/[^\d.]/g, "") })}
              />
              <select
                className="min-h-[64px] flex-1 border-2 border-input bg-background px-3 text-lg"
                value={answers.unit}
                onChange={(e) => set({ unit: e.target.value })}
              >
                {QUANTITY_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-bold">ANY PROBLEMS?</h2>
            <div className="space-y-3">
              {(["none", "small", "stopped"] as ProblemLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => set({ problem: level })}
                  className={`${bigOption} ${
                    answers.problem === level ? "border-foreground bg-foreground text-background" : "border-border"
                  }`}
                >
                  {PROBLEM_LABELS[level]}
                </button>
              ))}
            </div>
            {answers.problem !== "none" && (
              <>
                <p className="text-base font-semibold">Tell us what happened</p>
                <VoiceTextArea
                  value={answers.problem_text}
                  onChange={(problem_text) => set({ problem_text })}
                  rows={4}
                />
                <p className="text-base text-muted-foreground">Add a photo of the problem in the photos step.</p>
              </>
            )}
            <p className="pt-4 text-base font-semibold">Is this maybe extra work? (not needed)</p>
            <button
              type="button"
              onClick={() => set({ extra_work: !answers.extra_work, extra_work_text: "" })}
              className={`${bigOption} ${
                answers.extra_work ? "border-foreground bg-foreground text-background" : "border-border"
              }`}
            >
              {answers.extra_work ? "Yes — maybe extra work" : "No"}
            </button>
            {answers.extra_work && (
              <>
                <VoiceTextArea
                  value={answers.extra_work_text}
                  onChange={(extra_work_text) => set({ extra_work_text })}
                  placeholder="Say what the extra work is and why."
                  rows={4}
                />
                <p className="text-base text-muted-foreground">The office will check this. Do not agree anything on site.</p>
              </>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-xl font-bold">WHAT DO YOU NEED?</h2>
            <button
              type="button"
              onClick={() => set({ needs_nothing: !answers.needs_nothing, needs_text: "" })}
              className={`${bigOption} ${
                answers.needs_nothing ? "border-foreground bg-foreground text-background" : "border-border"
              }`}
            >
              Nothing needed
            </button>
            {!answers.needs_nothing && (
              <VoiceTextArea
                value={answers.needs_text}
                onChange={(needs_text) => set({ needs_text })}
                placeholder="Material or help you need."
                rows={4}
              />
            )}
            <p className="pt-2 text-base font-semibold">Anything else about the site? (not needed)</p>
            <VoiceTextArea
              value={answers.note_text}
              onChange={(note_text) => set({ note_text })}
              placeholder="A short site note for the office."
              rows={3}
            />
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="text-xl font-bold">PHOTOS</h2>
            <FieldPhotoStep
              photos={photos}
              timestampUsed={timestampUsed}
              onTimestampUsed={setTimestampUsed}
              onPick={addPhotos}
              onSetCategory={(localId, category) =>
                setPhotos((list) => list.map((p) => (p.localId === localId ? { ...p, category } : p)))
              }
              onSetTitle={(localId, title) =>
                setPhotos((list) => list.map((p) => (p.localId === localId ? { ...p, title } : p)))
              }
              onSetCaption={(localId, caption) =>
                setPhotos((list) => list.map((p) => (p.localId === localId ? { ...p, caption } : p)))
              }
              onRemove={(localId) => setPhotos((list) => list.filter((p) => p.localId !== localId))}
              onRetry={(localId) => {
                const p = photos.find((x) => x.localId === localId);
                setPhotos((list) =>
                  list.map((x) => (x.localId === localId ? { ...x, status: "uploading", errorMessage: undefined } : x)),
                );
                if (p?.file) uploadOne(localId, p.file);
              }}
            />
          </>
        )}

        {step === 6 && (
          <>
            <h2 className="text-xl font-bold">WHAT WILL YOU DO NEXT?</h2>
            <VoiceTextArea value={answers.next_text} onChange={(next_text) => set({ next_text })} rows={4} />
          </>
        )}

        {step === 7 && (
          <>
            <h2 className="text-xl font-bold">CHECK AND SEND</h2>
            <dl className="space-y-3 border-2 border-border p-4 text-lg">
              <div>
                <dt className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Day</dt>
                <dd>{dateChoiceLabel(answers.work_date)}</dd>
              </div>
              <div>
                <dt className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Where</dt>
                <dd>{floorName(answers.floor_id || null)}{answers.area_label ? ` · ${answers.area_label}` : ""}</dd>
              </div>
              <div>
                <dt className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Work</dt>
                <dd className="whitespace-pre-wrap">{workSummary(answers) || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Problems</dt>
                <dd>{answers.problem === "none" ? "No problems" : `${PROBLEM_LABELS[answers.problem]}: ${answers.problem_text}`}</dd>
              </div>
              <div>
                <dt className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Maybe extra work</dt>
                <dd className="whitespace-pre-wrap">{answers.extra_work ? answers.extra_work_text || "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Photos</dt>
                <dd>{ready.length}</dd>
              </div>
            </dl>

            {blocker && <p className="border-2 border-destructive p-3 text-lg font-semibold text-destructive">{blocker}</p>}

            <button
              type="button"
              disabled={busy || !!blocker}
              onClick={send}
              className="flex min-h-[76px] w-full items-center justify-center gap-3 border-2 border-accent bg-accent text-xl font-bold text-accent-foreground disabled:opacity-50"
            >
              <Send className="h-6 w-6" aria-hidden />
              {busy ? "SENDING…" : "SEND DAILY UPDATE"}
            </button>
          </>
        )}
      </main>

      <div className="mt-6 flex gap-3">
        <button type="button" className={navBtn} disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          <ChevronLeft className="h-5 w-5" aria-hidden /> Back
        </button>
        <button
          type="button"
          className={navBtn}
          disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
        >
          Next <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {!!(job.next_steps ?? []).length && (
        <div className="mt-6 space-y-3">
          <p className="text-base font-semibold">WORK TO DO NEXT</p>
          {(job.next_steps ?? []).map((s) => (
            <div key={s.id} className="border-2 border-border p-3 text-base">
              <p className="font-semibold">{s.title}</p>
              {s.detail && <p className="mt-1 whitespace-pre-wrap text-sm">{s.detail}</p>}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className={`min-h-[44px] flex-1 border-2 text-sm ${s.status === "in_progress" ? "border-foreground bg-foreground text-background" : "border-border"}`}
                  onClick={() => void markStep(s.id, "in_progress")}
                >
                  Busy with it
                </button>
                <button
                  type="button"
                  className={`min-h-[44px] flex-1 border-2 text-sm ${s.status === "done" ? "border-foreground bg-foreground text-background" : "border-border"}`}
                  onClick={() => void markStep(s.id, "done")}
                >
                  Done
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="mt-6 min-h-[52px] w-full border-2 border-border text-base"
        onClick={() => setShowHistory((v) => !v)}
      >
        {showHistory ? "Hide my past updates" : "See my past updates"}
      </button>

      {showHistory && (
        <div className="mt-4 space-y-3">
          {timeline.map((u: any) => (
            <div key={u.id} className="border-2 border-border p-3 text-base">
              <p className="font-semibold">
                {new Date(`${u.shift_date}T00:00:00`).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })} ·{" "}
                {floorName(u.floor_id)}
              </p>
              {u.work_completed && <p className="mt-1 whitespace-pre-wrap">{u.work_completed}</p>}
              {u.blockers && <p className="mt-1 whitespace-pre-wrap">Problem: {u.blockers}</p>}
              <p className="mt-1 text-sm text-muted-foreground">
                {(job?.photos ?? []).filter((ph: any) => ph.update_id === u.id).length} photo(s)
              </p>
              {u.photos_outstanding && <p className="mt-1 text-sm text-muted-foreground">Photos still needed</p>}
              <p className="mt-1 text-sm text-muted-foreground">Sent {new Date(u.submitted_at).toLocaleDateString("en-ZA")}</p>
            </div>
          ))}
          {!timeline.length && <p className="text-base text-muted-foreground">Nothing yet.</p>}
        </div>
      )}

      {!!floors.some((f) => f.drawing_url) && (
        <div className="mt-6 space-y-2">
          <p className="text-base font-semibold">Drawings</p>
          {floors
            .filter((f) => f.drawing_url)
            .map((f) => (
              <a
                key={f.id}
                href={f.drawing_url!}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[52px] items-center border-2 border-border px-3 text-base"
              >
                {f.display_name}
              </a>
            ))}
        </div>
      )}

      {/* Read-only: drawings and instructions the office released to the technician. */}
      {!!(job?.documents ?? []).length && (
        <div className="mt-6 space-y-2">
          <p className="text-base font-semibold">Drawings &amp; documents</p>
          {(job?.documents ?? []).map((d) => (
            <a
              key={d.id}
              href={d.url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[52px] flex-col justify-center border-2 border-border px-3 py-2 text-base"
            >
              <span>
                {d.title}
                {d.revision ? ` — Rev ${d.revision}` : ""}
              </span>
              <span className="text-sm text-muted-foreground">
                {[d.category, d.floor_id ? floorName(d.floor_id) : "Whole project", d.reference].filter(Boolean).join(" · ")}
              </span>
            </a>
          ))}
          <p className="text-sm text-muted-foreground">View only — the office manages the official drawings.</p>
        </div>
      )}
    </div>
  );
};

export default FieldJobPage;
