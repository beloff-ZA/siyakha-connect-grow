import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Panel, Stat, Field, Chip, selectCls } from "@/components/pm/ui";
import { signedUrl } from "@/lib/portalFiles";
import { toast } from "@/hooks/use-toast";
import {
  addScopeChange,
  approveUpdate,
  BASELINE_CATEGORIES,
  complianceFlags,
  dailyTimeline,
  deliveryCounts,
  forgetDevice,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  issueDeliveryLink,
  loadSiteDelivery,
  lockUpdate,
  overallProgress,
  patchIssue,
  patchScopeChange,
  regenerateDeliveryLink,
  revokeDeliveryLink,
  setDocumentVisibility,
  SCOPE_SOURCES,
  SCOPE_STATUSES,
  scopeSourceLabel,
  setFloorProgress,
  setUpdateBaseline,
  evidenceState,
  overridePhotoEvidence,
  setPhotoTimestampConfirmed,
  setPhotoVisibility,
  setUpdateVisibility,
  SITE_PHOTO_BUCKET,
  unlockUpdate,
  updatedToday,
  type SiteDeliveryData,
} from "@/lib/siteDelivery";

const btn = "border border-border px-3 py-2 text-[11px] uppercase tracking-[0.18em] hover:bg-muted";
const fmtDay = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-ZA", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

/** Daily site delivery: progress dashboard, approvals and the two guest links. */
const SiteDeliveryTab: React.FC<{ projectId: string; projectTitle: string; clientId: string | null }> = ({
  projectId,
  projectTitle,
  clientId,
}) => {
  const [data, setData] = useState<SiteDeliveryData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [issued, setIssued] = useState<{ field?: string; client?: string }>({});
  const [fieldLabel, setFieldLabel] = useState("Michael (Mike)");
  const [clientLabel, setClientLabel] = useState("Digiconnect / Sun International");
  const [linkDays, setLinkDays] = useState(30);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setData(await loadSiteDelivery(projectId));
    } catch (e: any) {
      setError(e?.message ?? "Could not load site delivery.");
    }
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        data.photos.slice(0, 60).map(async (p) => {
          try {
            return [p.id, await signedUrl(SITE_PHOTO_BUCKET, p.storage_path, 900)] as const;
          } catch {
            return [p.id, ""] as const;
          }
        }),
      );
      if (!cancelled) setThumbs(Object.fromEntries(entries.filter(([, u]) => u)));
    })();
    return () => {
      cancelled = true;
    };
  }, [data]);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      await reload();
      toast({ title: ok });
    } catch (e: any) {
      toast({ title: "That did not work", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const counts = useMemo(() => (data ? deliveryCounts(data) : null), [data]);
  const floorName = (id: string | null) => data?.floors.find((f) => f.id === id)?.display_name ?? "Whole site";
  const timeline = useMemo(() => (data ? dailyTimeline(data.updates) : []), [data]);

  if (error) return <p className="border border-destructive p-3 text-sm text-destructive">{error}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Loading site delivery…</p>;

  return (
    <div className="space-y-6">
      <Panel title="Today on site">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Overall progress" value={`${overallProgress(data.progress)}%`} />
          <Stat label="Today" value={updatedToday(data.updates) ? "Updated" : "Awaiting update"} />
          <Stat label="Updates" value={counts!.updates} hint={`${counts!.awaitingApproval} awaiting approval`} />
          <Stat label="Open issues" value={counts!.openIssues} />
          <Stat label="Photos" value={counts!.photos} hint={`${counts!.daysMissingEvidence} day(s) without evidence`} />
          <Stat label="Days with blockers" value={counts!.blockers} />
        </div>
      </Panel>

      <Panel title="Floor progress">
        <div className="space-y-2">
          {data.floors.map((f) => {
            const p = data.progress.find((x) => x.floor_id === f.id);
            return (
              <div key={f.id} className="flex flex-wrap items-center gap-3 border border-border p-3">
                <span className="min-w-[9rem] text-sm font-medium">{f.display_name}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={p?.progress_pct ?? 0}
                  className="h-9 w-20 border border-input bg-background px-2 text-sm"
                  onBlur={(e) =>
                    run(
                      () => setFloorProgress(projectId, f.id, Number(e.target.value), p?.status ?? "in_progress", p?.note ?? null),
                      "Floor progress saved",
                    )
                  }
                />
                <span className="text-xs text-muted-foreground">%</span>
                <select
                  defaultValue={p?.status ?? "not_started"}
                  className="h-9 w-40 border border-input bg-background px-2 text-sm"
                  onChange={(e) =>
                    run(
                      () => setFloorProgress(projectId, f.id, p?.progress_pct ?? 0, e.target.value, p?.note ?? null),
                      "Floor status saved",
                    )
                  }
                >
                  {["not_started", "in_progress", "snagging", "complete"].map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
                {f.plan_image_path ? <Chip>Drawing attached</Chip> : <Chip>No drawing yet</Chip>}
              </div>
            );
          })}
          {!data.floors.length && <p className="text-sm text-muted-foreground">No floors captured for this project yet.</p>}
        </div>
      </Panel>

      <Panel title="SHARE PROJECT — send these two links">
        <p className="mb-4 text-xs text-muted-foreground">
          Each link is a long random token, not the project address. Mike can open his link straight from WhatsApp with no
          password. The client link is read-only and shows approved information only.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {(["field", "client"] as const).map((role) => {
            const heading = role === "field" ? "Mike — Field update link" : "Client — Progress view link";
            const blurb =
              role === "field"
                ? "Daily site form for the cabling engineer. Can add updates, problems and timestamped photos."
                : "Read-only progress report for Digiconnect / Sun International. No pricing, no internal notes.";
            const live = data.links.filter((l) => l.link_role === role && !l.revoked_at && new Date(l.expires_at) > new Date());
            const label = role === "field" ? fieldLabel : clientLabel;
            const setLabel = role === "field" ? setFieldLabel : setClientLabel;
            const url = issued[role];
            const create = (regenerate: boolean) =>
              run(async () => {
                const input = {
                  project_id: projectId,
                  client_id: clientId,
                  title: projectTitle,
                  role,
                  assignee_label: label,
                  days: linkDays,
                };
                const res = regenerate ? await regenerateDeliveryLink(input, data.links) : await issueDeliveryLink(input);
                setIssued((prev) => ({ ...prev, [role]: res.url }));
              }, regenerate ? "New link created — the old one no longer works" : "Link created");

            return (
              <div key={role} className="border border-foreground p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.14em]">{heading}</p>
                <p className="mt-1 text-xs text-muted-foreground">{blurb}</p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label={role === "field" ? "Engineer" : "Recipient"}>
                    <input className={selectCls} value={label} onChange={(e) => setLabel(e.target.value)} />
                  </Field>
                  <Field label="Valid for (days)">
                    <input
                      type="number"
                      min={1}
                      className={selectCls}
                      value={linkDays}
                      onChange={(e) => setLinkDays(Number(e.target.value))}
                    />
                  </Field>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={busy} className={btn} onClick={() => create(false)}>
                    {live.length ? "Create another link" : "Create link"}
                  </button>
                  {!!live.length && (
                    <button type="button" disabled={busy} className={btn} onClick={() => create(true)}>
                      Regenerate (revokes old)
                    </button>
                  )}
                </div>

                {url && (
                  <div className="mt-3 border border-border p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Copy this now — it is only shown here
                    </p>
                    <p className="mt-1 break-all text-xs">{url}</p>
                    <button
                      type="button"
                      className={`${btn} mt-2`}
                      onClick={() => {
                        navigator.clipboard?.writeText(url);
                        toast({ title: "Link copied" });
                      }}
                    >
                      Copy link
                    </button>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  {data.links
                    .filter((l) => l.link_role === role)
                    .map((l) => {
                      const access = data.access.find((a) => a.share_link_id === l.id);
                      const state = l.revoked_at ? "revoked" : new Date(l.expires_at) < new Date() ? "expired" : "active";
                      return (
                        <div key={l.id} className="flex flex-wrap items-center gap-2 border border-border p-2 text-xs">
                          <Chip>{state}</Chip>
                          <span className="font-medium">{l.assignee_label ?? l.recipient_label ?? "Unnamed"}</span>
                          <span className="text-muted-foreground">
                            opened {l.access_count}× · expires {new Date(l.expires_at).toLocaleDateString("en-ZA")}
                          </span>
                          {access?.device_expires_at && !access.revoked_at && (
                            <button type="button" className={btn} disabled={busy} onClick={() => run(() => forgetDevice(access.id), "Device forgotten")}>
                              Forget device
                            </button>
                          )}
                          {!l.revoked_at && (
                            <button type="button" className={btn} disabled={busy} onClick={() => run(() => revokeDeliveryLink(l.id), "Link revoked")}>
                              Revoke
                            </button>
                          )}
                        </div>
                      );
                    })}
                  {!data.links.some((l) => l.link_role === role) && (
                    <p className="text-xs text-muted-foreground">No link issued yet.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Documents released to the client">
        <p className="mb-3 text-xs text-muted-foreground">
          Nothing appears on the client link until you release it here — drawings included.
        </p>
        <div className="space-y-2">
          {data.documents.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-3 border border-border p-3 text-sm">
              <span className="font-medium">{d.title}</span>
              {d.reference && <Chip>{d.reference}</Chip>}
              {d.category && <Chip>{d.category}</Chip>}
              {d.client_visible && <Chip>Client visible</Chip>}
              <button
                type="button"
                className={btn}
                disabled={busy}
                onClick={() => run(() => setDocumentVisibility(d.id, !d.client_visible), "Document visibility saved")}
              >
                {d.client_visible ? "Hide from client" : "Release to client"}
              </button>
            </div>
          ))}
          {!data.documents.length && (
            <p className="text-sm text-muted-foreground">No project documents uploaded yet.</p>
          )}
        </div>
      </Panel>

      <Panel title="Daily updates & approvals">
        <div className="space-y-5">
          {timeline.map(({ date, rows }) => (
            <div key={date}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Work date · {fmtDay(date)}</p>
              <div className="mt-2 space-y-3">
                {rows.map((u) => {
                  const photos = data.photos.filter((p) => p.update_id === u.id);
                  const evidence = evidenceState(u, data.photos, u.id);
                  return (
                    <div key={u.id} className="border border-border p-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">{u.submitted_by_name}</span>
                        {u.category && <Chip>{u.category}</Chip>}
                        <Chip>{floorName(u.floor_id)}</Chip>
                        <Chip>{evidence.photoCount ? `Photo evidence received (${evidence.photoCount})` : "Photos outstanding"}</Chip>
                        {u.area_label && <Chip>{u.area_label}</Chip>}
                        <Chip>{u.progress_pct}%</Chip>
                        <Chip>{u.approval_status}</Chip>
                        {u.backdated && <Chip>Backdated</Chip>}
                        {u.client_visible && <Chip>Client visible</Chip>}
                        <span className="text-xs text-muted-foreground">
                          Work date {fmtDay(u.shift_date)} · Submitted on {new Date(u.submitted_at).toLocaleString("en-ZA")}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Scope baseline</span>
                        <select
                          className="h-9 border border-input bg-background px-2 text-sm"
                          defaultValue={u.baseline_category ?? ""}
                          onChange={(e) => run(() => setUpdateBaseline(u.id, e.target.value), "Baseline category saved")}
                        >
                          <option value="">Not tagged</option>
                          {BASELINE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className={btn}
                          disabled={busy}
                          onClick={() => {
                            const title = window.prompt("Short title for the additional work identified on this day");
                            if (!title?.trim()) return;
                            run(
                              () =>
                                addScopeChange({
                                  project_id: projectId,
                                  work_date: u.shift_date,
                                  title,
                                  description: u.work_completed ?? undefined,
                                  trigger_reason: u.blockers ?? undefined,
                                  floor_id: u.floor_id,
                                  update_id: u.id,
                                  area_label: u.area_label ?? undefined,
                                  source: u.source === "field" ? "field_update" : "admin_update",
                                  baseline_category: u.baseline_category,
                                  raised_by_name: u.submitted_by_name,
                                }),
                              "Recorded as additional work, under review",
                            );
                          }}
                        >
                          Flag as additional work
                        </button>
                      </div>
                      <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                        {[
                          ["Completed today", u.work_completed],
                          ["Outstanding", u.work_outstanding],
                          ["Blockers", u.blockers],
                          ["Materials required", u.materials_required],
                          ["Team on site", u.team_onsite],
                          ["Next shift", u.next_shift_plan],
                          ["Notes", u.notes],
                        ]
                          .filter(([, v]) => !!v)
                          .map(([k, v]) => (
                            <div key={k as string}>
                              <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{k}</dt>
                              <dd className="whitespace-pre-wrap">{v as string}</dd>
                            </div>
                          ))}
                      </dl>

                      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        {complianceFlags(u, evidence).map((f) => (
                          <li key={f.label} className={f.done ? "text-foreground" : ""}>
                            {f.done ? "✓" : "○"} {f.label}
                          </li>
                        ))}
                        <li>
                          {evidence.confirmedCount}/{evidence.photoCount} timestamp-confirmed
                        </li>
                      </ul>
                      {evidence.overridden && (
                        <p className="mt-2 border border-border p-2 text-[11px]">
                          Photo requirement waived: {u.photo_evidence_override_reason}
                        </p>
                      )}

                      {!!photos.length && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {photos.map((p) => (
                            <div key={p.id} className="w-28 border border-border p-1">
                              {thumbs[p.id] ? (
                                <img src={thumbs[p.id]} alt={p.caption ?? `${p.category} photo`} className="h-20 w-full object-cover" />
                              ) : (
                                <div className="h-20 w-full bg-muted" />
                              )}
                              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{p.category}</p>
                              {p.caption && <p className="text-[11px]">{p.caption}</p>}
                              <p className="text-[10px] text-muted-foreground">
                                {p.timestamp_confirmed ? "Timestamp confirmed" : "Timestamp not confirmed"}
                                {p.exif_captured_at ? ` · ${new Date(p.exif_captured_at).toLocaleString("en-ZA")}` : ""}
                              </p>
                              <button
                                type="button"
                                className="mt-1 w-full border border-border py-1 text-[10px] uppercase tracking-[0.14em]"
                                disabled={busy}
                                onClick={() =>
                                  run(() => setPhotoTimestampConfirmed(p.id, !p.timestamp_confirmed), "Timestamp evidence saved")
                                }
                              >
                                {p.timestamp_confirmed ? "Unconfirm timestamp" : "Confirm timestamp"}
                              </button>
                              <button
                                type="button"
                                className="mt-1 w-full border border-border py-1 text-[10px] uppercase tracking-[0.14em]"
                                disabled={busy}
                                onClick={() => run(() => setPhotoVisibility(p.id, !p.client_visible), "Photo visibility saved")}
                              >
                                {p.client_visible ? "Hide from client" : "Show client"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {u.approval_status === "submitted" && (
                          <>
                            <button
                              type="button"
                              className={btn}
                              disabled={busy}
                              onClick={() => run(() => approveUpdate(u.id, true, evidence), "Approved and published")}
                            >
                              Approve + show client
                            </button>
                            <button type="button" className={btn} disabled={busy} onClick={() => run(() => approveUpdate(u.id, false), "Approved internally")}>
                              Approve internally
                            </button>
                          </>
                        )}
                        {u.approval_status !== "submitted" && (
                          <button
                            type="button"
                            className={btn}
                            disabled={busy}
                            onClick={() => run(() => setUpdateVisibility(u.id, !u.client_visible, evidence), "Visibility saved")}
                          >
                            {u.client_visible ? "Hide from client" : "Show client"}
                          </button>
                        )}
                        {!evidence.satisfied && (
                          <button
                            type="button"
                            className={btn}
                            disabled={busy}
                            onClick={() => {
                              const reason = window.prompt("Why is this day being published without photo evidence?");
                              if (reason?.trim()) run(() => overridePhotoEvidence(u.id, reason), "Override recorded");
                            }}
                          >
                            Waive photo requirement
                          </button>
                        )}
                        {u.approval_status === "locked" ? (
                          <button type="button" className={btn} disabled={busy} onClick={() => run(() => unlockUpdate(u.id), "Unlocked for edits")}>
                            Unlock
                          </button>
                        ) : (
                          <button type="button" className={btn} disabled={busy} onClick={() => run(() => lockUpdate(u.id), "Update locked")}>
                            Lock
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {!data.updates.length && <p className="text-sm text-muted-foreground">No site updates submitted yet.</p>}
        </div>
      </Panel>

      <Panel title="Issues & blockers">
        <div className="space-y-3">
          {data.issues.map((i) => (
            <div key={i.id} className="border border-border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{i.title}</span>
                <Chip>{floorName(i.floor_id)}</Chip>
                <Chip>{i.severity}</Chip>
                <Chip>{i.status}</Chip>
                {i.client_visible && <Chip>Client visible</Chip>}
              </div>
              {i.description && <p className="mt-1 whitespace-pre-wrap">{i.description}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  className="h-9 border border-input bg-background px-2 text-sm"
                  defaultValue={i.status}
                  onChange={(e) => run(() => patchIssue(i.id, { status: e.target.value }), "Issue status saved")}
                >
                  {ISSUE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <select
                  className="h-9 border border-input bg-background px-2 text-sm"
                  defaultValue={i.severity}
                  onChange={(e) => run(() => patchIssue(i.id, { severity: e.target.value }), "Severity saved")}
                >
                  {ISSUE_SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={btn}
                  disabled={busy}
                  onClick={() =>
                    run(() => patchIssue(i.id, { client_visible: !i.client_visible, internal_only: i.client_visible }), "Visibility saved")
                  }
                >
                  {i.client_visible ? "Hide from client" : "Show client"}
                </button>
              </div>
            </div>
          ))}
          {!data.issues.length && <p className="text-sm text-muted-foreground">No issues reported.</p>}
        </div>
      </Panel>

      <Panel title="Additional works identified on site (operational record — no pricing)">
        <p className="mb-3 text-xs text-muted-foreground">
          Work identified outside the agreed scope of works. This register carries no rates, costs or totals. Items stay under
          review until you decide otherwise.
        </p>
        <div className="space-y-3">
          {data.scopeChanges.map((s) => (
            <div key={s.id} className="border border-border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{s.title}</span>
                <Chip>{fmtDay(s.work_date)}</Chip>
                <Chip>{floorName(s.floor_id)}</Chip>
                <Chip>{scopeSourceLabel(s.source)}</Chip>
                {s.baseline_category && <Chip>{s.baseline_category}</Chip>}
                {s.client_visible && <Chip>Client visible</Chip>}
              </div>
              {s.description && <p className="mt-1 whitespace-pre-wrap">{s.description}</p>}
              {s.trigger_reason && (
                <p className="mt-1 text-xs text-muted-foreground">Why it came up: {s.trigger_reason}</p>
              )}
              {s.internal_notes && <p className="mt-1 text-xs text-muted-foreground">Office note: {s.internal_notes}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  className="h-9 border border-input bg-background px-2 text-sm"
                  defaultValue={s.status}
                  onChange={(e) => run(() => patchScopeChange(s.id, { status: e.target.value }), "Status saved")}
                >
                  {SCOPE_STATUSES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  className="h-9 border border-input bg-background px-2 text-sm"
                  defaultValue={s.source}
                  onChange={(e) => run(() => patchScopeChange(s.id, { source: e.target.value }), "Source saved")}
                >
                  {SCOPE_SOURCES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={btn}
                  disabled={busy}
                  onClick={() => run(() => patchScopeChange(s.id, { client_visible: !s.client_visible }), "Visibility saved")}
                >
                  {s.client_visible ? "Hide from client" : "Show client"}
                </button>
              </div>
            </div>
          ))}
          {!data.scopeChanges.length && (
            <p className="text-sm text-muted-foreground">No additional works recorded.</p>
          )}
        </div>
      </Panel>
    </div>
  );
};

export default SiteDeliveryTab;
