import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { applyGuestPrivacyMeta } from "@/lib/shareLinks";
import { linkMessage, loadClientProgress, type ClientProgress } from "@/lib/siteDeliveryClient";

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/**
 * Read-only client progress portal. It only ever receives updates, photos and
 * issues the office has approved and marked client-visible — costs, margins and
 * internal notes are never part of the payload.
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

  if (!data) return <p className="p-8 text-center text-sm text-muted-foreground">Loading project progress…</p>;
  if (data.state !== "ok")
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Siyakha Technology Solutions</p>
        <p className="mt-3 text-sm">{linkMessage(data.state)}</p>
      </div>
    );

  const p = data.project!;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="border-b border-border pb-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Delivered by Siyakha Technology Solutions
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{p.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {[p.reference, p.site_name, p.site_location].filter(Boolean).join(" · ")}
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Overall progress", `${data.overall_progress ?? 0}%`],
            ["Status", p.status ?? "In progress"],
            ["Last site update", fmtDate(data.last_updated)],
            ["Target completion", fmtDate(p.target_date)],
          ].map(([k, v]) => (
            <div key={k} className="border border-border p-3">
              <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-lg font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="mt-8">
        <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Progress by floor</h2>
        <div className="mt-3 space-y-2">
          {(data.floors ?? []).map((f) => (
            <div key={f.id} className="border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{f.display_name}</span>
                <span className="text-sm">{f.progress_pct}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-muted">
                <div className="h-1.5 bg-foreground" style={{ width: `${f.progress_pct}%` }} />
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">{f.status.replace("_", " ")}</p>
            </div>
          ))}
          {!data.floors?.length && <p className="text-sm text-muted-foreground">Floor progress will appear here.</p>}
        </div>
      </section>

      {!!data.issues?.length && (
        <section className="mt-8">
          <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Current blockers</h2>
          <div className="mt-3 space-y-2">
            {data.issues.map((i: any) => (
              <div key={i.id} className="border border-foreground p-3">
                <p className="text-sm font-semibold">{i.title}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {floorName(i.floor_id)} · {i.severity} · {i.status.replace("_", " ")}
                </p>
                {i.description && <p className="mt-2 text-sm">{i.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Site progress diary</h2>
        <div className="mt-3 space-y-6">
          {days.map(([date, rows]) => (
            <div key={date}>
              <p className="text-sm font-semibold">{fmtDate(date)}</p>
              <div className="mt-2 space-y-3">
                {rows.map((u: any) => {
                  const photos = (data.photos ?? []).filter((ph) => ph.update_id === u.id);
                  return (
                    <article key={u.id} className="border border-border p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {u.category ? `${u.category} · ` : ""}
                        {floorName(u.floor_id)}
                        {u.area_label ? ` · ${u.area_label}` : ""} · {u.progress_pct}%
                      </p>
                      {u.work_completed && <p className="mt-2 whitespace-pre-wrap text-sm">{u.work_completed}</p>}
                      {u.work_outstanding && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                          Outstanding: {u.work_outstanding}
                        </p>
                      )}
                      {u.next_shift_plan && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">Next: {u.next_shift_plan}</p>
                      )}
                      {u.photos_outstanding && (
                        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">Progress photos to follow</p>
                      )}
                      {false && (
                        <p />
                      )}
                      {!!photos.length && (
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {photos.map((ph) => (
                            <figure key={ph.id} className="border border-border p-1">
                              {ph.url ? (
                                <img src={ph.url} alt={ph.caption ?? `${ph.category} site photo`} loading="lazy" className="h-32 w-full object-cover" />
                              ) : (
                                <div className="h-32 w-full bg-muted" />
                              )}
                              <figcaption className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                {ph.category}
                                {ph.caption ? ` — ${ph.caption}` : ""}
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

      {!!data.documents?.length && (
        <section className="mt-8">
          <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Drawings & documents</h2>
          <ul className="mt-3 space-y-2">
            {data.documents.map((d) => (
              <li key={d.id} className="border border-border p-3 text-sm">
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noreferrer" className="underline">
                    {d.title}
                  </a>
                ) : (
                  d.title
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
        Prepared by Siyakha Technology Solutions · 087 723 9183 · This page is confidential and for the named project
        stakeholders only.
      </footer>
    </div>
  );
};

export default SiteProgressPage;
