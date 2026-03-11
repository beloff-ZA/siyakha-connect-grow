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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit, Search, Package } from "lucide-react";
import { toast } from "sonner";

const providerTypes = ["internet", "voip", "cloud", "security", "support"];
const packageTypes = ["service", "bundle", "addon"];
const billingCycles = ["monthly", "quarterly", "annually", "once-off"];
const statusOpts = ["active", "suspended", "cancelled", "pending"];
const statusColors: Record<string, string> = { active: "bg-green-100 text-green-800", suspended: "bg-yellow-100 text-yellow-800", cancelled: "bg-red-100 text-red-800", pending: "bg-blue-100 text-blue-800" };

const Packages = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [form, setForm] = useState({ provider_type: "internet", provider_name: "", package_name: "", package_type: "service", speed: "", price: 0, billing_cycle: "monthly", description: "", customer_name: "", status: "active", contract_start: "", contract_end: "", notes: "" });

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("packages").select("*").order("provider_name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = packages.filter((p: any) => {
    const matchSearch = p.package_name.toLowerCase().includes(search.toLowerCase()) || p.provider_name.toLowerCase().includes(search.toLowerCase()) || (p.customer_name || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || p.provider_type === filterType;
    return matchSearch && matchType;
  });

  const totalMonthly = filtered.filter((p: any) => p.status === "active" && p.billing_cycle === "monthly").reduce((sum: number, p: any) => sum + Number(p.price || 0), 0);
  const activeCount = filtered.filter((p: any) => p.status === "active").length;

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = { ...form, price: Number(form.price), contract_start: form.contract_start || null, contract_end: form.contract_end || null, customer_name: form.customer_name || null };
      if (editId) {
        const { error } = await supabase.from("packages").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("packages").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["packages"] }); toast.success(editId ? "Updated" : "Added"); setOpen(false); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("packages").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["packages"] }); toast.success("Deleted"); },
  });

  const resetForm = () => { setEditId(null); setForm({ provider_type: "internet", provider_name: "", package_name: "", package_type: "service", speed: "", price: 0, billing_cycle: "monthly", description: "", customer_name: "", status: "active", contract_start: "", contract_end: "", notes: "" }); };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({ provider_type: p.provider_type, provider_name: p.provider_name, package_name: p.package_name, package_type: p.package_type || "service", speed: p.speed || "", price: p.price || 0, billing_cycle: p.billing_cycle || "monthly", description: p.description || "", customer_name: p.customer_name || "", status: p.status || "active", contract_start: p.contract_start || "", contract_end: p.contract_end || "", notes: p.notes || "" });
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-foreground">Packages</h1>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Package</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Package</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.provider_type} onValueChange={(v) => setForm({ ...form, provider_type: v })}><SelectTrigger><SelectValue placeholder="Provider type" /></SelectTrigger><SelectContent>{providerTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                  <Select value={form.package_type} onValueChange={(v) => setForm({ ...form, package_type: v })}><SelectTrigger><SelectValue placeholder="Package type" /></SelectTrigger><SelectContent>{packageTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                </div>
                <Input placeholder="Provider name *" value={form.provider_name} onChange={(e) => setForm({ ...form, provider_name: e.target.value })} />
                <Input placeholder="Package name *" value={form.package_name} onChange={(e) => setForm({ ...form, package_name: e.target.value })} />
                <Input placeholder="Customer (assigned to)" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="Speed/Spec" value={form.speed} onChange={(e) => setForm({ ...form, speed: e.target.value })} />
                  <Input type="number" placeholder="Price (R)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                  <Select value={form.billing_cycle} onValueChange={(v) => setForm({ ...form, billing_cycle: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{billingCycles.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
                </div>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statusOpts.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground">Contract start</label><Input type="date" value={form.contract_start} onChange={(e) => setForm({ ...form, contract_start: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Contract end</label><Input type="date" value={form.contract_end} onChange={(e) => setForm({ ...form, contract_end: e.target.value })} /></div>
                </div>
                <Textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <Textarea placeholder="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <Button onClick={() => upsert.mutate()} disabled={!form.provider_name.trim() || !form.package_name.trim()} className="w-full">{editId ? "Update" : "Save"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Packages</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{filtered.length}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{activeCount}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Monthly Spend</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">R{totalMonthly.toLocaleString()}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Providers</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{new Set(filtered.map((p: any) => p.provider_name)).size}</p></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search packages..." className="pl-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem>{providerTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
        </div>

        {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Speed</TableHead>
                  <TableHead>Price (R)</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.provider_name}</TableCell>
                    <TableCell>{p.package_name}</TableCell>
                    <TableCell><Badge variant="outline">{p.provider_type}</Badge></TableCell>
                    <TableCell>{p.customer_name || "—"}</TableCell>
                    <TableCell>{p.speed || "—"}</TableCell>
                    <TableCell>{Number(p.price).toLocaleString()}</TableCell>
                    <TableCell>{p.billing_cycle}</TableCell>
                    <TableCell><Badge className={statusColors[p.status] || ""}>{p.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove.mutate(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">No packages found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Packages;
