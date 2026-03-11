import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/helpdesk/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import { toast } from "sonner";

const InternetProviders = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", contact_person: "", email: "", phone: "", website: "", coverage_areas: "", account_manager: "", notes: "", is_active: true });

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["internet-providers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("internet_providers").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = providers.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));

  const upsert = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from("internet_providers").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("internet_providers").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["internet-providers"] }); toast.success(editId ? "Updated" : "Added"); setOpen(false); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("internet_providers").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["internet-providers"] }); toast.success("Deleted"); },
  });

  const resetForm = () => { setEditId(null); setForm({ name: "", contact_person: "", email: "", phone: "", website: "", coverage_areas: "", account_manager: "", notes: "", is_active: true }); };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({ name: p.name, contact_person: p.contact_person || "", email: p.email || "", phone: p.phone || "", website: p.website || "", coverage_areas: p.coverage_areas || "", account_manager: p.account_manager || "", notes: p.notes || "", is_active: p.is_active });
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-foreground">Internet Providers</h1>
          <div className="flex gap-3">
            <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Provider</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Internet Provider</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Provider name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Contact person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
                    <Input placeholder="Account manager" value={form.account_manager} onChange={(e) => setForm({ ...form, account_manager: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <Input placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                  <Input placeholder="Coverage areas" value={form.coverage_areas} onChange={(e) => setForm({ ...form, coverage_areas: e.target.value })} />
                  <Textarea placeholder="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  <Button onClick={() => upsert.mutate()} disabled={!form.name.trim()} className="w-full">{editId ? "Update" : "Save"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Account Mgr</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.contact_person || "—"}</TableCell>
                    <TableCell>{p.email || "—"}</TableCell>
                    <TableCell>{p.phone || "—"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{p.coverage_areas || "—"}</TableCell>
                    <TableCell>{p.account_manager || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove.mutate(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No internet providers found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default InternetProviders;
