import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";

interface Site {
  id: string;
  company_id: string;
  name: string;
  site_ref?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export default function SitesManager() {
  const { company } = useCompany();
  const { toast } = useToast();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<Partial<Site>>({ name: "", address: "" });

  const canSubmit = useMemo(() => (form?.name || "").trim().length > 0, [form]);

  useEffect(() => {
    if (!company?.id) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("sites")
        .select("id, company_id, name, site_ref, address, city, state, postal_code, country, latitude, longitude")
        .eq("company_id", company.id)
        .order("name", { ascending: true });
      if (error) {
        toast({ title: "Could not load sites", description: error.message, variant: "destructive" });
      } else if (!cancelled) {
        setSites((data || []) as Site[]);
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [company?.id, toast]);

  const handleAdd = async () => {
    if (!company?.id || !canSubmit) return;
    const payload = {
      company_id: company.id,
      name: (form.name || "").trim(),
      site_ref: (form.site_ref || null) as string | null,
      address: (form.address || null) as string | null,
      city: (form.city || null) as string | null,
      state: (form.state || null) as string | null,
      postal_code: (form.postal_code || null) as string | null,
      country: (form.country || null) as string | null,
      latitude: form.latitude ?? null,
      longitude: form.longitude ?? null,
    };
    const { data, error } = await supabase.from("sites").insert(payload).select("id, company_id, name, site_ref, address, city, state, postal_code, country, latitude, longitude").maybeSingle();
    if (error) {
      toast({ title: "Add site failed", description: error.message, variant: "destructive" });
    } else if (data) {
      setSites((prev) => [...prev, data as Site]);
      setForm({ name: "", address: "" });
      toast({ title: "Site added", description: "Site has been created." });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("sites").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      setSites((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Site deleted", description: "Site removed." });
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Sites</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="site_name" className="text-xs">Name</Label>
            <Input id="site_name" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Head Office" className="rounded-xl" />
          </div>
          <div>
            <Label htmlFor="site_ref" className="text-xs">Site Ref</Label>
            <Input id="site_ref" value={form.site_ref || ""} onChange={(e) => setForm((f) => ({ ...f, site_ref: e.target.value }))} placeholder="Client reference" className="rounded-xl" />
          </div>
          <div className="lg:col-span-3">
            <Label htmlFor="site_addr" className="text-xs">Address</Label>
            <Input id="site_addr" value={form.address || ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Address line" className="rounded-xl" />
          </div>
          <div>
            <Label htmlFor="city" className="text-xs">City</Label>
            <Input id="city" value={form.city || ""} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <Label htmlFor="state" className="text-xs">State/Province</Label>
            <Input id="state" value={form.state || ""} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <Label htmlFor="postal_code" className="text-xs">Postal Code</Label>
            <Input id="postal_code" value={form.postal_code || ""} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <Label htmlFor="country" className="text-xs">Country</Label>
            <Input id="country" value={form.country || ""} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <Label htmlFor="lat" className="text-xs">Latitude</Label>
            <Input id="lat" type="number" value={form.latitude ?? ""} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value === "" ? undefined : Number(e.target.value) }))} className="rounded-xl" />
          </div>
          <div>
            <Label htmlFor="lng" className="text-xs">Longitude</Label>
            <Input id="lng" type="number" value={form.longitude ?? ""} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value === "" ? undefined : Number(e.target.value) }))} className="rounded-xl" />
          </div>
          <div className="self-end">
            <Button className="rounded-2xl w-full" onClick={handleAdd} disabled={!canSubmit || loading}>Add Site</Button>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : sites.length === 0 ? (
            <div className="text-sm text-muted-foreground">No sites yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Site Ref</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.site_ref || "—"}</TableCell>
                    <TableCell className="max-w-[360px] truncate">{s.address || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleDelete(s.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
