import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/helpdesk/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import { toast } from "sonner";

const categories = ["general", "hardware", "software", "networking", "cabling", "security", "cloud"];

const Suppliers = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", contact_person: "", email: "", phone: "", address: "", category: "general", account_number: "", payment_terms: "", notes: "", is_active: true });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = suppliers.filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()));

  const upsert = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from("suppliers").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("suppliers").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suppliers"] }); toast.success(editId ? "Updated" : "Added"); setOpen(false); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("suppliers").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suppliers"] }); toast.success("Deleted"); },
  });

  const resetForm = () => { setEditId(null); setForm({ name: "", contact_person: "", email: "", phone: "", address: "", category: "general", account_number: "", payment_terms: "", notes: "", is_active: true }); };

  const openEdit = (s: any) => {
    setEditId(s.id);
    setForm({ name: s.name, contact_person: s.contact_person || "", email: s.email || "", phone: s.phone || "", address: s.address || "", category: s.category || "general", account_number: s.account_number || "", payment_terms: s.payment_terms || "", notes: s.notes || "", is_active: s.is_active });
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-foreground">Suppliers</h1>
          <div className="flex gap-3">
            <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Supplier</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Supplier</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Supplier name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Contact person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Account number" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
                    <Input placeholder="Payment terms" value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} />
                  </div>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account #</TableHead>
                  <TableHead>Terms</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.contact_person || "—"}</TableCell>
                    <TableCell>{s.email || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{s.category}</Badge></TableCell>
                    <TableCell>{s.account_number || "—"}</TableCell>
                    <TableCell>{s.payment_terms || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove.mutate(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No suppliers found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Suppliers;
