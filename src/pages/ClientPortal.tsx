import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Headphones, TicketCheck, Plus, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

const categories = [
  { value: "infrastructure-and-networking", label: "Infrastructure & Networking" },
  { value: "security-and-surveillance", label: "Security & Surveillance" },
  { value: "cloud-and-edge-solutions", label: "Cloud & Edge Solutions" },
  { value: "smart-collaboration-tools", label: "Smart Collaboration Tools" },
  { value: "general-support", label: "General Support" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const ClientPortal: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("normal");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    document.title = "Client Portal | Siyakha Technology";
  }, []);

  const fetchTickets = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tickets")
      .select("id, summary, status, created_at, tracking_ref, priority, category")
      .eq("created_by_user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!summary) {
      toast({ title: "Summary required", description: "Please describe your issue.", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const trackingRef = `TKT-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("tickets").insert({
        created_by_user_id: user.id,
        summary,
        details: details || null,
        category: category || null,
        priority,
        caller_email: user.email || null,
        caller_phone: contactPhone || null,
        tracking_ref: trackingRef,
        channel: "portal",
      });

      if (error) throw error;

      toast({ title: "Call logged successfully!", description: `Your reference: ${trackingRef}` });
      setSummary("");
      setDetails("");
      setCategory("");
      setPriority("normal");
      setContactPhone("");
      setShowForm(false);
      fetchTickets();
    } catch (err: any) {
      toast({ title: "Failed to log call", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "in_progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "resolved": case "closed": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => ["resolved", "closed"].includes(t.status)).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          {/* Welcome */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Client Portal</h1>
              <p className="text-muted-foreground mt-1">Welcome, {user?.email?.split('@')[0]}. Manage your support calls here.</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus size={16} />
              Log a Call
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Clock size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{openCount}</p>
                  <p className="text-sm text-muted-foreground">Open</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgressCount}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{resolvedCount}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Log a Call Form */}
          {showForm && (
            <Card className="mb-8 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones size={20} />
                  Log a Support Call
                </CardTitle>
                <CardDescription>Describe your issue and we'll get back to you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="summary">Issue Summary *</Label>
                    <Input id="summary" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief description of the issue" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details">Details</Label>
                    <Textarea id="details" value={details} onChange={e => setDetails(e.target.value)} rows={4} placeholder="Provide more detail about the problem..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Contact Phone</Label>
                      <Input id="phone" type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+27 81 501 2993" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={creating}>
                      {creating ? "Submitting..." : "Submit Call"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TicketCheck size={20} />
                My Calls
              </CardTitle>
              <CardDescription>Your support call history</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground py-8 text-center">Loading your calls...</div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12">
                  <Headphones size={48} className="mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't logged any calls yet.</p>
                  <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2">
                    <Plus size={16} />
                    Log Your First Call
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tickets.map((t) => (
                    <Link key={t.id} to={`/portal/tickets/${t.id}`} className="block py-4 hover:bg-muted/50 -mx-4 px-4 rounded-md transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{t.summary}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Ref: {t.tracking_ref} • {new Date(t.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {(t.priority === "high" || t.priority === "urgent") && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(t.priority)}`}>
                              {t.priority}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(t.status)}`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientPortal;
