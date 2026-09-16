import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { applyGuestPrivacyMeta } from "@/lib/shareLinks";
import { linkMessage, loadClientProgress, type ClientProgress } from "@/lib/siteDeliveryClient";

const NOT_REPORTED = "Not yet reported";

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }) : NOT_REPORTED;

const fmtStamp = (v?: string | null) =>
  v ? new Date(v).toLocaleString("en-ZA", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : NOT_REPORTED;

const titleCase = (v: string) => v.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const Metric: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="border border-border bg-background p-4">
    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    <p className="mt-2 text-lg font-semibold leading-tight sm:text-xl">{value}</p>
    {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

const SectionHeading: React.FC<{ children: React.ReactNode; note?: string }> = ({ children, note }) => (
  <div className="mb-4 border-b border-border pb-2">
    <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">{children}</h2>
    {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
  </div>
);

/**
 * Read-only client progress report. It only ever receives updates, photos,
 * issues, additional-works items and documents that the office has approved and
 * marked client-visible. No pricing, costs, margins or internal notes are part
 * of the payload at all.
 */
const SiteProgressPage: React.FC = () => {
  const { token = "" } = useParams();
  const [data, setData] = useState<ClientProgress | null>(null);

  useEffect(() => {
    applyGuestPrivacyMeta();
    loadClientProgress(token)
      .then(setData)
      .catch(() => setData({ state: "unavailable" }));
  }, [token]);

  useEffect(() => {
    if (data?.project?.title) document.title = `${data.project.title} — site progress`;
  }, [data?.project?.title]);

  const floorName = (id: string | null) => data?.floors?.find((f) => f.id === id)?.display_name ?? "Whole site";

  const days = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const u of data?.updates ?? []) {
      const list = map.get(u.shift_date) ?? [];
      list.push(u);
      map.set(u.shift_date, list);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [data?.updates]);

  /** Photo gallery grouped by work date, then by floor / area. */
  const gallery = useMemo(() => {
    const byUpdate = new Map<string, any>((data?.updates ?? []).map((u: any) => [u.id, u]));
    const groups = new Map<string, { date: string; area: string; photos: any[] }>();
    for (const ph of data?.photos ?? []) {
      const u = ph.update_id ? byUpdate.get(ph.update_id) : null;
      const date = u?.shift_date ?? ph.taken_at?.slice(0, 10) ?? "";
      const area = [floorName(ph.floor_id ?? u?.floor_id ?? null), u?.area_label].filter(Boolean).join(" · ");
      const key = `${date}|${area}`;
      const group = groups.get(key) ?? { date, area, photos: [] };
      group.photos.push(ph);
      groups.set(key, group);
    }
    return [...groups.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data?.photos, data?.updates, data?.floors]);

  const metrics = useMemo(() => {
    const updates = data?.updates ?? [];
    const cable = updates.filter((u: any) => /cabl/i.test(`${u.category ?? ""} ${u.work_completed ?? ""}`)).length;
    const routing = updates.filter((u: any) => /rout|contain|pvc|tray|conduit/i.test(`${u.category ?? ""} ${u.work_completed ?? ""}`)).length;
    const openIssues = (data?.issues ?? []).filter((i: any) => i.status === "open" || i.status === "in_progress").length;
    return { days: updates.length, cable, routing, openIssues, photos: (data?.photos ?? []).length };
  }, [data?.updates, data?.issues, data?.photos]);

  if (!data) return <p className="p-8 text-center text-sm text-muted-foreground">Loading project progress…</p>;
  if (data.state !== "ok")
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Siyakha Technology Solutions</p>
        <p className="mt-3 text-sm">{linkMessage(data.state)}</p>
      </div>
    );

  const p = data.project!;
  const currentArea =
    data.current_area && (data.current_area.floor_id || data.current_area.area_label)
      ? [floorName(data.current_area.floor_id), data.current_area.area_label].filter(Boolean).join(" · ")
      : NOT_REPORTED;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        {/* ------------------------------------------------ executive header */}
        <header className="border border-border bg-background p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Siyakha Technology Solutions · Live project progress report
              </p>
              <h1 className="mt-3 text-xl font-semibold uppercase leading-tight tracking-tight sm:text-3xl">{p.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {[p.reference, p.site_name, p.site_location, p.client_name].filter(Boolean).join(" · ") || "Project details to follow"}
              </p>
            </div>
            <div className="border border-border px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Last updated</p>
              <p className="text-sm font-semibold">{fmtStamp(data.last_published_at ?? data.generated_at)}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Approved data only</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Metric label="Project status" value={p.status ? titleCase(p.status) : NOT_REPORTED} />
            <Metric label="Overall progress" value={`${data.overall_progress ?? 0}%`} hint="Average of reported floors" />
            <Metric label="Last site update" value={fmtDate(data.last_updated)} />
            <Metric label="Current floor / area" value={currentArea} />
            <Metric label="Next planned activity" value={data.next_activity ? "Planned" : NOT_REPORTED} hint={data.next_activity ?? undefined} />
          </dl>
        </header>

        {/* ------------------------------------------------------ floor cards */}
        <section className="mt-8">
          <SectionHeading note="Reported progress per floor. Point counts appear only where they have been reported from site.">
            Floor progress
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(data.floors ?? []).map((f) => (
              <article key={f.id} className="border border-border bg-background p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-semibold">{f.display_name}</h3>
                  <span className="text-sm font-semibold">
                    {typeof f.progress_pct === "number" ? `${f.progress_pct}%` : NOT_REPORTED}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-muted">
                  <div className="h-1.5 bg-foreground" style={{ width: `${f.progress_pct ?? 0}%` }} />
                </div>
                <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {f.status ? titleCase(f.status) : NOT_REPORTED}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{f.note ? f.note : `Points completed: ${NOT_REPORTED}`}</p>
              </article>
            ))}
            {!data.floors?.length && (
              <p className="text-sm text-muted-foreground">Floor progress will appear here once reported from site.</p>
            )}
          </div>
        </section>

        {/* --------------------------------------------------------- metrics */}
        <section className="mt-8">
          <SectionHeading note="Based only on approved site submissions — nothing is estimated.">Progress metrics</SectionHeading>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Metric label="Points completed" value={NOT_REPORTED} />
            <Metric label="Reported site days" value={metrics.days ? String(metrics.days) : NOT_REPORTED} />
            <Metric label="Cabling work days" value={metrics.cable ? String(metrics.cable) : NOT_REPORTED} />
            <Metric label="Routing / containment days" value={metrics.routing ? String(metrics.routing) : NOT_REPORTED} />
            <Metric label="Open blockers" value={String(metrics.openIssues)} hint={`${metrics.photos} approved photo(s) on file`} />
          </div>
        </section>

        {/* ---------------------------------------------------------- issues */}
        {!!data.issues?.length && (
          <section className="mt-8">
            <SectionHeading>Current issues &amp; blockers</SectionHeading>
            <div className="space-y-3">
              {data.issues.map((i: any) => (
                <article key={i.id} className="border border-foreground bg-background p-4">
                  <p className="text-sm font-semibold">{i.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {floorName(i.floor_id)} · {titleCase(i.severity)} · {titleCase(i.status)} · Raised {fmtDate(i.opened_at)}
                  </p>
                  {i.description && <p className="mt-2 text-sm">{i.description}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------ daily timeline */}
        <section className="mt-8">
          <SectionHeading note="Grouped by the date the work was carried out on site.">Daily progress</SectionHeading>
          <div className="space-y-6">
            {days.map(([date, rows]) => (
              <div key={date} className="border border-border bg-background p-4">
                <p className="text-sm font-semibold">{fmtDate(date)}</p>
                <div className="mt-3 space-y-4">
                  {rows.map((u: any) => {
                    const photos = (data.photos ?? []).filter((ph) => ph.update_id === u.id);
                    return (
                      <article key={u.id} className="border-l-2 border-foreground pl-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          {u.category ? `${u.category} · ` : ""}
                          {floorName(u.floor_id)}
                          {u.area_label ? ` · ${u.area_label}` : ""} · {u.progress_pct}%
                        </p>
                        {u.work_completed && <p className="mt-2 whitespace-pre-wrap text-sm">{u.work_completed}</p>}
                        {u.work_outstanding && (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">Outstanding: {u.work_outstanding}</p>
                        )}
                        {u.next_shift_plan && (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">Next: {u.next_shift_plan}</p>
                        )}
                        <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {photos.length
                            ? `${photos.length} timestamped photo${photos.length === 1 ? "" : "s"} attached`
                            : "Timestamped photos: not yet reported"}
                        </p>
                        {!!photos.length && (
                          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {photos.map((ph) => (
                              <figure key={ph.id} className="border border-border p-1">
                                {ph.url ? (
                                  <img
                                    src={ph.url}
                                    alt={ph.caption ?? `${ph.category} site photo`}
                                    loading="lazy"
                                    className="h-32 w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-32 w-full bg-muted" />
                                )}
                                <figcaption className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                  {ph.title || ph.category}
                                  {ph.caption ? ` — ${ph.caption}` : ""}
                                  {ph.timestamp_confirmed ? " · Timestamped" : ""}
                                </figcaption>
                              </figure>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
            {!days.length && <p className="text-sm text-muted-foreground">Approved site updates will appear here.</p>}
          </div>
        </section>

        {/* --------------------------------------------------------- gallery */}
        {!!gallery.length && (
          <section className="mt-8">
            <SectionHeading note="Photographs taken on site with the approved Timestamp App and verified by our office.">
              Photo evidence
            </SectionHeading>
            <div className="space-y-5">
              {gallery.map((g) => (
                <div key={`${g.date}|${g.area}`} className="border border-border bg-background p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {fmtDate(g.date)} · {g.area || "Whole site"}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {g.photos.map((ph: any) => (
                      <figure key={ph.id} className="border border-border p-1">
                        {ph.url ? (
                          <img src={ph.url} alt={ph.caption ?? `${ph.category} site photo`} loading="lazy" className="h-28 w-full object-cover" />
                        ) : (
                          <div className="h-28 w-full bg-muted" />
                        )}
                        <figcaption className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {ph.title || ph.category}
                          {ph.caption ? ` — ${ph.caption}` : ""}
                          {ph.timestamp_confirmed ? " · Timestamped" : ""}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------ additional works */}
        {!!data.scope_changes?.length && (
          <section className="mt-8">
            <SectionHeading note="Operational record of work identified outside the agreed scope. No pricing or commercial position is presented here.">
              Additional works / out of scope
            </SectionHeading>
            <div className="space-y-3">
              {data.scope_changes.map((s) => (
                <article key={s.id} className="border border-border bg-background p-4">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {fmtDate(s.work_date)} · {floorName(s.floor_id)}
                    {s.area_label ? ` · ${s.area_label}` : ""} · {titleCase(s.status)}
                  </p>
                  {s.description && <p className="mt-2 whitespace-pre-wrap text-sm">{s.description}</p>}
                  {s.trigger_reason && <p className="mt-2 text-sm text-muted-foreground">Reason: {s.trigger_reason}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------ next steps */}
        <section className="mt-8">
          <SectionHeading>Upcoming / next steps</SectionHeading>
          <div className="border border-border bg-background p-4">
            {data.next_activity ? (
              <p className="whitespace-pre-wrap text-sm">{data.next_activity}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{NOT_REPORTED}</p>
            )}
            {!!data.next_steps?.length && (
              <ul className="mt-4 space-y-2 border-t border-border pt-4">
                {data.next_steps.map((s) => (
                  <li key={s.id} className="text-sm">
                    <span className="font-medium">{s.title}</span>
                    {s.due_date && (
                      <span className="text-muted-foreground"> · target {s.due_date}</span>
                    )}
                    <span className="text-muted-foreground">
                      {" "}
                      · {s.status === "done" ? "Completed" : s.status === "in_progress" ? "In progress" : "Planned"}
                    </span>
                    {s.detail && <p className="mt-0.5 text-muted-foreground">{s.detail}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------- documents */}
        <section className="mt-8">
          <SectionHeading note="Only documents released by Siyakha Technology Solutions appear here.">
            Drawings &amp; documents
          </SectionHeading>
          <div className="border border-border bg-background p-4">
            {data.documents?.length ? (
              <ul className="space-y-2 text-sm">
                {data.documents.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
                    <span>
                      {d.url ? (
                        <a href={d.url} target="_blank" rel="noreferrer" className="underline">
                          {d.title}
                        </a>
                      ) : (
                        d.title
                      )}
                      {d.revision ? <span className="text-muted-foreground"> · Rev {d.revision}</span> : null}
                      {d.reference ? <span className="text-muted-foreground"> · {d.reference}</span> : null}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{fmtDate(d.document_date)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No documents released yet — drawings will be published here.</p>
            )}
          </div>
        </section>

        <footer className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            Prepared by Siyakha Technology Solutions · 087 723 9183 · Report generated {fmtStamp(data.generated_at)}.
          </p>
          <p className="mt-1">
            This page shows approved site information only and is confidential to the named project stakeholders.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SiteProgressPage;
