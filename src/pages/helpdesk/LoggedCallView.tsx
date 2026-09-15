import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Printer, Save, Trash2, Plus, CheckCircle2, Eye, Upload, Paperclip, PenLine, FileText, Mail, Wand2, ClipboardList } from "lucide-react";
import JobCardSignSheet from "@/components/helpdesk/JobCardSignSheet";
import SiteSurveyForm from "@/components/helpdesk/SiteSurveyForm";
import { normaliseSurvey, surveyReadiness, type SiteSurvey } from "@/lib/siteSurvey";
import { SOLUTION_TEMPLATES, polishWorkDone, type PolishResult } from "@/lib/writingPolish";
import {
  CALL_PRIORITIES,
  CALL_STATUSES,
  addItem,
  attachmentLink,
  formatDuration,
  formatFileSize,
  getCall,
  listAttachments,
  listItems,
  removeAttachment,
  removeItem,
  resendSignoffSheet,
  signoffReadiness,
  signoffUrl,
  statusLabel,
  timeOnSiteMinutes,
  totalKm,
  updateCall,
  uploadAttachment,
  type LoggedCall,
  type LoggedCallAttachment,
  type LoggedCallItem,
} from "@/lib/loggedCalls";

const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

const LoggedCallView: React.FC = () => {
  const { callId = "" } = useParams();
  const { toast } = useToast();
  const [call, setCall] = useState<LoggedCall | null>(null);
  const [items, setItems] = useState<LoggedCallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ description: "", quantity: "1", serial_number: "" });
  const [files, setFiles] = useState<LoggedCallAttachment[]>([]);
  const [fileLabel, setFileLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [signing, setSigning] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [polish, setPolish] = useState<PolishResult | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const c = await getCall(callId);
      setCall(c);
      if (c) {
        setItems(await listItems(c.id));
        setFiles(await listAttachments(c.id));
      }
    } catch (e: unknown) {
      toast({ title: "Could not load this call", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId]);

  const set = <K extends keyof LoggedCall>(key: K, value: LoggedCall[K]) =>
    setCall((c) => (c ? { ...c, [key]: value } : c));

  const save = async (extra?: Partial<LoggedCall>) => {
    if (!call) return;
    setSaving(true);
    try {
      const {
        id, call_ref, signoff_token, signoff_status, signature_data, signed_at, signed_by_name,
        signed_by_email, satisfaction_rating, signoff_comment, created_at, updated_at, logged_at, ...editable
      } = call;
      await updateCall(call.id, { ...editable, ...extra });
      toast({ title: "Job card saved" });
      load();
    } catch (e: unknown) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    if (!call) return;
    await navigator.clipboard.writeText(signoffUrl(call.signoff_token));
    toast({ title: "Sign-off link copied", description: "Send it to the customer by email or WhatsApp." });
  };

  const emailSheet = async () => {
    if (!call) return;
    setEmailing(true);
    try {
      const res = await resendSignoffSheet(call.signoff_token);
      if (!res?.ok) throw new Error(res?.error || "Could not send the sheet.");
      toast({ title: "Sign-off sheet emailed", description: (res.sent_to || []).join(", ") });
    } catch (e: unknown) {
      toast({ title: "Could not email the sheet", description: (e as Error).message, variant: "destructive" });
    } finally {
      setEmailing(false);
    }
  };

  const handleAddItem = async () => {
    if (!call || !newItem.description.trim()) return;
    await addItem(call.id, {
      description: newItem.description.trim(),
      quantity: Number(newItem.quantity) || 1,
      serial_number: newItem.serial_number.trim() || null,
      sort_order: items.length,
    });
    setNewItem({ description: "", quantity: "1", serial_number: "" });
    setItems(await listItems(call.id));
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!call || !fileList?.length) return;
    setUploading(true);
    try {
      for (const f of Array.from(fileList)) await uploadAttachment(call.id, f, fileLabel);
      setFileLabel("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFiles(await listAttachments(call.id));
      toast({ title: fileList.length > 1 ? "Files uploaded" : "File uploaded" });
    } catch (e: unknown) {
      toast({ title: "Upload failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const openFile = async (att: LoggedCallAttachment) => {
    try {
      window.open(await attachmentLink(att.storage_path), "_blank");
    } catch (e: unknown) {
      toast({ title: "Could not open file", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (loading) return <><p className="text-muted-foreground">Loading…</p></>;
  if (!call)
    return (
      <>
        <p className="text-muted-foreground">This call could not be found.</p>
      </>
    );

  const locked = call.signoff_status === "signed";
  const readiness = signoffReadiness(call);
  const km = totalKm(call.opening_km, call.closing_km);
  const mins = timeOnSiteMinutes(call.arrival_at, call.departure_at);

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/helpdesk/logged-calls">
            <Button variant="ghost" size="sm" className="min-h-11">
              <ArrowLeft className="h-4 w-4 mr-1" />
              All calls
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">
              {call.call_ref}
              {call.sit_number ? ` · SIT ${call.sit_number}` : ""} — {call.end_customer_company}
            </h1>
            <p className="text-xs text-muted-foreground">
              {[call.site_address, call.city].filter(Boolean).join(", ") || "No site address captured"}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Badge variant="outline">{statusLabel(call.status)}</Badge>
            {locked ? <Badge className="bg-foreground text-background">Signed off</Badge> : <Badge variant="outline">Sign-off pending</Badge>}
            <Link to={`/helpdesk/logged-calls/${call.id}/view`}>
              <Button variant="outline" size="sm" className="min-h-11">
                <Eye className="h-4 w-4 mr-1" />
                View job card
              </Button>
            </Link>
            <Link to={`/helpdesk/logged-calls/${call.id}/sheet`}>
              <Button variant="outline" size="sm" className="min-h-11">
                <FileText className="h-4 w-4 mr-1" />
                Satio sign-off sheet
              </Button>
            </Link>
            {locked ? (
              <Button size="sm" className="min-h-11" onClick={emailSheet} disabled={emailing}>
                <Mail className="h-4 w-4 mr-1" />
                {emailing ? "Sending…" : "Email signed sheet"}
              </Button>
            ) : (
              <Button size="sm" className="min-h-11" onClick={() => setSigning(true)}>
                <PenLine className="h-4 w-4 mr-1" />
                Hand over to client to sign
              </Button>
            )}
          </div>
        </div>

        {locked && (
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <CheckCircle2 className="h-5 w-5" />
              <div className="text-sm">
                <p className="font-medium">
                  Signed by {call.signed_by_name} · {call.satisfaction_rating}/5
                </p>
                <p className="text-muted-foreground text-xs">
                  {call.signed_at ? new Date(call.signed_at).toLocaleString("en-ZA") : ""}
                  {call.signoff_comment ? ` — “${call.signoff_comment}”` : ""}
                </p>
              </div>
              {call.signature_data && <img src={call.signature_data} alt="Customer signature" className="ml-auto max-h-16" />}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="card">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="card" className="min-h-11">Job card</TabsTrigger>
            <TabsTrigger value="work" className="min-h-11">Work &amp; travel</TabsTrigger>
            <TabsTrigger value="items" className="min-h-11">Items used</TabsTrigger>
            <TabsTrigger value="survey" className="min-h-11">Site survey</TabsTrigger>
            <TabsTrigger value="files" className="min-h-11">Forms &amp; files</TabsTrigger>
            <TabsTrigger value="signoff" className="min-h-11">Customer sign-off</TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Call &amp; customer details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div><Label>SIT / call number</Label><Input value={call.sit_number ?? ""} onChange={(e) => set("sit_number", e.target.value)} /></div>
                  <div><Label>Customer logging the call</Label><Input value={call.logging_customer ?? ""} onChange={(e) => set("logging_customer", e.target.value)} /></div>
                  <div><Label>Their reference / order no.</Label><Input value={call.customer_order_ref ?? ""} onChange={(e) => set("customer_order_ref", e.target.value)} /></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div><Label>End customer</Label><Input value={call.end_customer_company} onChange={(e) => set("end_customer_company", e.target.value)} /></div>
                  <div><Label>Contact first name</Label><Input value={call.end_customer_first_name ?? ""} onChange={(e) => set("end_customer_first_name", e.target.value)} /></div>
                  <div><Label>Contact surname</Label><Input value={call.end_customer_last_name ?? ""} onChange={(e) => set("end_customer_last_name", e.target.value)} /></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Contact number</Label><Input value={call.contact_number ?? ""} onChange={(e) => set("contact_number", e.target.value)} /></div>
                  <div><Label>Contact email</Label><Input type="email" value={call.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} /></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Client email (who logged the call)</Label>
                    <Input type="email" value={call.client_email ?? ""} onChange={(e) => set("client_email", e.target.value)} />
                    <p className="mt-1 text-xs text-muted-foreground">The signed job card is emailed here, plus accounts and admin.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2"><Label>Site address</Label><Input value={call.site_address ?? ""} onChange={(e) => set("site_address", e.target.value)} /></div>
                  <div><Label>Town / city</Label><Input value={call.city ?? ""} onChange={(e) => set("city", e.target.value)} /></div>
                </div>
                <div><Label>Fault / request as logged</Label><Textarea rows={4} value={call.fault_description ?? ""} onChange={(e) => set("fault_description", e.target.value)} /></div>
                <div><Label>Special instructions</Label><Textarea rows={3} value={call.special_instructions ?? ""} onChange={(e) => set("special_instructions", e.target.value)} /></div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div><Label>Engineer</Label><Input value={call.engineer_name ?? ""} onChange={(e) => set("engineer_name", e.target.value)} /></div>
                  <div>
                    <Label>Status</Label>
                    <Select value={call.status} onValueChange={(v) => set("status", v)} disabled={locked}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={call.priority} onValueChange={(v) => set("priority", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CALL_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{statusLabel(p)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Appointment</Label>
                    <Input type="datetime-local" value={toLocalInput(call.scheduled_at)} onChange={(e) => set("scheduled_at", fromLocalInput(e.target.value))} />
                  </div>
                </div>
                <Button onClick={() => save()} disabled={saving} className="min-h-11">
                  <Save className="h-4 w-4 mr-1" />{saving ? "Saving…" : "Save job card"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Work done, time and travel</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Fault solution / work done (shown to the customer)</Label>
                  <Textarea
                    rows={6}
                    value={call.fault_solution ?? ""}
                    onChange={(e) => {
                      set("fault_solution", e.target.value);
                      setPolish(null);
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11"
                      disabled={!call.fault_solution?.trim()}
                      onClick={() => setPolish(polishWorkDone(call.fault_solution ?? ""))}
                    >
                      <Wand2 className="h-4 w-4 mr-1" />
                      Improve wording
                    </Button>
                    {SOLUTION_TEMPLATES.map((t) => (
                      <Button
                        key={t.label}
                        variant="ghost"
                        size="sm"
                        className="min-h-11"
                        onClick={() => {
                          const existing = (call.fault_solution ?? "").trim();
                          set("fault_solution", existing ? `${existing}\n${t.text}` : t.text);
                          setPolish(null);
                        }}
                      >
                        + {t.label}
                      </Button>
                    ))}
                  </div>
                  {polish && (
                    <div className="rounded-md border border-border p-3 space-y-3 text-sm">
                      <p className="font-medium">Suggested wording</p>
                      <p className="whitespace-pre-wrap">{polish.text}</p>
                      {polish.changes.length > 0 && (
                        <ul className="list-disc pl-5 text-xs text-muted-foreground">
                          {polish.changes.map((c) => <li key={c}>{c}</li>)}
                        </ul>
                      )}
                      {polish.suggestions.length > 0 && (
                        <>
                          <p className="font-medium text-xs uppercase tracking-wide">Worth adding</p>
                          <ul className="list-disc pl-5 text-xs text-muted-foreground">
                            {polish.suggestions.map((s) => <li key={s}>{s}</li>)}
                          </ul>
                        </>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="min-h-11"
                          onClick={() => {
                            set("fault_solution", polish.text);
                            setPolish(null);
                          }}
                        >
                          Use this wording
                        </Button>
                        <Button variant="ghost" size="sm" className="min-h-11" onClick={() => setPolish(null)}>
                          Keep mine
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div><Label>Change control (equipment replaced or removed: S/N + description)</Label><Textarea rows={3} value={call.change_control ?? ""} onChange={(e) => set("change_control", e.target.value)} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Arrival date &amp; time</Label><Input type="datetime-local" value={toLocalInput(call.arrival_at)} onChange={(e) => set("arrival_at", fromLocalInput(e.target.value))} /></div>
                  <div><Label>Departure date &amp; time</Label><Input type="datetime-local" value={toLocalInput(call.departure_at)} onChange={(e) => set("departure_at", fromLocalInput(e.target.value))} /></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div><Label>Opening km</Label><Input type="number" value={call.opening_km ?? ""} onChange={(e) => set("opening_km", e.target.value === "" ? null : Number(e.target.value))} /></div>
                  <div><Label>Closing km</Label><Input type="number" value={call.closing_km ?? ""} onChange={(e) => set("closing_km", e.target.value === "" ? null : Number(e.target.value))} /></div>
                  <div>
                    <Label>Totals</Label>
                    <p className="text-sm mt-2">{km === null ? "— km" : `${km} km`} · {formatDuration(mins)} on site</p>
                  </div>
                </div>
                <div><Label>Internal notes (never shown to the customer)</Label><Textarea rows={3} value={call.internal_notes ?? ""} onChange={(e) => set("internal_notes", e.target.value)} /></div>
                <Button onClick={() => save()} disabled={saving} className="min-h-11">
                  <Save className="h-4 w-4 mr-1" />{saving ? "Saving…" : "Save"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="survey" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Site survey (complete on site)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The customer&apos;s survey sheet, digitally. Fill it in on site — once it has anything captured it
                  prints and emails together with the sign-off sheet.
                </p>
                {(() => {
                  const survey = normaliseSurvey(call.site_survey, {
                    customer: call.end_customer_company || "",
                    site_branch: call.city || "",
                    site_contact: [call.end_customer_first_name, call.end_customer_last_name].filter(Boolean).join(" "),
                    engineer: call.engineer_name || "",
                  });
                  const readiness = surveyReadiness(survey);
                  return (
                    <>
                      <SiteSurveyForm
                        survey={survey}
                        onChange={(next: SiteSurvey) => set("site_survey", next as unknown as LoggedCall["site_survey"])}
                      />
                      {!readiness.ready && (
                        <div className="rounded-md border border-border p-3 text-sm">
                          <p className="font-medium">Still to complete:</p>
                          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                            {readiness.missing.map((m) => <li key={m}>{m}</li>)}
                          </ul>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => save()} disabled={saving} className="min-h-11">
                          <Save className="h-4 w-4 mr-1" />{saving ? "Saving…" : "Save survey"}
                        </Button>
                        <Link to={`/helpdesk/logged-calls/${call.id}/sheet`}>
                          <Button variant="outline" className="min-h-11">
                            <ClipboardList className="h-4 w-4 mr-1" />Preview / print with job card
                          </Button>
                        </Link>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Additional items used</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {items.length === 0 && <p className="text-sm text-muted-foreground">No items captured yet.</p>}
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 border-b border-border pb-2 text-sm">
                    <span className="flex-1">{it.description}{it.serial_number ? ` · S/N ${it.serial_number}` : ""}</span>
                    <span className="text-muted-foreground">Qty {it.quantity}</span>
                    <Button variant="ghost" size="sm" className="min-h-11" onClick={async () => { await removeItem(it.id); setItems(await listItems(call.id)); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="grid gap-3 sm:grid-cols-[2fr_80px_1fr_auto] sm:items-end">
                  <div><Label>Description</Label><Input value={newItem.description} onChange={(e) => setNewItem((n) => ({ ...n, description: e.target.value }))} /></div>
                  <div><Label>Qty</Label><Input type="number" value={newItem.quantity} onChange={(e) => setNewItem((n) => ({ ...n, quantity: e.target.value }))} /></div>
                  <div><Label>Serial number</Label><Input value={newItem.serial_number} onChange={(e) => setNewItem((n) => ({ ...n, serial_number: e.target.value }))} /></div>
                  <Button onClick={handleAddItem} disabled={!newItem.description.trim()} className="min-h-11"><Plus className="h-4 w-4 mr-1" />Add</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Uploaded forms, photos &amp; documents</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload the customer&apos;s own forms (like the Saicom site survey), site photos or a scanned sign-off. Only your team can open these.
                </p>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <Label>What is this file? (optional)</Label>
                    <Input value={fileLabel} placeholder="e.g. Saicom site survey" onChange={(e) => setFileLabel(e.target.value)} />
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="min-h-11">
                    <Upload className="h-4 w-4 mr-1" />{uploading ? "Uploading…" : "Upload file"}
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
                {files.length === 0 && <p className="text-sm text-muted-foreground">No files uploaded yet.</p>}
                {files.map((f) => (
                  <div key={f.id} className="flex flex-wrap items-center gap-3 border-b border-border pb-2 text-sm">
                    <Paperclip className="h-4 w-4 shrink-0" />
                    <span className="flex-1 min-w-[160px] break-all">{f.label ? `${f.label} — ` : ""}{f.file_name}</span>
                    <span className="text-muted-foreground">{formatFileSize(f.size_bytes)}</span>
                    <Button variant="outline" size="sm" className="min-h-11" onClick={() => openFile(f)}>Open</Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-11"
                      onClick={async () => {
                        try {
                          await removeAttachment(f);
                          setFiles(await listAttachments(call.id));
                        } catch (e: unknown) {
                          toast({ title: "Could not remove file", description: (e as Error).message, variant: "destructive" });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signoff" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Customer sign-off link</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {locked ? (
                  <p className="text-sm">This job card was signed off by {call.signed_by_name}. The sign-off is final and locked.</p>
                ) : (
                  <>
                    {!readiness.ready && (
                      <div className="rounded-md border border-border p-3 text-sm">
                        <p className="font-medium">Complete these before sending the link:</p>
                        <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                          {readiness.missing.map((m) => <li key={m}>{m}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="rounded-md border border-border p-4 space-y-2">
                      <p className="font-medium text-sm">Signing on site, right now</p>
                      <p className="text-sm text-muted-foreground">
                        Hand this phone, tablet or laptop to the customer. They see the full Satio sign-off sheet with
                        every detail filled in, then sign it on the sheet itself — first name, surname, date, time and
                        signature. The signed sheet is emailed to them, to the client and to accounts and admin.
                      </p>
                      <Button onClick={() => setSigning(true)} disabled={!readiness.ready} className="min-h-11">
                        <PenLine className="h-4 w-4 mr-1" />Hand over to client to sign
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Or send them the link</Label>
                      <div className="flex flex-wrap gap-2">
                        <Input readOnly value={signoffUrl(call.signoff_token)} className="flex-1 min-w-[240px] font-mono text-xs" />
                        <Button variant="outline" onClick={copyLink} className="min-h-11"><Copy className="h-4 w-4 mr-1" />Copy</Button>
                        <Button variant="outline" onClick={() => window.open(signoffUrl(call.signoff_token), "_blank")} className="min-h-11">Preview</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The customer opens this on their phone, checks the job card, rates the service and signs. No login needed.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => save({ status: "awaiting_signoff" })} disabled={saving || !readiness.ready} className="min-h-11">
                        Mark as sent for sign-off
                      </Button>
                      <Link to={`/helpdesk/logged-calls/${call.id}/sheet`}>
                        <Button variant="outline" className="min-h-11">
                          <Printer className="h-4 w-4 mr-1" />Print Satio sign-off sheet
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {signing && !locked && (
        <JobCardSignSheet
          call={call}
          items={items}
          onClose={() => {
            setSigning(false);
            void load();
          }}
          onSigned={() => void load()}
        />
      )}
    </>
  );
};

export default LoggedCallView;
