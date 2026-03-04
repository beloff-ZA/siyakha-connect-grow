import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const statusOptions = ["open", "new", "in_progress", "waiting_for_client", "resolved", "closed"];
const priorityOptions = ["low", "normal", "high", "urgent"];
const categoryOptions = ["Network", "Hardware", "Software", "WiFi", "CCTV", "Other"];

const Tickets: React.FC = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [form, setForm] = useState({
    summary: "", details: "", caller_name: "", caller_email: "", caller_phone: "",
    caller_company: "", priority: "normal", category: "Other",
  });

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    setLoading(true);
    const { data } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("tickets").insert({
      summary: form.summary,
      details: form.details || null,
      caller_name: form.caller_name || null,
      caller_email: form.caller_email || null,
      caller_phone: form.caller_phone || null,
      caller_company: form.caller_company || null,
      priority: form.priority,
      category: form.category,
      created_by_user_id: user.id,
      tracking_ref: `TCK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      channel: "portal",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" as any });
    } else {
      toast({ title: "Ticket created" });
      setShowCreate(false);
      setForm({ summary: "", details: "", caller_name: "", caller_email: "", caller_phone: "", caller_company: "", priority: "normal", category: "Other" });
      loadTickets();
    }
  };

  const filtered = tickets.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return t.summary?.toLowerCase().includes(s) || t.tracking_ref?.toLowerCase().includes(s) || t.caller_company?.toLowerCase().includes(s);
    }
    return true;
  });

  const prioColor = (p: string) => {
    switch (p) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "normal": return "bg-blue-100 text-blue-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const statusColor = (s: string) => {
    if (["resolved", "closed"].includes(s)) return "bg-green-100 text-green-800";
    if (s === "waiting_for_client") return "bg-yellow-100 text-yellow-800";
    if (s === "in_progress") return "bg-blue-100 text-blue-800";
    return "bg-orange-100 text-orange-800";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tickets…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorityOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" />New Ticket</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Log New Ticket</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Caller Name</Label><Input value={form.caller_name} onChange={e => setForm(f => ({...f, caller_name: e.target.value}))} /></div>
                <div><Label>Company / School</Label><Input value={form.caller_company} onChange={e => setForm(f => ({...f, caller_company: e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input type="email" value={form.caller_email} onChange={e => setForm(f => ({...f, caller_email: e.target.value}))} /></div>
                <div><Label>Phone</Label><Input value={form.caller_phone} onChange={e => setForm(f => ({...f, caller_phone: e.target.value}))} /></div>
              </div>
              <div><Label>Issue Summary *</Label><Input value={form.summary} onChange={e => setForm(f => ({...f, summary: e.target.value}))} /></div>
              <div><Label>Details</Label><Textarea value={form.details} onChange={e => setForm(f => ({...f, details: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({...f, priority: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{priorityOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreate} disabled={!form.summary} className="w-full">Create Ticket</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? <p className="p-6 text-muted-foreground">Loading…</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No tickets found</TableCell></TableRow>
                ) : filtered.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.tracking_ref}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{t.summary}</TableCell>
                    <TableCell>{t.caller_company || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className={prioColor(t.priority)}>{t.priority}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={statusColor(t.status)}>{t.status.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Link to={`/helpdesk/tickets/${t.id}`}>
                        <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Tickets;
