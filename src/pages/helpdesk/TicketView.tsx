import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, User, Building, Mail, Phone } from "lucide-react";

const statusOptions = ["open", "new", "in_progress", "waiting_for_client", "resolved", "closed"];

const TicketView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    const [tRes, nRes, techRes] = await Promise.all([
      supabase.from("tickets").select("*").eq("id", id!).maybeSingle(),
      supabase.from("ticket_notes").select("*").eq("ticket_id", id!).order("created_at", { ascending: true }),
      supabase.from("technicians").select("id, name").eq("is_active", true),
    ]);
    setTicket(tRes.data);
    setNotes(nRes.data || []);
    setTechnicians(techRes.data || []);
    setLoading(false);
  };

  const updateField = async (field: string, value: string | null) => {
    const { error } = await supabase.from("tickets").update({ [field]: value }).eq("id", id!);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" as any });
    else { toast({ title: "Updated" }); loadData(); }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("ticket_notes").insert({
      ticket_id: id!, content: newNote.trim(), author_id: user?.id || null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" as any });
    else { setNewNote(""); loadData(); }
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!ticket) return <p>Ticket not found.</p>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/helpdesk/tickets")}>
        <ArrowLeft className="h-4 w-4 mr-1" />Back to Tickets
      </Button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{ticket.tracking_ref}: {ticket.summary}</CardTitle>
                <Badge variant="outline" className="text-xs">{ticket.category || "—"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.details && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.details}</p>}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{ticket.caller_name || "—"}</div>
                <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" />{ticket.caller_company || "—"}</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{ticket.caller_email || "—"}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{ticket.caller_phone || "—"}</div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />Created {new Date(ticket.created_at).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Internal Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {notes.map(n => (
                <div key={n.id} className="bg-muted/50 rounded p-3">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <Textarea placeholder="Add internal note…" value={newNote} onChange={e => setNewNote(e.target.value)} className="min-h-[60px]" />
                <Button onClick={addNote} disabled={!newNote.trim()}>Add</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Manage Ticket</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={ticket.status} onValueChange={v => updateField("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={ticket.priority} onValueChange={v => updateField("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["low","normal","high","urgent"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assign Technician</Label>
                <Select value={ticket.assigned_technician_id || "unassigned"} onValueChange={v => updateField("assigned_technician_id", v === "unassigned" ? null : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketView;
