import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Search, Trash2, ShieldCheck, ShieldAlert, ShieldQuestion,
  Pencil, Phone, Mail, Globe, MapPin, Eye
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Lead = {
  id: string; name: string; email: string | null; phone: string | null;
  address: string | null; website: string | null; industry: string | null;
  location: string | null; source: string | null; status: string | null;
  notes: string | null; verified: string | null; flagged_reason: string | null;
  reviewed_at: string | null; company_size: string | null;
  budget_range: string | null; created_at: string | null;
};

const verifiedOptions = [
  { value: "unreviewed", label: "Unreviewed", icon: ShieldQuestion, color: "bg-muted text-muted-foreground" },
  { value: "genuine", label: "Genuine", icon: ShieldCheck, color: "bg-foreground text-background" },
  { value: "spam", label: "Spam", icon: ShieldAlert, color: "bg-destructive text-destructive-foreground" },
  { value: "suspicious", label: "Suspicious", icon: ShieldAlert, color: "bg-muted-foreground/30 text-foreground" },
];

const statusOptions = ["new", "contacted", "qualified", "converted", "lost"];
const industryOptions = ["school", "business", "healthcare", "retail", "hospitality", "government", "other"];

const Leads: React.FC = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [filterVerified, setFilterVerified] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", website: "",
    industry: "business", location: "", notes: "", company_size: "", budget_range: "",
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    setLeads((data || []) as Lead[]);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      name: "", email: "", phone: "", address: "", website: "",
      industry: "business", location: "", notes: "", company_size: "", budget_range: "",
    });
    setEditing(null);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setForm({
      name: lead.name, email: lead.email || "", phone: lead.phone || "",
      address: lead.address || "", website: lead.website || "",
      industry: lead.industry || "business", location: lead.location || "",
      notes: lead.notes || "", company_size: lead.company_size || "",
      budget_range: lead.budget_range || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      website: form.website.trim() || null,
      industry: form.industry || null,
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
      company_size: form.company_size.trim() || null,
      budget_range: form.budget_range.trim() || null,
      source: "manual",
      status: "new",
    };

    if (editing) {
      const { error } = await supabase.from("leads").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Lead updated" });
    } else {
      const { error } = await supabase.from("leads").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Lead added" });
    }
    setShowForm(false);
    resetForm();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await supabase.from("leads").delete().eq("id", id);
    toast({ title: "Lead deleted" });
    load();
  };

  const markVerified = async (id: string, verified: string, reason?: string) => {
    const update: any = {
      verified,
      reviewed_at: new Date().toISOString(),
    };
    if (reason !== undefined) update.flagged_reason = reason;
    await supabase.from("leads").update(update).eq("id", id);
    toast({ title: `Lead marked as ${verified}` });
    load();
    // Update detail view if open
    if (detailLead?.id === id) {
      setDetailLead(prev => prev ? { ...prev, verified, reviewed_at: update.reviewed_at, flagged_reason: reason || prev.flagged_reason } : null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("leads").update({ status }).eq("id", id);
    load();
  };

  // Filtering
  const filtered = leads.filter(l => {
    const matchSearch = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.location?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search);
    const matchVerified = filterVerified === "all" || l.verified === filterVerified;
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchVerified && matchStatus;
  });

  // Counts
  const unreviewed = leads.filter(l => l.verified === "unreviewed" || !l.verified).length;
  const genuine = leads.filter(l => l.verified === "genuine").length;
  const spam = leads.filter(l => l.verified === "spam").length;
  const suspicious = leads.filter(l => l.verified === "suspicious").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldQuestion className="h-6 w-6" /> Lead Review
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{leads.length} total leads</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />Add Lead
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setFilterVerified("unreviewed")}>
          <CardContent className="p-4 text-center">
            <ShieldQuestion className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{unreviewed}</p>
            <p className="text-xs text-muted-foreground">Unreviewed</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setFilterVerified("genuine")}>
          <CardContent className="p-4 text-center">
            <ShieldCheck className="h-5 w-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{genuine}</p>
            <p className="text-xs text-muted-foreground">Genuine</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setFilterVerified("suspicious")}>
          <CardContent className="p-4 text-center">
            <ShieldAlert className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{suspicious}</p>
            <p className="text-xs text-muted-foreground">Suspicious</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setFilterVerified("spam")}>
          <CardContent className="p-4 text-center">
            <ShieldAlert className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold">{spam}</p>
            <p className="text-xs text-muted-foreground">Spam</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name, email, phone, location…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterVerified} onValueChange={setFilterVerified}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Review" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            {verifiedOptions.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        {(filterVerified !== "all" || filterStatus !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterVerified("all"); setFilterStatus("all"); }}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Leads list */}
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No leads match your filters.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(lead => {
            const v = verifiedOptions.find(o => o.value === (lead.verified || "unreviewed"));
            const VIcon = v?.icon || ShieldQuestion;
            return (
              <Card key={lead.id} className={cn(
                "group hover:shadow-sm transition-shadow",
                lead.verified === "spam" && "opacity-50"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Verification badge */}
                    <div className="shrink-0 pt-0.5">
                      <VIcon className={cn("h-5 w-5", lead.verified === "genuine" && "text-foreground", lead.verified === "spam" && "text-destructive", (!lead.verified || lead.verified === "unreviewed") && "text-muted-foreground", lead.verified === "suspicious" && "text-muted-foreground")} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{lead.name}</p>
                        <Badge className={cn("text-xs", v?.color)}>{v?.label}</Badge>
                        <Badge variant="outline" className="text-xs">{lead.status || "new"}</Badge>
                        {lead.industry && <Badge variant="secondary" className="text-xs capitalize">{lead.industry}</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                        {lead.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                        {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                        {lead.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{lead.location}</span>}
                        {lead.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{lead.website}</span>}
                      </div>
                      {lead.flagged_reason && (
                        <p className="text-xs text-destructive mt-1">Flag: {lead.flagged_reason}</p>
                      )}
                      {lead.reviewed_at && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">Reviewed {format(new Date(lead.reviewed_at), "dd MMM yyyy HH:mm")}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Quick verify buttons */}
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        title="Mark Genuine"
                        onClick={() => markVerified(lead.id, "genuine")}
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        title="Mark Spam"
                        onClick={() => {
                          const reason = prompt("Why is this spam? (optional)");
                          markVerified(lead.id, "spam", reason || undefined);
                        }}
                      >
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View details" onClick={() => setDetailLead(lead)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(lead)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(lead.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lead detail dialog */}
      <Dialog open={!!detailLead} onOpenChange={o => { if (!o) setDetailLead(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Lead Review — {detailLead?.name}</DialogTitle></DialogHeader>
          {detailLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground block text-xs">Email</span>{detailLead.email || "—"}</div>
                <div><span className="text-muted-foreground block text-xs">Phone</span>{detailLead.phone || "—"}</div>
                <div><span className="text-muted-foreground block text-xs">Location</span>{detailLead.location || "—"}</div>
                <div><span className="text-muted-foreground block text-xs">Industry</span><span className="capitalize">{detailLead.industry || "—"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Website</span>{detailLead.website || "—"}</div>
                <div><span className="text-muted-foreground block text-xs">Source</span>{detailLead.source || "—"}</div>
                <div><span className="text-muted-foreground block text-xs">Company Size</span>{detailLead.company_size || "—"}</div>
                <div><span className="text-muted-foreground block text-xs">Budget Range</span>{detailLead.budget_range || "—"}</div>
              </div>
              {detailLead.address && <div className="text-sm"><span className="text-muted-foreground block text-xs">Address</span>{detailLead.address}</div>}
              {detailLead.notes && <div className="text-sm"><span className="text-muted-foreground block text-xs">Notes</span>{detailLead.notes}</div>}
              {detailLead.flagged_reason && <div className="text-sm text-destructive"><span className="text-destructive/70 block text-xs">Flagged Reason</span>{detailLead.flagged_reason}</div>}

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">Review Decision</p>
                <div className="flex gap-2">
                  <Button
                    variant={detailLead.verified === "genuine" ? "default" : "outline"}
                    size="sm"
                    onClick={() => markVerified(detailLead.id, "genuine")}
                  >
                    <ShieldCheck className="h-4 w-4 mr-1" />Genuine
                  </Button>
                  <Button
                    variant={detailLead.verified === "suspicious" ? "default" : "outline"}
                    size="sm"
                    onClick={() => markVerified(detailLead.id, "suspicious")}
                  >
                    <ShieldAlert className="h-4 w-4 mr-1" />Suspicious
                  </Button>
                  <Button
                    variant={detailLead.verified === "spam" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => {
                      const reason = prompt("Why is this spam? (optional)");
                      markVerified(detailLead.id, "spam", reason || undefined);
                    }}
                  >
                    <ShieldAlert className="h-4 w-4 mr-1" />Spam
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">Lead Status</p>
                <Select value={detailLead.status || "new"} onValueChange={v => { updateStatus(detailLead.id, v); setDetailLead(prev => prev ? { ...prev, status: v } : null); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit dialog */}
      <Dialog open={showForm} onOpenChange={o => { if (!o) resetForm(); setShowForm(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Lead" : "Add Lead"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Company / Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {industryOptions.map(i => <SelectItem key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Location</Label><Input placeholder="e.g. Johannesburg" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Company Size</Label><Input placeholder="e.g. 50-100" value={form.company_size} onChange={e => setForm(f => ({ ...f, company_size: e.target.value }))} /></div>
              <div><Label>Budget Range</Label><Input placeholder="e.g. R50k-R100k" value={form.budget_range} onChange={e => setForm(f => ({ ...f, budget_range: e.target.value }))} /></div>
            </div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div><Label>Website</Label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={save} disabled={!form.name.trim()}>{editing ? "Update" : "Add Lead"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
