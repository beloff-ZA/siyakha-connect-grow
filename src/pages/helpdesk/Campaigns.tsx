import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Send, Eye, Trash2 } from "lucide-react";

const Campaigns: React.FC = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", subject: "", body_html: "", body_text: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [cRes, lRes] = await Promise.all([
      supabase.from("email_campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("id, name, email").not("email", "is", null),
    ]);
    setCampaigns(cRes.data || []);
    setLeads(lRes.data || []);
    setLoading(false);
  };

  const create = async () => {
    if (!form.name || !form.subject) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: campaign, error } = await supabase.from("email_campaigns").insert({
      name: form.name, subject: form.subject,
      body_html: form.body_html || null, body_text: form.body_text || null,
      created_by: user?.id || null, status: "draft",
    }).select("id").maybeSingle();

    if (error || !campaign) {
      toast({ title: "Error", description: error?.message, variant: "destructive" as any });
      return;
    }

    // Add selected leads as recipients
    if (selectedLeads.length > 0) {
      const recs = selectedLeads.map(lid => {
        const lead = leads.find(l => l.id === lid);
        return { campaign_id: campaign.id, email: lead!.email!, name: lead?.name || null };
      });
      await supabase.from("campaign_recipients").insert(recs);
    }

    toast({ title: "Campaign created" });
    setShowForm(false);
    setForm({ name: "", subject: "", body_html: "", body_text: "" });
    setSelectedLeads([]);
    load();
  };

  const viewDetail = async (campaign: any) => {
    setShowDetail(campaign);
    const { data } = await supabase.from("campaign_recipients").select("*").eq("campaign_id", campaign.id).order("created_at");
    setRecipients(data || []);
  };

  const sendCampaign = async (campaignId: string) => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-campaign", {
        body: { campaign_id: campaignId },
      });
      if (error) throw error;
      toast({ title: "Campaign sent", description: `${data.sent}/${data.total} emails sent` });
      load();
      if (showDetail) viewDetail(showDetail);
    } catch (e: any) {
      toast({ title: "Send failed", description: e.message, variant: "destructive" as any });
    }
    setSending(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    await supabase.from("campaign_recipients").delete().eq("campaign_id", id);
    await supabase.from("email_campaigns").delete().eq("id", id);
    load();
  };

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New Campaign</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Email Campaign</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Campaign Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
              <div><Label>Subject Line *</Label><Input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="e.g. IT Support & Network Solutions for Your School" /></div>
              <div><Label>Email Body (HTML)</Label><Textarea value={form.body_html} onChange={e => setForm(f => ({...f, body_html: e.target.value}))} rows={8} placeholder="<h1>Hello {{name}}</h1><p>Siyakha Technology offers...</p>" /></div>
              <div><Label>Plain Text (fallback)</Label><Textarea value={form.body_text} onChange={e => setForm(f => ({...f, body_text: e.target.value}))} rows={3} /></div>

              {leads.length > 0 && (
                <div>
                  <Label>Select Recipients from Leads ({selectedLeads.length} selected)</Label>
                  <div className="max-h-[200px] overflow-y-auto border rounded p-2 mt-1 space-y-1">
                    {leads.map(l => (
                      <label key={l.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1">
                        <input type="checkbox" checked={selectedLeads.includes(l.id)} onChange={() => toggleLead(l.id)} />
                        <span>{l.name}</span>
                        <span className="text-muted-foreground text-xs ml-auto">{l.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={create} disabled={!form.name || !form.subject} className="w-full">Create Campaign</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? <p className="p-6 text-muted-foreground">Loading…</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No campaigns yet</TableCell></TableRow>
                ) : campaigns.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{c.subject}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "sent" ? "default" : "secondary"}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>{c.sent_count || 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => viewDetail(c)}><Eye className="h-4 w-4" /></Button>
                        {c.status === "draft" && (
                          <Button size="sm" variant="ghost" onClick={() => sendCampaign(c.id)} disabled={sending}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{showDetail?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm"><strong>Subject:</strong> {showDetail?.subject}</p>
            <p className="text-sm"><strong>Status:</strong> {showDetail?.status} · <strong>Sent:</strong> {showDetail?.sent_count || 0}</p>
            <div>
              <Label>Recipients ({recipients.length})</Label>
              <div className="max-h-[300px] overflow-y-auto border rounded mt-1">
                {recipients.map(r => (
                  <div key={r.id} className="flex items-center justify-between px-3 py-2 border-b last:border-0 text-sm">
                    <span>{r.name || r.email}</span>
                    <Badge variant={r.status === "sent" ? "default" : r.status === "failed" ? "destructive" : "secondary"} className="text-xs">{r.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
            {showDetail?.status === "draft" && (
              <Button onClick={() => sendCampaign(showDetail.id)} disabled={sending} className="w-full">
                <Send className="h-4 w-4 mr-1" />Send Campaign
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Campaigns;
