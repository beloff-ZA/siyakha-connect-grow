import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { statusLabel } from "@/hooks/usePortal";

type Row = Record<string, any>;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="border border-border p-5 md:p-6 mb-6">
    <h3 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-4">{title}</h3>
    {children}
  </section>
);

const selectCls = "h-10 border border-input bg-background px-3 text-sm w-full";

/**
 * Portfolio view for Siyakha administrators: client organisations, their sites,
 * project-to-site linkage and the onboarding registration queue.
 */
const SitesManager: React.FC = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Row[]>([]);
  const [sites, setSites] = useState<Row[]>([]);
  const [projects, setProjects] = useState<Row[]>([]);
  const [registrations, setRegistrations] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [clientFilter, setClientFilter] = useState("");

  const fail = (e: unknown) =>
    toast({
      title: "Action failed",
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive" as never,
    });

  const load = useCallback(async () => {
    const [c, s, p, r] = await Promise.all([
      supabase.from("portal_clients").select("*").order("display_name"),
      supabase.from("portal_sites").select("*").order("name"),
      supabase.from("portal_projects").select("id, title, client_id, site_id, status").order("created_at"),
      supabase.from("portal_registrations").select("*").order("created_at", { ascending: false }),
    ]);
    setClients(c.data ?? []);
    setSites(s.data ?? []);
    setProjects(p.data ?? []);
    setRegistrations(r.data ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clientName = (id: string | null) => clients.find((c) => c.id === id)?.display_name ?? "—";

  const visibleSites = useMemo(
    () => (clientFilter ? sites.filter((s) => s.client_id === clientFilter) : sites),
    [sites, clientFilter],
  );

  /* -------------------------------- new site ------------------------------- */
  const [newSite, setNewSite] = useState({
    client_id: "",
    name: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    venue_type: "",
    budget_reference: "",
    notes: "",
  });

  const createSite = async () => {
    if (!newSite.client_id || !newSite.name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("portal_sites").insert({
      client_id: newSite.client_id,
      name: newSite.name.trim(),
      address: newSite.address.trim() || null,
      city: newSite.city.trim() || null,
      province: newSite.province.trim() || null,
      postal_code: newSite.postal_code.trim() || null,
      venue_type: newSite.venue_type.trim() || null,
      budget_reference: newSite.budget_reference ? Number(newSite.budget_reference) : null,
      notes: newSite.notes.trim() || null,
    });
    setBusy(false);
    if (error) return fail(error);
    setNewSite({ ...newSite, name: "", address: "", city: "", postal_code: "", venue_type: "", budget_reference: "", notes: "" });
    toast({ title: "Site created" });
    load();
  };

  const patchSite = async (id: string, patch: Row) => {
    const { error } = await supabase.from("portal_sites").update(patch).eq("id", id);
    if (error) return fail(error);
    load();
  };

  const linkProject = async (projectId: string, siteId: string) => {
    const { error } = await supabase
      .from("portal_projects")
      .update({ site_id: siteId || null })
      .eq("id", projectId);
    if (error) return fail(error);
    toast({ title: "Project linked to site" });
    load();
  };

  const reviewRegistration = async (id: string, status: string) => {
    const { error } = await supabase
      .from("portal_registrations")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return fail(error);
    toast({ title: `Registration marked ${status.replace(/_/g, " ")}` });
    load();
  };

  const setReview = async (clientId: string, review_status: string) => {
    const { error } = await supabase
      .from("portal_clients")
      .update({ review_status, approved_at: review_status === "approved" ? new Date().toISOString() : null })
      .eq("id", clientId);
    if (error) return fail(error);
    load();
  };

  const pending = registrations.filter((r) => r.status === "pending_review");

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Client organisations", value: clients.length },
          { label: "Sites", value: sites.length },
          { label: "Projects", value: projects.length },
          { label: "Pending registrations", value: pending.length },
        ].map((m) => (
          <div key={m.label} className="border border-border p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{m.label}</p>
            <p className="mt-2 font-display text-2xl font-light">{m.value}</p>
          </div>
        ))}
      </div>

      <Section title="Client organisations">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <th className="px-3 py-3">Organisation</th>
                <th className="px-3 py-3">Parent reference</th>
                <th className="px-3 py-3">Sites</th>
                <th className="px-3 py-3">Review status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-3 py-3">{c.display_name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{c.parent_reference ?? "—"}</td>
                  <td className="px-3 py-3">{sites.filter((s) => s.client_id === c.id).length}</td>
                  <td className="px-3 py-3">{statusLabel(c.review_status)}</td>
                  <td className="px-3 py-3">
                    {c.review_status !== "approved" ? (
                      <Button size="sm" variant="outline" onClick={() => setReview(c.id, "approved")}>
                        Approve
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setReview(c.id, "pending_review")}>
                        Hold
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Add a site">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="site-client">Organisation</Label>
            <select
              id="site-client"
              className={selectCls}
              value={newSite.client_id}
              onChange={(e) => setNewSite({ ...newSite, client_id: e.target.value })}
            >
              <option value="">Select…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="site-name">Site name</Label>
            <Input id="site-name" value={newSite.name} onChange={(e) => setNewSite({ ...newSite, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="site-venue">Venue type</Label>
            <Input id="site-venue" value={newSite.venue_type} onChange={(e) => setNewSite({ ...newSite, venue_type: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="site-addr">Address</Label>
            <Input id="site-addr" value={newSite.address} onChange={(e) => setNewSite({ ...newSite, address: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="site-city">City</Label>
            <Input id="site-city" value={newSite.city} onChange={(e) => setNewSite({ ...newSite, city: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="site-prov">Province</Label>
            <Input id="site-prov" value={newSite.province} onChange={(e) => setNewSite({ ...newSite, province: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="site-post">Postal code</Label>
            <Input id="site-post" value={newSite.postal_code} onChange={(e) => setNewSite({ ...newSite, postal_code: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="site-budget">Budget reference (internal)</Label>
            <Input
              id="site-budget"
              type="number"
              value={newSite.budget_reference}
              onChange={(e) => setNewSite({ ...newSite, budget_reference: e.target.value })}
            />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="site-notes">Notes</Label>
            <Textarea id="site-notes" rows={2} value={newSite.notes} onChange={(e) => setNewSite({ ...newSite, notes: e.target.value })} />
          </div>
        </div>
        <Button className="mt-4" onClick={createSite} disabled={busy || !newSite.client_id || !newSite.name.trim()}>
          Create site
        </Button>
      </Section>

      <Section title="Sites & budget visibility">
        <div className="mb-4 max-w-xs">
          <Label htmlFor="site-filter">Filter by organisation</Label>
          <select id="site-filter" className={selectCls} value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            <option value="">All organisations</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <th className="px-3 py-3">Site</th>
                <th className="px-3 py-3">Organisation</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Venue type</th>
                <th className="px-3 py-3">Budget</th>
                <th className="px-3 py-3">Shared with client</th>
              </tr>
            </thead>
            <tbody>
              {visibleSites.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-3 py-3">{s.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{clientName(s.client_id)}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {[s.city, s.province].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{s.venue_type ?? "—"}</td>
                  <td className="px-3 py-3">
                    {s.budget_reference != null
                      ? `R${Number(s.budget_reference).toLocaleString("en-ZA")}${s.budget_includes_vat ? " incl. VAT" : ""}`
                      : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={!!s.budget_client_visible}
                        onChange={(e) => patchSite(s.id, { budget_client_visible: e.target.checked })}
                      />
                      {s.budget_client_visible ? "Visible" : "Internal only"}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Project → site linkage">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <th className="px-3 py-3">Project</th>
                <th className="px-3 py-3">Organisation</th>
                <th className="px-3 py-3">Site</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-3">{p.title}</td>
                  <td className="px-3 py-3 text-muted-foreground">{clientName(p.client_id)}</td>
                  <td className="px-3 py-3">
                    <select
                      className={selectCls}
                      value={p.site_id ?? ""}
                      onChange={(e) => linkProject(p.id, e.target.value)}
                      aria-label={`Site for ${p.title}`}
                    >
                      <option value="">Unassigned</option>
                      {sites
                        .filter((s) => s.client_id === p.client_id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Onboarding registration queue">
        {registrations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No client registrations submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {registrations.map((r) => (
              <div key={r.id} className="border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-light">{r.organisation_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.site_name} — {[r.site_address, r.site_city, r.site_province].filter(Boolean).join(", ")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.contact_email} · {(r.services ?? []).join(", ") || "no services selected"} ·{" "}
                      {(r.plan_paths ?? []).length} plan file(s)
                    </p>
                    {r.notes && <p className="mt-2 text-sm">{r.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="border border-border px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {statusLabel(r.status)}
                    </span>
                    {r.status === "pending_review" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => reviewRegistration(r.id, "approved")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => reviewRegistration(r.id, "declined")}>
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default SitesManager;
