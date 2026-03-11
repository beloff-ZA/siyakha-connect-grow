import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/helpdesk/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const statusOpts = ["operational", "degraded", "outage", "maintenance"];
const statusColors: Record<string, string> = { operational: "bg-green-100 text-green-800", degraded: "bg-yellow-100 text-yellow-800", outage: "bg-red-100 text-red-800", maintenance: "bg-blue-100 text-blue-800" };

const SitePerformance = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ client_name: "", site_name: "", status: "operational", uptime_percent: 100, notes: "", issues: "", next_review: "", update_date: new Date().toISOString().split("T")[0] });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["site-performance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_performance").select("*").order("update_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = { ...form, uptime_percent: Number(form.uptime_percent), next_review: form.next_review || null };
      if (editId) {
        const { error } = await supabase.from("site_performance").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_performance").insert({ ...payload, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["site-performance"] }); toast.success(editId ? "Updated" : "Added"); setOpen(false); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("site_performance").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["site-performance"] }); toast.success("Deleted"); },
  });

  const resetForm = () => { setEditId(null); setForm({ client_name: "", site_name: "", status: "operational", uptime_percent: 100, notes: "", issues: "", next_review: "", update_date: new Date().toISOString().split("T")[0] }); };

  const openEdit = (r: any) => {
    setEditId(r.id);
    setForm({ client_name: r.client_name, site_name: r.site_name, status: r.status, uptime_percent: r.uptime_percent || 100, notes: r.notes || "", issues: r.issues || "", next_review: r.next_review || "", update_date: r.update_date });
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Site Performance</h1>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Update</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Performance Update</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Client name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
                  <Input placeholder="Site name" value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statusOpts.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                  <Input type="number" placeholder="Uptime %" value={form.uptime_percent} onChange={(e) => setForm({ ...form, uptime_percent: Number(e.target.value) })} />
                  <Input type="date" value={form.update_date} onChange={(e) => setForm({ ...form, update_date: e.target.value })} />
                </div>
                <Textarea placeholder="Issues" rows={2} value={form.issues} onChange={(e) => setForm({ ...form, issues: e.target.value })} />
                <Textarea placeholder="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <Input type="date" placeholder="Next review" value={form.next_review} onChange={(e) => setForm({ ...form, next_review: e.target.value })} />
                <Button onClick={() => upsert.mutate()} disabled={!form.client_name.trim() || !form.site_name.trim()} className="w-full">{editId ? "Update" : "Save"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.client_name}</TableCell>
                    <TableCell>{r.site_name}</TableCell>
                    <TableCell><Badge className={statusColors[r.status] || ""}>{r.status}</Badge></TableCell>
                    <TableCell>{r.uptime_percent}%</TableCell>
                    <TableCell>{new Date(r.update_date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{r.issues || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {records.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No performance records yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SitePerformance;
