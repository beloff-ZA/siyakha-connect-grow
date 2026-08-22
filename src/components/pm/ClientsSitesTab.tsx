import React, { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Panel, Field, Chip, selectCls } from "./ui";
import { formatZar } from "@/lib/boq";
import type { PmClient, PmSite, PmWorkspace } from "@/hooks/usePmWorkspace";
import { Building2, MapPin, Pencil, Plus } from "lucide-react";

const db = supabase as unknown as { from: (t: string) => any };

const emptyClient = { display_name: "", contact_name: "", contact_email: "", phone: "", status: "active", notes: "" };
const emptySite = {
  client_id: "",
  name: "",
  address: "",
  city: "",
  province: "",
  venue_type: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  status: "planning",
};

const ClientsSitesTab: React.FC<{ ws: PmWorkspace; openProject: (id: string, tab: string) => void }> = ({ ws, openProject }) => {
  const { toast } = useToast();
  const { clients, sites, projects, boqs, proposals, clientUsers, reload } = ws;
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const [clientDialog, setClientDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<PmClient | null>(null);
  const [clientForm, setClientForm] = useState({ ...emptyClient });

  const [siteDialog, setSiteDialog] = useState(false);
  const [editingSite, setEditingSite] = useState<PmSite | null>(null);
  const [siteForm, setSiteForm] = useState({ ...emptySite });

  const fail = (e: unknown) =>
    toast({ title: "Action failed", description: (e as any)?.message ?? String(e), variant: "destructive" as never });

  const saveClient = async () => {
    if (!clientForm.display_name.trim()) return toast({ title: "Client name is required", variant: "destructive" as never });
    setBusy(true);
    try {
      const payload = {
        display_name: clientForm.display_name.trim(),
        contact_name: clientForm.contact_name.trim() || null,
        contact_email: clientForm.contact_email.trim() || null,
        phone: clientForm.phone.trim() || null,
        status: clientForm.status,
        notes: clientForm.notes.trim() || null,
      };
      const { error } = editingClient
        ? await db.from("portal_clients").update(payload).eq("id", editingClient.id)
        : await db.from("portal_clients").insert(payload);
      if (error) throw error;
      toast({ title: editingClient ? "Client updated" : "Client created" });
      setClientDialog(false);
      await reload();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const saveSite = async () => {
    if (!siteForm.client_id) return toast({ title: "Select a client", variant: "destructive" as never });
    if (!siteForm.name.trim()) return toast({ title: "Site name is required", variant: "destructive" as never });
    setBusy(true);
    try {
      const payload = {
        client_id: siteForm.client_id,
        name: siteForm.name.trim(),
        address: siteForm.address.trim() || null,
        city: siteForm.city.trim() || null,
        province: siteForm.province.trim() || null,
        venue_type: siteForm.venue_type.trim() || null,
        contact_name: siteForm.contact_name.trim() || null,
        contact_email: siteForm.contact_email.trim() || null,
        contact_phone: siteForm.contact_phone.trim() || null,
        status: siteForm.status,
      };
      const { error } = editingSite
        ? await db.from("portal_sites").update(payload).eq("id", editingSite.id)
        : await db.from("portal_sites").insert(payload);
      if (error) throw error;
      toast({ title: editingSite ? "Site updated" : "Site created" });
      setSiteDialog(false);
      await reload();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients
      .filter((c) => !q || [c.display_name, c.contact_name, c.contact_email].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)))
      .map((c) => {
        const cSites = sites.filter((s) => s.client_id === c.id);
        const cProjects = projects.filter((p) => p.client_id === c.id);
        const cBoqs = boqs.filter((b) => cProjects.some((p) => p.id === b.project_id));
        const cProposals = proposals.filter((pr) => cProjects.some((p) => p.id === pr.project_id));
        const proposalTotal = cProposals.reduce((s, pr) => s + Number(pr.snapshot?.totals?.total ?? 0), 0);
        const users = clientUsers.filter((u) => u.client_id === c.id);
        return { client: c, cSites, cProjects, cBoqs, cProposals, proposalTotal, users };
      });
  }, [clients, sites, projects, boqs, proposals, clientUsers, search]);

  return (
    <div>
      <Panel
        title={`Clients & sites (${clients.length} clients · ${sites.length} sites)`}
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setEditingClient(null);
                setClientForm({ ...emptyClient });
                setClientDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} /> New client
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingSite(null);
                setSiteForm({ ...emptySite });
                setSiteDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} /> New site
            </Button>
          </div>
        }
      >
        <Input placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <p className="mt-3 text-xs text-muted-foreground">
          No invitations or emails are sent from this workspace — the client-email safety switch stays in force.
        </p>
      </Panel>

      {rows.map(({ client, cSites, cProjects, cBoqs, cProposals, proposalTotal, users }) => (
        <Panel
          key={client.id}
          title={client.display_name}
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingClient(client);
                setClientForm({
                  display_name: client.display_name,
                  contact_name: client.contact_name ?? "",
                  contact_email: client.contact_email ?? "",
                  phone: client.phone ?? "",
                  status: client.status ?? "active",
                  notes: client.notes ?? "",
                });
                setClientDialog(true);
              }}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} /> Edit client
            </Button>
          }
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Chip className="border-foreground text-foreground">{client.status ?? "active"}</Chip>
            {[client.contact_name, client.contact_email, client.phone].filter(Boolean).join(" · ")}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div className="border border-border p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Sites</p>
              <p className="mt-1 text-lg tabular-nums">{cSites.length}</p>
            </div>
            <div className="border border-border p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Projects</p>
              <p className="mt-1 text-lg tabular-nums">{cProjects.length}</p>
            </div>
            <div className="border border-border p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">BOQs</p>
              <p className="mt-1 text-lg tabular-nums">{cBoqs.length}</p>
            </div>
            <div className="border border-border p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Proposal value</p>
              <p className="mt-1 text-lg tabular-nums">{formatZar(proposalTotal)}</p>
              <p className="text-[10px] text-muted-foreground">{cProposals.length} document(s)</p>
            </div>
          </div>

          {users.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Portal users</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {users.map((u) => (
                  <li key={u.id}>
                    <Chip>
                      {u.full_name ?? u.email} · {u.status ?? "—"}
                    </Chip>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Sites</p>
              <ul className="mt-2 divide-y divide-border">
                {cSites.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                      {s.name}
                      <span className="text-xs text-muted-foreground">{[s.city, s.province].filter(Boolean).join(", ")}</span>
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingSite(s);
                        setSiteForm({
                          client_id: s.client_id,
                          name: s.name,
                          address: s.address ?? "",
                          city: s.city ?? "",
                          province: s.province ?? "",
                          venue_type: s.venue_type ?? "",
                          contact_name: s.contact_name ?? "",
                          contact_email: s.contact_email ?? "",
                          contact_phone: s.contact_phone ?? "",
                          status: s.status ?? "planning",
                        });
                        setSiteDialog(true);
                      }}
                    >
                      Edit
                    </Button>
                  </li>
                ))}
                {cSites.length === 0 && <li className="py-2 text-sm text-muted-foreground">No sites captured.</li>}
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Projects</p>
              <ul className="mt-2 divide-y divide-border">
                {cProjects.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                      {p.title}
                    </span>
                    <span className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openProject(p.id, "boq")}>
                        BOQ
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openProject(p.id, "proposals")}>
                        Proposal
                      </Button>
                    </span>
                  </li>
                ))}
                {cProjects.length === 0 && <li className="py-2 text-sm text-muted-foreground">No projects captured.</li>}
              </ul>
            </div>
          </div>
        </Panel>
      ))}

      <Dialog open={clientDialog} onOpenChange={setClientDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Edit client" : "New client"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Client / company name">
              <Input value={clientForm.display_name} onChange={(e) => setClientForm({ ...clientForm, display_name: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact name">
                <Input value={clientForm.contact_name} onChange={(e) => setClientForm({ ...clientForm, contact_name: e.target.value })} />
              </Field>
              <Field label="Contact email">
                <Input type="email" value={clientForm.contact_email} onChange={(e) => setClientForm({ ...clientForm, contact_email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
              </Field>
              <Field label="Status">
                <select className={selectCls} value={clientForm.status} onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}>
                  {["active", "prospect", "on_hold", "archived"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Internal notes">
              <Textarea rows={2} value={clientForm.notes} onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })} />
            </Field>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setClientDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveClient} disabled={busy}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={siteDialog} onOpenChange={setSiteDialog}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSite ? "Edit site" : "New site"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client" className="sm:col-span-2">
              <select className={selectCls} value={siteForm.client_id} onChange={(e) => setSiteForm({ ...siteForm, client_id: e.target.value })}>
                <option value="">Select…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.display_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Site name" className="sm:col-span-2">
              <Input value={siteForm.name} onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input value={siteForm.address} onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })} />
            </Field>
            <Field label="City">
              <Input value={siteForm.city} onChange={(e) => setSiteForm({ ...siteForm, city: e.target.value })} />
            </Field>
            <Field label="Province">
              <Input value={siteForm.province} onChange={(e) => setSiteForm({ ...siteForm, province: e.target.value })} />
            </Field>
            <Field label="Venue type">
              <Input value={siteForm.venue_type} onChange={(e) => setSiteForm({ ...siteForm, venue_type: e.target.value })} />
            </Field>
            <Field label="Status">
              <select className={selectCls} value={siteForm.status} onChange={(e) => setSiteForm({ ...siteForm, status: e.target.value })}>
                {["planning", "design", "in_progress", "live", "on_hold"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Site contact">
              <Input value={siteForm.contact_name} onChange={(e) => setSiteForm({ ...siteForm, contact_name: e.target.value })} />
            </Field>
            <Field label="Contact email">
              <Input type="email" value={siteForm.contact_email} onChange={(e) => setSiteForm({ ...siteForm, contact_email: e.target.value })} />
            </Field>
            <Field label="Contact phone">
              <Input value={siteForm.contact_phone} onChange={(e) => setSiteForm({ ...siteForm, contact_phone: e.target.value })} />
            </Field>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSiteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveSite} disabled={busy}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsSitesTab;
