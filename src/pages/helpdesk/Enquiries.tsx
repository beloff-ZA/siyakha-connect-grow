import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/helpdesk/AdminLayout";
import { Loader2, Mail, Phone, MessageCircle, RefreshCw } from "lucide-react";
import {
  LEAD_STATUSES,
  filterLeads,
  listWebsiteLeads,
  updateWebsiteLead,
  type LeadFilters,
  type LeadStatus,
  type WebsiteLead,
} from "@/lib/leadsApi";
import { LEAD_LOCATIONS, LEAD_SERVICES } from "@/lib/leadForm";
import { CONTACT } from "@/lib/contact";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });

/** Owner lead-management view. Reads are RLS-restricted to admin users. */
const Enquiries = () => {
  const [leads, setLeads] = useState<WebsiteLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({ status: "all", service: "all", location: "all", source: "all" });
  const [openId, setOpenId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setLeads(await listWebsiteLeads());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load enquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const sources = useMemo(
    () => Array.from(new Set(leads.map((l) => l.source).filter(Boolean) as string[])).sort(),
    [leads],
  );
  const visible = useMemo(() => filterLeads(leads, filters), [leads, filters]);
  const counts = useMemo(() => {
    const map = { total: leads.length } as Record<string, number>;
    for (const status of LEAD_STATUSES) map[status] = leads.filter((l) => l.status === status).length;
    return map;
  }, [leads]);

  const patch = async (lead: WebsiteLead, changes: { status?: LeadStatus; follow_up_notes?: string | null }) => {
    setSavingId(lead.id);
    try {
      await updateWebsiteLead(lead.id, changes);
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, ...changes } as WebsiteLead : l)));
      toast.success("Lead updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  };

  const selectCls =
    "border border-foreground/20 bg-background px-3 py-2 text-sm min-h-[40px] focus:outline-none focus:border-foreground";

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-light tracking-tight">Website Enquiries</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Leads captured by the public enquiry form. {counts.total} total · {counts.new ?? 0} new
            </p>
          </div>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 border border-foreground/20 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-foreground/[0.04] min-h-[40px]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            placeholder="Search name, company, email, description…"
            value={filters.search ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className={`${selectCls} lg:col-span-2`}
          />
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className={selectCls}>
            <option value="all">All statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <select value={filters.service} onChange={(e) => setFilters((f) => ({ ...f, service: e.target.value }))} className={selectCls}>
            <option value="all">All services</option>
            {LEAD_SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} className={selectCls}>
            <option value="all">All locations</option>
            {LEAD_LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select value={filters.source} onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))} className={selectCls}>
            <option value="all">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="date"
            aria-label="From date"
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
            className={selectCls}
          />
          <input
            type="date"
            aria-label="To date"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                to: e.target.value ? new Date(`${e.target.value}T23:59:59`).toISOString() : undefined,
              }))
            }
            className={selectCls}
          />
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-10">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading enquiries…
          </div>
        )}
        {error && <p className="border border-foreground/20 p-4 text-sm">{error}</p>}
        {!loading && !error && visible.length === 0 && (
          <p className="border border-dashed border-foreground/20 p-8 text-sm text-muted-foreground">
            No enquiries match these filters yet.
          </p>
        )}

        <div className="space-y-3">
          {visible.map((lead) => {
            const open = openId === lead.id;
            const waDigits = (lead.whatsapp ?? lead.phone ?? "").replace(/[^\d]/g, "");
            return (
              <article key={lead.id} className="border border-foreground/15">
                <button
                  onClick={() => setOpenId(open ? null : lead.id)}
                  className="w-full text-left p-4 hover:bg-foreground/[0.03] min-h-[44px]"
                  aria-expanded={open}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] border border-foreground/30 px-2 py-0.5">
                      {STATUS_LABEL[lead.status]}
                    </span>
                    <span className="font-medium">{lead.full_name}</span>
                    {lead.company && <span className="text-sm text-muted-foreground">· {lead.company}</span>}
                    <span className="text-sm text-muted-foreground">· {lead.service}</span>
                    <span className="text-sm text-muted-foreground">· {lead.location}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{fmtDate(lead.created_at)}</span>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-foreground/15 p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <dl className="space-y-1">
                        <div>
                          <dt className="inline text-muted-foreground">Email: </dt>
                          <dd className="inline">{lead.work_email}</dd>
                        </div>
                        <div>
                          <dt className="inline text-muted-foreground">Phone: </dt>
                          <dd className="inline">{lead.phone ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="inline text-muted-foreground">WhatsApp: </dt>
                          <dd className="inline">{lead.whatsapp ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="inline text-muted-foreground">Focus areas: </dt>
                          <dd className="inline">
                            {lead.focus_areas?.length ? lead.focus_areas.join(", ") : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline text-muted-foreground">Budget: </dt>
                          <dd className="inline">{lead.budget_range ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="inline text-muted-foreground">Timeline: </dt>
                          <dd className="inline">{lead.timeline ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="inline text-muted-foreground">Consent: </dt>
                          <dd className="inline">{lead.consent ? "Yes" : "No"}</dd>
                        </div>
                      </dl>
                      <dl className="space-y-1 text-xs text-muted-foreground">
                        <div>Source: {lead.source ?? "—"}</div>
                        <div>Landing page: {lead.landing_page ?? "—"}</div>
                        <div>Referrer: {lead.referrer ?? "—"}</div>
                        <div>
                          UTM: {lead.utm_source ?? "—"} / {lead.utm_medium ?? "—"} / {lead.utm_campaign ?? "—"}
                        </div>
                        <div>
                          UTM term/content: {lead.utm_term ?? "—"} / {lead.utm_content ?? "—"}
                        </div>
                        <div>gclid: {lead.gclid ?? "—"}</div>
                        <div>
                          Notification: {lead.notification_status ?? "—"}
                          {lead.notification_error ? ` (${lead.notification_error.slice(0, 120)})` : ""}
                        </div>
                      </dl>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Enquiry</p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{lead.project_description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                          className="inline-flex items-center gap-2 border border-foreground/20 px-4 py-2 text-xs uppercase tracking-[0.2em] min-h-[40px]"
                        >
                          <Phone className="h-3.5 w-3.5" /> Call
                        </a>
                      )}
                      <a
                        href={`mailto:${lead.work_email}?subject=${encodeURIComponent(
                          `Siyakha Technology — your ${lead.service} enquiry`,
                        )}`}
                        className="inline-flex items-center gap-2 border border-foreground/20 px-4 py-2 text-xs uppercase tracking-[0.2em] min-h-[40px]"
                      >
                        <Mail className="h-3.5 w-3.5" /> Email
                      </a>
                      {waDigits && (
                        <a
                          href={`https://wa.me/${waDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 border border-foreground/20 px-4 py-2 text-xs uppercase tracking-[0.2em] min-h-[40px]"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 items-start">
                      <label className="text-sm">
                        <span className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                          Status
                        </span>
                        <select
                          value={lead.status}
                          onChange={(e) => void patch(lead, { status: e.target.value as LeadStatus })}
                          className={`${selectCls} w-full`}
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                          Follow-up notes
                        </span>
                        <textarea
                          rows={3}
                          value={noteDraft[lead.id] ?? lead.follow_up_notes ?? ""}
                          onChange={(e) => setNoteDraft((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                          className={`${selectCls} w-full resize-none`}
                        />
                        <button
                          onClick={() =>
                            void patch(lead, { follow_up_notes: noteDraft[lead.id] ?? lead.follow_up_notes ?? "" })
                          }
                          disabled={savingId === lead.id}
                          className="mt-2 inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50 min-h-[40px]"
                        >
                          {savingId === lead.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save notes
                        </button>
                      </label>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Enquiry notifications are emailed to {CONTACT.email}. Leads are always stored even if email delivery fails.
        </p>
      </div>
    </AdminLayout>
  );
};

export default Enquiries;
