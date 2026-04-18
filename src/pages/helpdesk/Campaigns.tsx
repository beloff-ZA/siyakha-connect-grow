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
import { Plus, Send, Eye, Trash2, Copy, Download, Mail } from "lucide-react";

const defaultTemplate = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <div style="background:#002E5D;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;">Siyakha Technology</h1>
    <p style="color:#ccc;margin:4px 0 0;font-size:13px;">IT Solutions & Managed Services</p>
  </div>
  <div style="background:#f9f9f9;padding:24px;border:1px solid #e5e5e5;">
    <h2 style="color:#002E5D;margin:0 0 12px;">IT Support & Network Solutions</h2>
    <p style="color:#333;line-height:1.6;">Dear {{name}},</p>
    <p style="color:#333;line-height:1.6;">Siyakha Technology provides comprehensive IT solutions including:</p>
    <ul style="color:#333;line-height:1.8;">
      <li>🖥️ IT Support & Managed Services</li>
      <li>🌐 Networking & Infrastructure</li>
      <li>📹 CCTV & Security</li>
      <li>📞 VoIP & Collaboration</li>
      <li>📶 WiFi Solutions</li>
      <li>☁️ Cloud & Edge Computing</li>
    </ul>
    <p style="color:#333;line-height:1.6;">Let us help your organisation with reliable, professional IT support.</p>
    <div style="text-align:center;margin:20px 0;">
      <a href="https://siyakhatechnology.co.za" style="background:#002E5D;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">Visit Our Website</a>
    </div>
  </div>
  <div style="text-align:center;padding:16px;color:#888;font-size:12px;">
    <p>Siyakha Technology • nikita@siyakhatechnology.co.za • 081 501 2993</p>
  </div>
</div>`;

const Campaigns: React.FC = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", subject: "", body_html: defaultTemplate, body_text: "" });
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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

    if (selectedLeads.length > 0) {
      const recs = selectedLeads.map(lid => {
        const lead = leads.find(l => l.id === lid);
        return { campaign_id: campaign.id, email: lead!.email!, name: lead?.name || null };
      });
      await supabase.from("campaign_recipients").insert(recs);
    }

    toast({ title: "Campaign created" });
    setShowForm(false);
    setForm({ name: "", subject: "", body_html: defaultTemplate, body_text: "" });
    setSelectedLeads([]);
    load();
  };

  const viewDetail = async (campaign: any) => {
    setShowDetail(campaign);
    const { data } = await supabase.from("campaign_recipients").select("*").eq("campaign_id", campaign.id).order("created_at");
    setRecipients(data || []);
  };

  // Send via mailto (opens user's email client with BCC recipients)
  const sendViaMailto = async (campaign: any, recs: any[]) => {
    const pendingRecs = recs.filter(r => r.status === "pending");
    if (pendingRecs.length === 0) {
      toast({ title: "No pending recipients" });
      return;
    }

    const bcc = pendingRecs.map(r => r.email).join(",");
    const subject = encodeURIComponent(campaign.subject || "");
    const bodyText = encodeURIComponent(campaign.body_text || campaign.subject || "");
    const mailtoUrl = `mailto:?bcc=${bcc}&subject=${subject}&body=${bodyText}`;

    // Open email client
    window.open(mailtoUrl, "_blank");

    // Mark as sent
    setSending(true);
    for (const r of pendingRecs) {
      await supabase.from("campaign_recipients")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", r.id);
    }
    await supabase.from("email_campaigns")
      .update({ status: "sent", sent_count: pendingRecs.length })
      .eq("id", campaign.id);
    
    toast({ title: "Email client opened", description: `${pendingRecs.length} recipients added as BCC. Send from your email client.` });
    setSending(false);
    load();
    if (showDetail) viewDetail(showDetail);
  };

  const copyEmails = (recs: any[]) => {
    const emails = recs.map(r => r.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast({ title: "Copied!", description: `${recs.length} email addresses copied to clipboard.` });
  };

  const copyHtmlTemplate = (campaign: any) => {
    navigator.clipboard.writeText(campaign.body_html || campaign.body_text || "");
    toast({ title: "Template copied!", description: "Paste into your email client." });
  };

  const downloadCsv = (campaign: any, recs: any[]) => {
    const csv = "Name,Email,Status\n" + recs.map(r => `"${r.name || ""}","${r.email}","${r.status}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${campaign.name}-recipients.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    await supabase.from("campaign_recipients").delete().eq("campaign_id", id);
    await supabase.from("email_campaigns").delete().eq("id", id);
    setShowDetail(null);
    load();
  };

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  const selectAllLeads = () => {
    if (selectedLeads.length === leads.length) setSelectedLeads([]);
    else setSelectedLeads(leads.map(l => l.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Create campaigns, select recipients from leads, and send via your email client.</p>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New Campaign</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Email Campaign</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Campaign Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
              <div><Label>Subject Line *</Label><Input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="e.g. IT Support & Network Solutions for Your School" /></div>
              
              <div>
                <div className="flex items-center justify-between">
                  <Label>Email Template (HTML)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                    {showPreview ? "Edit" : "Preview"}
                  </Button>
                </div>
                {showPreview ? (
                  <div className="border rounded p-4 bg-background max-h-[300px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: form.body_html }} />
                ) : (
                  <Textarea value={form.body_html} onChange={e => setForm(f => ({...f, body_html: e.target.value}))} rows={10} className="font-mono text-xs" />
                )}
              </div>

              <div><Label>Plain Text Version (for mailto body)</Label><Textarea value={form.body_text} onChange={e => setForm(f => ({...f, body_text: e.target.value}))} rows={3} placeholder="Hello, Siyakha Technology provides IT Support, Networking, CCTV, VoIP..." /></div>

              {leads.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Select Recipients from Leads ({selectedLeads.length}/{leads.length})</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={selectAllLeads}>
                      {selectedLeads.length === leads.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto border rounded p-2 mt-1 space-y-1">
                    {leads.map(l => (
                      <label key={l.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1">
                        <input type="checkbox" checked={selectedLeads.includes(l.id)} onChange={() => toggleLead(l.id)} className="rounded" />
                        <span className="font-medium">{l.name}</span>
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
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No campaigns yet — create one above</TableCell></TableRow>
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
                        <Button size="sm" variant="ghost" onClick={() => viewDetail(c)} title="View details"><Eye className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(c.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{showDetail?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Subject:</strong> {showDetail?.subject}</div>
              <div><strong>Status:</strong> <Badge variant={showDetail?.status === "sent" ? "default" : "secondary"}>{showDetail?.status}</Badge></div>
            </div>

            {/* Email Preview */}
            {showDetail?.body_html && (
              <div>
                <Label className="text-sm font-medium">Email Preview</Label>
                <div className="border rounded p-4 bg-background max-h-[250px] overflow-y-auto mt-1" dangerouslySetInnerHTML={{ __html: showDetail.body_html }} />
              </div>
            )}

            {/* Recipients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Recipients ({recipients.length})</Label>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => copyEmails(recipients)} title="Copy emails">
                    <Copy className="h-3 w-3 mr-1" />Copy Emails
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadCsv(showDetail, recipients)} title="Download CSV">
                    <Download className="h-3 w-3 mr-1" />CSV
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyHtmlTemplate(showDetail)} title="Copy template">
                    <Copy className="h-3 w-3 mr-1" />Template
                  </Button>
                </div>
              </div>
              <div className="max-h-[200px] overflow-y-auto border rounded">
                {recipients.length === 0 ? (
                  <p className="p-4 text-muted-foreground text-sm text-center">No recipients added</p>
                ) : recipients.map(r => (
                  <div key={r.id} className="flex items-center justify-between px-3 py-2 border-b last:border-0 text-sm">
                    <div>
                      <span className="font-medium">{r.name || "—"}</span>
                      <span className="text-muted-foreground text-xs ml-2">{r.email}</span>
                    </div>
                    <Badge variant={r.status === "sent" ? "default" : r.status === "failed" ? "destructive" : "secondary"} className="text-xs">{r.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Send actions */}
            {showDetail?.status === "draft" && recipients.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">Send via your email client — recipients will be added as BCC:</p>
                <Button
                  onClick={() => sendViaMailto(showDetail, recipients)}
                  disabled={sending}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />Open in Email Client ({recipients.filter(r => r.status === "pending").length} recipients)
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Campaigns;
