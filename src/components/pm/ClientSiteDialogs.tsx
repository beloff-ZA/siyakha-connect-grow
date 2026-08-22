import React, { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Field, selectCls } from "./ui";
import type { PmClient, PmSite } from "@/hooks/usePmWorkspace";

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

/**
 * Single source of truth for creating and editing clients and sites. Shared by
 * the project register and the new-project wizard so the safe create/edit logic
 * is never duplicated.
 */
export function useClientSiteDialogs(opts: {
  clients: PmClient[];
  reload: () => Promise<void> | void;
  onClientSaved?: (id: string) => void;
  onSiteSaved?: (id: string) => void;
}) {
  const { clients, reload, onClientSaved, onSiteSaved } = opts;
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [clientDialog, setClientDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<PmClient | null>(null);
  const [clientForm, setClientForm] = useState({ ...emptyClient });
  const [siteDialog, setSiteDialog] = useState(false);
  const [editingSite, setEditingSite] = useState<PmSite | null>(null);
  const [siteForm, setSiteForm] = useState({ ...emptySite });

  const fail = (e: unknown) =>
    toast({ title: "Action failed", description: (e as Error)?.message ?? String(e), variant: "destructive" });

  const newClient = useCallback(() => {
    setEditingClient(null);
    setClientForm({ ...emptyClient });
    setClientDialog(true);
  }, []);

  const editClient = useCallback((c: PmClient) => {
    setEditingClient(c);
    setClientForm({
      display_name: c.display_name,
      contact_name: c.contact_name ?? "",
      contact_email: c.contact_email ?? "",
      phone: c.phone ?? "",
      status: c.status ?? "active",
      notes: c.notes ?? "",
    });
    setClientDialog(true);
  }, []);

  const newSite = useCallback((clientId?: string) => {
    setEditingSite(null);
    setSiteForm({ ...emptySite, client_id: clientId ?? "" });
    setSiteDialog(true);
  }, []);

  const editSite = useCallback((s: PmSite) => {
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
  }, []);

  const saveClient = async () => {
    if (!clientForm.display_name.trim())
      return toast({ title: "Client name is required", variant: "destructive" });
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
      const { data, error } = editingClient
        ? await db.from("portal_clients").update(payload).eq("id", editingClient.id).select("id").maybeSingle()
        : await db.from("portal_clients").insert(payload).select("id").maybeSingle();
      if (error) throw error;
      toast({ title: editingClient ? "Client updated" : "Client created" });
      setClientDialog(false);
      await reload();
      if (data?.id) onClientSaved?.(data.id as string);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const saveSite = async () => {
    if (!siteForm.client_id) return toast({ title: "Select a client", variant: "destructive" });
    if (!siteForm.name.trim()) return toast({ title: "Site name is required", variant: "destructive" });
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
      const { data, error } = editingSite
        ? await db.from("portal_sites").update(payload).eq("id", editingSite.id).select("id").maybeSingle()
        : await db.from("portal_sites").insert(payload).select("id").maybeSingle();
      if (error) throw error;
      toast({ title: editingSite ? "Site updated" : "Site created" });
      setSiteDialog(false);
      await reload();
      if (data?.id) onSiteSaved?.(data.id as string);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const dialogs = (
    <>
      <Dialog open={clientDialog} onOpenChange={setClientDialog}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
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
    </>
  );

  return { dialogs, newClient, editClient, newSite, editSite, busy };
}

export default useClientSiteDialogs;
