import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FolderKanban } from "lucide-react";
import { format } from "date-fns";

type Project = {
  id: string; title: string; client: string | null; status: string;
  priority: string; estimated_value: number; start_date: string | null;
  due_date: string | null; description: string | null; notes: string | null;
  created_at: string;
};

const statuses = [
  { value: "pipeline", label: "Pipeline", color: "bg-muted text-muted-foreground" },
  { value: "proposal", label: "Proposal", color: "bg-foreground/10 text-foreground" },
  { value: "active", label: "Active", color: "bg-foreground text-background" },
  { value: "on_hold", label: "On Hold", color: "bg-muted-foreground/30 text-foreground" },
  { value: "completed", label: "Completed", color: "bg-foreground/20 text-foreground" },
  { value: "cancelled", label: "Cancelled", color: "bg-destructive/20 text-destructive" },
];
const priorities = ["low", "medium", "high", "urgent"];

const DirectorProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [status, setStatus] = useState("pipeline");
  const [priority, setPriority] = useState("medium");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("director_projects").select("*").order("created_at", { ascending: false });
    if (data) setProjects(data as Project[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const resetForm = () => {
    setTitle(""); setClient(""); setStatus("pipeline"); setPriority("medium");
    setEstimatedValue(""); setStartDate(""); setDueDate(""); setDescription(""); setNotes("");
    setEditing(null);
  };

  const openEdit = (p: Project) => {
    setEditing(p); setTitle(p.title); setClient(p.client || ""); setStatus(p.status);
    setPriority(p.priority); setEstimatedValue(String(p.estimated_value || ""));
    setStartDate(p.start_date || ""); setDueDate(p.due_date || "");
    setDescription(p.description || ""); setNotes(p.notes || "");
    setDialogOpen(true);
  };

  const save = async () => {
    if (!title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    const payload = {
      title: title.trim(), client: client.trim() || null, status, priority,
      estimated_value: parseFloat(estimatedValue) || 0,
      start_date: startDate || null, due_date: dueDate || null,
      description: description.trim() || null, notes: notes.trim() || null,
      user_id: user!.id,
    };
    if (editing) {
      const { error } = await supabase.from("director_projects").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Project updated" });
    } else {
      const { error } = await supabase.from("director_projects").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Project created" });
    }
    setDialogOpen(false); resetForm(); fetch();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("director_projects").delete().eq("id", id);
    toast({ title: "Deleted" }); fetch();
  };

  const filtered = filterStatus === "all" ? projects : projects.filter(p => p.status === filterStatus);
  const totalValue = projects.filter(p => p.status === "active" || p.status === "pipeline" || p.status === "proposal")
    .reduce((s, p) => s + (p.estimated_value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="h-6 w-6" /> Projects Pipeline
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {projects.length} projects · R{totalValue.toLocaleString()} pipeline value
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />New Project</Button>
        </div>
      </div>

      {loading ? <p className="text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No projects found.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const st = statuses.find(s => s.value === p.status);
            return (
              <Card key={p.id} className="group hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{p.title}</p>
                      <Badge className={st?.color}>{st?.label}</Badge>
                      <Badge variant="outline" className="text-xs">{p.priority}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1">
                      {p.client && <span>Client: {p.client}</span>}
                      {p.estimated_value > 0 && <span>R{p.estimated_value.toLocaleString()}</span>}
                      {p.start_date && <span>Start: {format(new Date(p.start_date), "dd MMM yyyy")}</span>}
                      {p.due_date && <span>Due: {format(new Date(p.due_date), "dd MMM yyyy")}</span>}
                    </div>
                    {p.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={o => { if (!o) resetForm(); setDialogOpen(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Project title" value={title} onChange={e => setTitle(e.target.value)} />
            <Input placeholder="Client name" value={client} onChange={e => setClient(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input type="number" placeholder="Estimated value (R)" value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground block mb-1">Start</label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
              <div><label className="text-xs text-muted-foreground block mb-1">Due</label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
            </div>
            <Textarea placeholder="Description" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            <Textarea placeholder="Internal notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectorProjects;
