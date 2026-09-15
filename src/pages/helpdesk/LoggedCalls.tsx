import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, Eye, PhoneCall, CheckCircle2, Clock } from "lucide-react";
import {
  CALL_PRIORITIES,
  CALL_STATUSES,
  createCall,
  listCalls,
  statusLabel,
  customerName,
  type LoggedCall,
} from "@/lib/loggedCalls";

const emptyForm = {
  sit_number: "",
  logging_customer: "",
  customer_order_ref: "",
  end_customer_company: "",
  end_customer_first_name: "",
  end_customer_last_name: "",
  contact_number: "",
  contact_email: "",
  site_address: "",
  city: "",
  fault_description: "",
  special_instructions: "",
  engineer_name: "",
  priority: "normal",
  scheduled_at: "",
};

const LoggedCalls: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [calls, setCalls] = useState<LoggedCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      setCalls(await listCalls());
    } catch (e: unknown) {
      toast({ title: "Could not load calls", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.end_customer_company.trim()) return;
    setSaving(true);
    try {
      await createCall(
        {
          ...form,
          scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
        } as Partial<LoggedCall>,
        user?.id,
      );
      toast({ title: "Call logged" });
      setForm(emptyForm);
      setShowCreate(false);
      load();
    } catch (e: unknown) {
      toast({ title: "Could not log the call", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return calls.filter((c) => {
      if (statusFilter === "open" && ["signed_off", "cancelled"].includes(c.status)) return false;
      if (statusFilter !== "open" && statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!s) return true;
      return [c.call_ref, c.sit_number, c.end_customer_company, c.city, c.engineer_name, c.logging_customer]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s));
    });
  }, [calls, search, statusFilter]);

  const stats = useMemo(() => {
    const open = calls.filter((c) => !["signed_off", "cancelled"].includes(c.status)).length;
    const awaiting = calls.filter((c) => c.signoff_status !== "signed" && c.status === "awaiting_signoff").length;
    const signed = calls.filter((c) => c.signoff_status === "signed").length;
    return { open, awaiting, signed };
  }, [calls]);

  return (
    <>
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Open calls", value: stats.open, icon: PhoneCall },
            { label: "Awaiting customer sign-off", value: stats.awaiting, icon: Clock },
            { label: "Signed off", value: stats.signed, icon: CheckCircle2 },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <s.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-semibold leading-none">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by reference, SIT number, customer, town…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open calls</SelectItem>
              <SelectItem value="all">All calls</SelectItem>
              {CALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="min-h-11">
                <Plus className="h-4 w-4 mr-1" />
                Log a call
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log a new call</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label>SIT / call number</Label>
                    <Input value={form.sit_number} onChange={(e) => set("sit_number", e.target.value)} placeholder="38195" />
                  </div>
                  <div>
                    <Label>Customer logging the call</Label>
                    <Input value={form.logging_customer} onChange={(e) => set("logging_customer", e.target.value)} placeholder="Satio Business Solutions" />
                  </div>
                  <div>
                    <Label>Their reference / order no.</Label>
                    <Input value={form.customer_order_ref} onChange={(e) => set("customer_order_ref", e.target.value)} placeholder="Saicom ref. Claudine" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label>End customer *</Label>
                    <Input value={form.end_customer_company} onChange={(e) => set("end_customer_company", e.target.value)} placeholder="InteliGro" />
                  </div>
                  <div>
                    <Label>Contact first name</Label>
                    <Input value={form.end_customer_first_name} onChange={(e) => set("end_customer_first_name", e.target.value)} />
                  </div>
                  <div>
                    <Label>Contact surname</Label>
                    <Input value={form.end_customer_last_name} onChange={(e) => set("end_customer_last_name", e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Contact number</Label>
                    <Input value={form.contact_number} onChange={(e) => set("contact_number", e.target.value)} placeholder="072 647 4783" />
                  </div>
                  <div>
                    <Label>Contact email (for the sign-off link)</Label>
                    <Input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <Label>Site address</Label>
                    <Input value={form.site_address} onChange={(e) => set("site_address", e.target.value)} placeholder="17 Fortuna Street" />
                  </div>
                  <div>
                    <Label>Town / city</Label>
                    <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Viljoenskroon" />
                  </div>
                </div>

                <div>
                  <Label>Fault / request as logged</Label>
                  <Textarea rows={4} value={form.fault_description} onChange={(e) => set("fault_description", e.target.value)} />
                </div>
                <div>
                  <Label>Special instructions (tools, site contacts)</Label>
                  <Textarea rows={3} value={form.special_instructions} onChange={(e) => set("special_instructions", e.target.value)} />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label>Engineer</Label>
                    <Input value={form.engineer_name} onChange={(e) => set("engineer_name", e.target.value)} placeholder="Nikita" />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CALL_PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {statusLabel(p)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Appointment</Label>
                    <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => set("scheduled_at", e.target.value)} />
                  </div>
                </div>

                <Button onClick={handleCreate} disabled={!form.end_customer_company.trim() || saving} className="w-full min-h-11">
                  {saving ? "Logging…" : "Log call"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <p className="p-6 text-muted-foreground">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>End customer</TableHead>
                    <TableHead className="hidden md:table-cell">Site</TableHead>
                    <TableHead className="hidden lg:table-cell">Engineer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sign-off</TableHead>
                    <TableHead className="hidden sm:table-cell">Logged</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        No calls yet — use “Log a call” to create the first job card.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">
                          <div>{c.call_ref}</div>
                          {c.sit_number && <div className="text-muted-foreground">SIT {c.sit_number}</div>}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate font-medium">{c.end_customer_company}</div>
                          <div className="truncate text-xs text-muted-foreground">{customerName(c) || c.logging_customer || "—"}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{c.city || "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{c.engineer_name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{statusLabel(c.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          {c.signoff_status === "signed" ? (
                            <Badge className="bg-foreground text-background">Signed</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {new Date(c.logged_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Link to={`/helpdesk/logged-calls/${c.id}`}>
                            <Button size="sm" variant="ghost" className="min-h-11">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoggedCalls;
