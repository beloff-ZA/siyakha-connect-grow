import React from "react";
import { SIYAKHA } from "@/lib/proposals";
import { NOT_REPORTED, type ReportPhoto, type SiteReport } from "@/lib/dailyReport";
import { scopeStatusLabel } from "@/lib/siteDelivery";
import { stepStatusLabel } from "@/lib/nextSteps";

/**
 * Printable client report. Uses the exact same report object as the on-screen
 * preview and the client link, so there is only ever one set of numbers. No
 * pricing, costs or internal notes exist in this document.
 */

const day = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-ZA", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

const Row: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="mb-2">
    <p className="text-[7.5pt] uppercase tracking-[0.16em] text-neutral-500">{label}</p>
    <p className="whitespace-pre-wrap text-[9.5pt]">{value?.trim() ? value : NOT_REPORTED}</p>
  </div>
);

const DailyReportDocument: React.FC<{ report: SiteReport; photoUrls?: Record<string, string> }> = ({
  report,
  photoUrls = {},
}) => {
  const range = report.from === report.to ? day(report.from) : `${day(report.from)} — ${day(report.to)}`;
  const photo = (p: ReportPhoto) => (
    <div key={p.id} className="print-block w-[48%] border border-neutral-300 p-2">
      {photoUrls[p.id] ? (
        <img src={photoUrls[p.id]} alt={p.title} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-neutral-100 text-[8pt] text-neutral-500">
          Photograph on file
        </div>
      )}
      <p className="mt-1 text-[9pt] font-semibold">{p.title}</p>
      {p.description && <p className="text-[8.5pt]">{p.description}</p>}
      <p className="text-[8pt] text-neutral-600">
        {day(p.work_date)}
        {p.floor ? ` · ${p.floor}` : ""}
      </p>
      <p className="text-[8pt] text-neutral-600">
        {p.timestamp_confirmed ? "Timestamp App evidence confirmed" : "Timestamp evidence not confirmed"}
      </p>
    </div>
  );

  return (
    <article className="doc-root bg-white text-black">
      <header className="mb-6 border-b-2 border-black pb-3">
        <p className="text-[14pt] font-bold uppercase tracking-[0.14em]">{SIYAKHA.company}</p>
        <p className="mt-1 text-[11pt] font-semibold uppercase tracking-[0.16em]">{report.project_title}</p>
        <p className="mt-1 text-[10pt] font-semibold uppercase tracking-[0.18em]">Daily Site Progress Report</p>
        <p className="mt-2 text-[9pt] text-neutral-700">
          {range}
          {report.project_reference ? ` · Project reference ${report.project_reference}` : ""}
          {report.client_name ? ` · ${report.client_name}` : ""}
          {report.site_label ? ` · ${report.site_label}` : ""}
        </p>
        <p className="mt-1 text-[8pt] text-neutral-500">
          {SIYAKHA.phone} · {SIYAKHA.email} · {SIYAKHA.website}
        </p>
      </header>

      {report.overall_progress !== null && (
        <section className="print-block mb-5">
          <p className="mb-1 text-[10pt] font-semibold uppercase tracking-[0.1em]">Progress recorded</p>
          <p className="text-[9.5pt]">Overall {report.overall_progress}%</p>
          <ul className="mt-1 text-[9pt]">
            {report.floor_progress.map((f) => (
              <li key={f.floor}>
                {f.floor} — {f.progress_pct}% ({f.status.replace(/_/g, " ")})
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.days.length ? (
        report.days.map((d) => (
          <section key={d.work_date} className="print-block mb-6 border-t border-neutral-300 pt-3">
            <p className="mb-2 text-[10pt] font-semibold uppercase tracking-[0.1em]">{day(d.work_date)}</p>
            <Row label="Site team" value={d.team} />
            <Row label="Floor / area" value={d.floors.join(", ")} />
            <Row label="Activity" value={d.categories.join(", ")} />
            <Row label="Work completed" value={d.work_completed} />
            <Row label="Work outstanding" value={d.work_outstanding} />
            <Row label="Materials / quantities supplied" value={d.quantities} />
            <Row label="Problems / blockers" value={d.blockers} />
            <Row label="Site notes" value={d.notes} />
            {!!d.photos.length && (
              <>
                <p className="mb-2 mt-3 text-[9pt] font-semibold uppercase tracking-[0.14em]">Photographs</p>
                <div className="flex flex-wrap gap-3">{d.photos.map(photo)}</div>
              </>
            )}
          </section>
        ))
      ) : (
        <p className="text-[9.5pt]">No site activity recorded for this date.</p>
      )}

      {!!report.issues.length && (
        <section className="print-block mb-6">
          <p className="mb-1 text-[10pt] font-semibold uppercase tracking-[0.1em]">Problems on site</p>
          <ul className="text-[9pt]">
            {report.issues.map((i) => (
              <li key={i.id} className="mb-1">
                <span className="font-semibold">{i.title}</span>
                {i.floor ? ` · ${i.floor}` : ""} · {i.status.replace(/_/g, " ")}
                {i.description ? ` — ${i.description}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!report.scope_items.length && (
        <section className="print-block mb-6">
          <p className="mb-1 text-[10pt] font-semibold uppercase tracking-[0.1em]">Additional works identified</p>
          <p className="mb-1 text-[8pt] text-neutral-600">
            Operational record only. No pricing or contractual position is implied.
          </p>
          <ul className="text-[9pt]">
            {report.scope_items.map((s) => (
              <li key={s.id} className="mb-1">
                <span className="font-semibold">{s.title}</span>
                {s.floor ? ` · ${s.floor}` : ""} · {scopeStatusLabel(s.status)}
                {s.description ? ` — ${s.description}` : ""}
                {s.trigger_reason ? ` (${s.trigger_reason})` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!report.next_steps.length && (
        <section className="print-block mb-6">
          <p className="mb-1 text-[10pt] font-semibold uppercase tracking-[0.1em]">Next steps</p>
          <ul className="text-[9pt]">
            {report.next_steps.map((s) => (
              <li key={s.id} className="mb-1">
                <span className="font-semibold">{s.title}</span> · {stepStatusLabel(s.status)}
                {s.due_date ? ` · by ${s.due_date}` : ""}
                {s.detail ? ` — ${s.detail}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reference only — the drawing itself is issued separately, never embedded here. */}
      {!!report.drawing_references.length && (
        <section className="print-block mb-6">
          <p className="mb-1 text-[10pt] font-semibold uppercase tracking-[0.1em]">Drawing references</p>
          <ul className="text-[9pt]">
            {report.drawing_references.map((r) => (
              <li key={r} className="mb-0.5">
                {r}
              </li>
            ))}
          </ul>
        </section>
      )}



      <footer className="mt-6 border-t border-neutral-300 pt-2 text-[7.5pt] text-neutral-500">
        Compiled from site records captured on site. Report generated {new Date(report.generated_at).toLocaleString("en-ZA")}.
      </footer>
    </article>
  );
};

export default DailyReportDocument;
