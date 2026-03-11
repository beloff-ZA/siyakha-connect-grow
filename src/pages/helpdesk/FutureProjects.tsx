import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/helpdesk/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const statuses = ["idea", "researching", "proposal", "approved", "on-hold"];
const priorities = ["low", "medium", "high", "critical"];
const statusColors: Record<string, string> = { idea: "bg-muted text-muted-foreground", researching: "bg-blue-100 text-blue-800", proposal: "bg-yellow-100 text-yellow-800", approved: "bg-green-100 text-green-800", "on-hold": "bg-red-100 text-red-800" };

const FutureProjects = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", client: "", description: "", estimated_value: 0, target_date: "", status: "idea", priority: "medium", notes: "" });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["future-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("future_projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = { ...form, estimated_value: Number(form.estimated_value), target_date: form.target_date || null };
      if (editId) {
        const { error } = await supabase.from("future_projects").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("future_projects").insert({ ...payload, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["future-projects"] }); toast.success(editId ? "Updated" : "Added"); setOpen(false); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("future_projects").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["future-projects"] }); toast.success("Deleted"); },
  });

  const resetForm = () => { setEditId(null); setForm({ title: "", client: "", description: "", estimated_value: 0, target_date: "", status: "idea", priority: "medium", notes: "" }); };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({ title: p.title, client: p.client || "", description: p.description || "", estimated_value: p.estimated_value || 0, target_date: p.target_date || "", status: p.status, priority: p.priority, notes: p.notes || "" });
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Future Projects</h1>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Project</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Future Project</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Project title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Input placeholder="Client" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Est. value (R)" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: Number(e.target.value) })} />
                  <Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
                </div>
                <Textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <Textarea placeholder="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <Button onClick={() => upsert.mutate()} disabled={!form.title.trim()} className="w-full">{editId ? "Update" : "Save"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p: any) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      {p.client && <p className="text-sm text-muted-foreground">{p.client}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove.mutate(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge className={statusColors[p.status] || ""}>{p.status}</Badge>
                    <Badge variant="outline">{p.priority}</Badge>
                    {p.estimated_value > 0 && <Badge variant="secondary">R{Number(p.estimated_value).toLocaleString()}</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                  {p.target_date && <p className="text-xs text-muted-foreground/60 mt-2">Target: {new Date(p.target_date).toLocaleDateString()}</p>}
                </CardContent>
              </Card>
            ))}
            {projects.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No future projects yet.</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FutureProjects;
