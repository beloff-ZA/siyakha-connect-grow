import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, User, Building, Mail, Phone, Paperclip, Upload } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

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

    // Load attachments
    const { data: files } = await supabase.storage.from("ticket-attachments").list(`${id}`);
    setAttachments((files || []).map(f => f.name));
    
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

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("ticket-attachments").upload(path, file);
    if (error) toast({ title: "Upload failed", description: error.message, variant: "destructive" as any });
    else { toast({ title: "File uploaded" }); loadData(); }
    setUploading(false);
    e.target.value = "";
  };

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage.from("ticket-attachments").getPublicUrl(`${id}/${fileName}`);
    return data.publicUrl;
  };

  const downloadFile = async (fileName: string) => {
    const { data, error } = await supabase.storage.from("ticket-attachments").download(`${id}/${fileName}`);
    if (error || !data) {
      toast({ title: "Download failed", variant: "destructive" as any });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-muted-foreground p-6">Loading…</p>;
  if (!ticket) return <p className="p-6">Ticket not found.</p>;

  const prioColor = (p: string) => {
    switch (p) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

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
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg">{ticket.tracking_ref}: {ticket.summary}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className={prioColor(ticket.priority)}>{ticket.priority}</Badge>
                  <Badge variant="outline" className="text-xs">{ticket.category || "General"}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.details && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.details}</p>}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>{ticket.caller_name || "—"}</span></div>
                <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /><span>{ticket.caller_company || "—"}</span></div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{ticket.caller_email || "—"}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{ticket.caller_phone || "—"}</span></div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />Created {new Date(ticket.created_at).toLocaleString()}
                {ticket.updated_at !== ticket.created_at && (
                  <span>· Updated {new Date(ticket.updated_at).toLocaleString()}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Attachments ({attachments.length})</CardTitle>
                <label className="cursor-pointer">
                  <input type="file" className="hidden" onChange={uploadFile} disabled={uploading} />
                  <Button size="sm" variant="outline" asChild disabled={uploading}>
                    <span><Upload className="h-3 w-3 mr-1" />{uploading ? "Uploading…" : "Upload File"}</span>
                  </Button>
                </label>
              </div>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attachments</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map(f => (
                    <div key={f} className="flex items-center justify-between bg-muted/50 rounded px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{f.replace(/^\d+-/, "")}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => downloadFile(f)}>Download</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Internal Notes ({notes.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet</p>}
              {notes.map(n => (
                <div key={n.id} className="bg-muted/50 rounded p-3">
                  <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <Textarea placeholder="Add internal note…" value={newNote} onChange={e => setNewNote(e.target.value)} className="min-h-[60px]" />
                <Button onClick={addNote} disabled={!newNote.trim()} className="self-end">Add</Button>
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
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={ticket.status} onValueChange={v => updateField("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select value={ticket.priority} onValueChange={v => updateField("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["low","normal","high","urgent"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Assign Technician</Label>
                <Select value={ticket.assigned_technician_id || "unassigned"} onValueChange={v => updateField("assigned_technician_id", v === "unassigned" ? null : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={ticket.category || "Other"} onValueChange={v => updateField("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Network","Hardware","Software","WiFi","CCTV","Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {ticket.caller_email && (
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href={`mailto:${ticket.caller_email}?subject=Re: ${ticket.tracking_ref} - ${ticket.summary}`}>
                    <Mail className="h-4 w-4 mr-2" />Email Client
                  </a>
                </Button>
              )}
              {ticket.caller_phone && (
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href={`tel:${ticket.caller_phone}`}>
                    <Phone className="h-4 w-4 mr-2" />Call Client
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketView;
