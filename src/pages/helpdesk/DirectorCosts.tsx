import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";

type Cost = {
  id: string; title: string; amount: number; category: string;
  vendor: string | null; date: string; status: string; notes: string | null;
  project_id: string | null; created_at: string;
};

const costCategories = [
  "general", "hardware", "software", "licensing", "labour",
  "travel", "marketing", "subscriptions", "office", "other"
];
const costStatuses = ["pending", "approved", "paid", "rejected"];

const DirectorCosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cost | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");

  // Form
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("general");
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [status, setStatus] = useState("pending");
  const [notes, setNotes] = useState("");

  const fetchCosts = async () => {
    setLoading(true);
    const { data } = await supabase.from("director_costs").select("*").order("date", { ascending: false });
    if (data) setCosts(data as Cost[]);
    setLoading(false);
  };

  useEffect(() => { fetchCosts(); }, []);

  const resetForm = () => {
    setTitle(""); setAmount(""); setCategory("general"); setVendor("");
    setDate(format(new Date(), "yyyy-MM-dd")); setStatus("pending"); setNotes(""); setEditing(null);
  };

  const openEdit = (c: Cost) => {
    setEditing(c); setTitle(c.title); setAmount(String(c.amount)); setCategory(c.category);
    setVendor(c.vendor || ""); setDate(c.date); setStatus(c.status); setNotes(c.notes || "");
    setDialogOpen(true);
  };

  const save = async () => {
    if (!title.trim() || !amount) { toast({ title: "Title and amount required", variant: "destructive" }); return; }
    const payload = {
      title: title.trim(), amount: parseFloat(amount), category, vendor: vendor.trim() || null,
      date, status, notes: notes.trim() || null, user_id: user!.id,
    };
    if (editing) {
      const { error } = await supabase.from("director_costs").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Cost updated" });
    } else {
      const { error } = await supabase.from("director_costs").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Cost added" });
    }
    setDialogOpen(false); resetForm(); fetchCosts();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this cost?")) return;
    await supabase.from("director_costs").delete().eq("id", id);
    toast({ title: "Deleted" }); fetchCosts();
  };

  const filtered = filterCategory === "all" ? costs : costs.filter(c => c.category === filterCategory);

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const monthCosts = costs.filter(c => c.date >= format(monthStart, "yyyy-MM-dd") && c.date <= format(monthEnd, "yyyy-MM-dd"));
  const totalMonth = monthCosts.reduce((s, c) => s + c.amount, 0);
  const totalPending = costs.filter(c => c.status === "pending").reduce((s, c) => s + c.amount, 0);
  const totalPaid = costs.filter(c => c.status === "paid").reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" /> Cost Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{costs.length} expenses tracked</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {costCategories.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Cost</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">R{totalMonth.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><TrendingDown className="h-4 w-4" /> Pending</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">R{totalPending.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Paid</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">R{totalPaid.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      {loading ? <p className="text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No costs recorded.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Card key={c.id} className="group hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{c.title}</p>
                    <Badge variant="outline" className="text-xs">{c.category}</Badge>
                    <Badge variant={c.status === "paid" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span>{format(new Date(c.date), "dd MMM yyyy")}</span>
                    {c.vendor && <span>{c.vendor}</span>}
                  </div>
                </div>
                <p className="font-bold text-lg whitespace-nowrap">R{c.amount.toLocaleString()}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={o => { if (!o) resetForm(); setDialogOpen(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Cost" : "Add Cost"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Description" value={title} onChange={e => setTitle(e.target.value)} />
            <Input type="number" placeholder="Amount (R)" value={amount} onChange={e => setAmount(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{costCategories.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{costStatuses.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input placeholder="Vendor" value={vendor} onChange={e => setVendor(e.target.value)} />
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Textarea placeholder="Notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Update" : "Add"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectorCosts;
