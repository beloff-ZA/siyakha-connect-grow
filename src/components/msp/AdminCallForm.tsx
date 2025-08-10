import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthGate from "./AuthGate";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type RoleRow = { role: "admin" | "management" | "technician" | "client" };

const TEAM_RECIPIENTS = [
  "nikita@siyakhatechnology.co.za",
  "ben@siyakhatechnology.co.za",
  "accounts@siyakhatechnology.co.za",
  "admin@siyakhatechnology.co.za",
];

export default function AdminCallForm() {
  const { toast } = useToast();
  const sb = supabase as any;

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdTracking, setCreatedTracking] = useState<{ number: string; link: string } | null>(null);

  // Client + Site
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");

  // Call
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  const isAdminOrMgmt = useMemo(() => roles.some(r => r.role === "admin" || r.role === "management"), [roles]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const { data } = await sb
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      setRoles((data as RoleRow[]) ?? []);
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      toast({ title: "Not signed in", description: "Please sign in to continue.", variant: "destructive" });
      return;
    }

    if (!isAdminOrMgmt) {
      toast({
        title: "Insufficient permissions",
        description: "Only Admin/Management can create clients and log calls at this time.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setCreatedTracking(null);

    // 1) Find or create client
    const { data: existingClient } = await sb
      .from("clients")
      .select("id")
      .ilike("name", clientName)
      .maybeSingle();

    let clientId = existingClient?.id as string | undefined;

    if (!clientId) {
      const { data: newClient, error: clientErr } = await sb
        .from("clients")
        .insert({
          name: clientName,
          email: clientEmail || null,
          phone: clientPhone || null,
          // primary_contact_id can be set later; keeping null here
        })
        .select("id")
        .single();

      if (clientErr) {
        setLoading(false);
        toast({ title: "Client error", description: clientErr.message, variant: "destructive" });
        return;
      }
      clientId = newClient.id as string;
    }

    // 2) Optional site
    let siteId: string | null = null;
    if (siteName || siteAddress) {
      const { data: site, error: siteErr } = await sb
        .from("client_sites")
        .insert({
          client_id: clientId,
          name: siteName || null,
          address: siteAddress || null,
        })
        .select("id")
        .single();
      if (siteErr) {
        setLoading(false);
        toast({ title: "Site error", description: siteErr.message, variant: "destructive" });
        return;
      }
      siteId = site.id as string;
    }

    // 3) Create call
    const { data: call, error: callErr } = await sb
      .from("calls")
      .insert({
        subject,
        description,
        client_id: clientId,
        site_id: siteId,
        created_by: user.id,
        priority,
      })
      .select("id, tracking_number")
      .single();

    if (callErr || !call) {
      setLoading(false);
      toast({ title: "Call error", description: callErr?.message ?? "Failed to create call", variant: "destructive" });
      return;
    }

    // 4) Create tracking link
    const { data: track, error: trackErr } = await sb
      .from("tracking_links")
      .insert({ call_id: call.id })
      .select("token")
      .single();

    if (trackErr || !track) {
      setLoading(false);
      toast({ title: "Tracking link error", description: trackErr?.message ?? "Failed to create link", variant: "destructive" });
      return;
    }

    const link = `${window.location.origin}/track/${track.token}`;
    setCreatedTracking({ number: call.tracking_number as string, link });

    // 5) Email notifications via Edge Function
    const subjectLine = `New Call Logged — ${call.tracking_number}`;
    const lines = [
      `Client: ${clientName}${clientEmail ? ` (${clientEmail})` : ""}`,
      siteName || siteAddress ? `Site: ${siteName || ""} ${siteAddress || ""}`.trim() : "",
      `Priority: ${priority}`,
      `Subject: ${subject}`,
      "",
      `Description:\n${description}`,
      "",
      `Tracking link: ${link}`,
    ].filter(Boolean);

    const textBody = lines.join("\n");

    await supabase.functions.invoke("send-email", {
      body: {
        to: TEAM_RECIPIENTS,
        subject: subjectLine,
        text: textBody,
      },
    });

    toast({ title: "Call logged", description: `Tracking ${call.tracking_number} created and team notified.` });
    setLoading(false);

    // Reset form (keep client info for convenience)
    setSubject("");
    setDescription("");
    setPriority("medium");
    setSiteName("");
    setSiteAddress("");
  };

  return (
    <AuthGate>
      <Card>
        <CardHeader>
          <CardTitle>Log a Client Call</CardTitle>
          <CardDescription>Creates a client (if needed), logs a call with tracking number, and emails the team.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdminOrMgmt ? (
            <div className="p-4 rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
              Your account does not have Admin/Management role. Contact an admin to proceed.
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground/80">Client</h3>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Name</Label>
                  <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input id="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input id="clientPhone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground/80">Site (optional)</h3>
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteAddress">Address</Label>
                  <Textarea id="siteAddress" value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground/80">Call Details</h3>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading} className="cta-primary">
                {loading ? "Logging..." : "Log Call"}
              </Button>

              {createdTracking ? (
                <div className="text-sm text-foreground/80">
                  Created: <span className="font-medium">{createdTracking.number}</span>{" "}
                  — <a className="underline" href={createdTracking.link} target="_blank" rel="noreferrer">Open tracking</a>
                </div>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthGate>
  );
}
