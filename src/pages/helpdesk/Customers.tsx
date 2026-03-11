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

const contractTypes = ["ad-hoc", "monthly", "annual", "project-based"];

const Customers = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", contact_person: "", email: "", phone: "", address: "", industry: "", contract_type: "ad-hoc", monthly_value: 0, notes: "", is_active: true });

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = customers.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.contact_person || "").toLowerCase().includes(search.toLowerCase()));

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = { ...form, monthly_value: Number(form.monthly_value) };
      if (editId) {
        const { error } = await supabase.from("customers").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); toast.success(editId ? "Updated" : "Added"); setOpen(false); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("customers").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); toast.success("Deleted"); },
  });

  const resetForm = () => { setEditId(null); setForm({ name: "", contact_person: "", email: "", phone: "", address: "", industry: "", contract_type: "ad-hoc", monthly_value: 0, notes: "", is_active: true }); };

  const openEdit = (c: any) => {
    setEditId(c.id);
    setForm({ name: c.name, contact_person: c.contact_person || "", email: c.email || "", phone: c.phone || "", address: c.address || "", industry: c.industry || "", contract_type: c.contract_type || "ad-hoc", monthly_value: c.monthly_value || 0, notes: c.notes || "", is_active: c.is_active });
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <div className="flex gap-3">
            <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Customer</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Customer</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Company name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Contact person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
                    <Input placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={form.contract_type} onValueChange={(v) => setForm({ ...form, contract_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{contractTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                    <Input type="number" placeholder="Monthly value (R)" value={form.monthly_value} onChange={(e) => setForm({ ...form, monthly_value: Number(e.target.value) })} />
                  </div>
                  <Textarea placeholder="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  <Button onClick={() => upsert.mutate()} disabled={!form.name.trim()} className="w-full">{editId ? "Update" : "Save"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">{filtered.length} customer{filtered.length !== 1 ? "s" : ""}</div>

        {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Monthly (R)</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}{!c.is_active && <Badge variant="secondary" className="ml-2">Inactive</Badge>}</TableCell>
                    <TableCell>{c.contact_person || "—"}</TableCell>
                    <TableCell>{c.email || "—"}</TableCell>
                    <TableCell>{c.phone || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{c.contract_type}</Badge></TableCell>
                    <TableCell>{c.monthly_value > 0 ? Number(c.monthly_value).toLocaleString() : "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove.mutate(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No customers found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Customers;
