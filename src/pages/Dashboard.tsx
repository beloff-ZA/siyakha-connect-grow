import { useEffect, useMemo, useState } from "react";
// Removed site Header/Footer for app-like dashboard
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import AuthGate from "@/components/msp/AuthGate";
import { LayoutDashboard, Wrench, Wifi, ShieldCheck, MessageSquare, Bell, Search, LogOut } from "lucide-react";
import LogCallDialog from "@/components/msp/LogCallDialog";
import { useCompany } from "@/hooks/useCompany";
import CompanyBanner from "@/components/msp/CompanyBanner";

interface SupportCall {
  id: string;
  status: string;
  created_at: string;
  location: string | null;
  issues: string[];
  description: string | null;
  company_id: string | null; // added so we can scope/filter and handle realtime
}

export default function Dashboard() {
  const { toast } = useToast();
  const [calls, setCalls] = useState<SupportCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileInitials, setProfileInitials] = useState("ME");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logOpen, setLogOpen] = useState(false);

  const { company, loading: companyLoading } = useCompany();

  const openCount = useMemo(() =>
    calls.filter(c => !["closed", "resolved"].includes((c.status || "").toLowerCase())).length
  , [calls]);
  const uniqueLocations = useMemo(() => new Set(calls.map(c => c.location || "Unspecified")).size, [calls]);
  const lastRequest = useMemo(() => calls[0]?.created_at ? new Date(calls[0].created_at).toLocaleDateString() : "—", [calls]);

  useEffect(() => {
    const title = "Client Dashboard | Siyakha Technology";
    const description = "Track your support tickets and updates in one place.";
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/dashboard`);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email || "";
      let initials = email ? email[0].toUpperCase() : "ME";

      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("display_name, company_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (prof) {
          const dn =
            prof.display_name ||
            (((user?.user_metadata as any)?.full_name as string) || "") ||
            (email ? email.split("@")[0] : "");
          const cn = prof.company_name || "";
          initials = (cn || dn || email)
            .split(" ")
            .map((s) => s[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
          setDisplayName(dn);
          setCompanyName(cn);
        }
      }
      setProfileInitials(initials);
    };
    fetchProfile();
  }, []);

  // Load calls, scoped by active company when available, and subscribe to changes
  useEffect(() => {
    const fetchCalls = async () => {
      setLoading(true);

      // Build the base query and scope by company if we have one
      let query = supabase
        .from("support_calls")
        .select("id, status, created_at, location, issues, description, company_id")
        .order("created_at", { ascending: false });

      if (company?.id) {
        query = query.eq("company_id", company.id);
      }

      const { data, error } = await query;

      if (error) {
        toast({ title: "Could not load calls", description: error.message, variant: "destructive" });
      } else {
        setCalls((data || []) as SupportCall[]);
      }
      setLoading(false);
    };

    fetchCalls();

    // Realtime updates, scoped to company where possible
    const channel = supabase
      .channel(company?.id ? `support_calls_${company.id}` : "support_calls_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_calls",
          ...(company?.id ? { filter: `company_id=eq.${company.id}` } : {}),
        },
        fetchCalls
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_calls",
          ...(company?.id ? { filter: `company_id=eq.${company.id}` } : {}),
        },
        fetchCalls
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, company?.id]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-background text-foreground">
        <main className="grid lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:flex h-dvh sticky top-0 flex-col gap-4 p-4 border-r border-border bg-background/80 backdrop-blur">
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-2xl bg-primary/90 text-primary-foreground flex items-center justify-center font-semibold shadow">
                ST
              </div>
              <div>
                <div className="text-lg font-bold leading-tight">Siyakha Technology</div>
                <div className="text-xs text-muted-foreground -mt-0.5">Client Portal</div>
              </div>
            </div>
            <nav className="mt-2 space-y-1">
              <Button variant="default" className="w-full justify-start gap-3 rounded-xl">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
              <a href="#tickets" className="block">
                <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover-scale">
                  <Wrench className="h-4 w-4" /> My Tickets
                </Button>
              </a>
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover-scale" onClick={() => setLogOpen(true)}>
                <MessageSquare className="h-4 w-4" /> Log a Call
              </Button>
            </nav>
            <div className="mt-auto p-3 rounded-2xl border border-border bg-background">
              <div className="text-sm font-medium">Need immediate help?</div>
              <div className="text-xs text-muted-foreground mb-2">Chat to our team now</div>
              <a href="https://wa.me/27815012993" target="_blank" rel="noreferrer" className="inline-flex w-full">
                <Button variant="secondary" className="w-full rounded-xl">WhatsApp Support</Button>
              </a>
            </div>
          </aside>

          {/* Main */}
          <section className="p-4 sm:p-6 lg:p-8">
            {/* Company Banner */}
            {company && <CompanyBanner company={company} className="mb-4" />}

            {/* Topbar */}
            <header className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
              <div className="flex flex-col w-full sm:w-auto gap-1">
                {/* Hero greeting with user full name and company */}
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome, {displayName || (company?.name || companyName) || "there"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Company: {company?.name || companyName || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-[320px]">
                  <Input className="pl-9 rounded-xl" placeholder="Search tickets…" />
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Button variant="ghost" size="icon" className="rounded-2xl">
                  <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-2xl gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{profileInitials}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">{displayName || company?.name || companyName || "Account"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="rounded-2xl shadow-sm animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">Open Tickets</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{openCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Awaiting resolution</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">All Tickets</CardTitle>
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calls.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total requests</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">Locations</CardTitle>
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uniqueLocations}</div>
                  <div className="text-xs text-muted-foreground mt-1">Where issues occurred</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">Last Request</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lastRequest}</div>
                  <div className="text-xs text-muted-foreground mt-1">Most recent ticket</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="mt-6">
              <div className="flex items-center justify-between">
                <TabsList className="rounded-2xl">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tickets">Tickets</TabsTrigger>
                </TabsList>
                <Button className="rounded-2xl" onClick={() => setLogOpen(true)}>Log a Call</Button>
              </div>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-4 lg:grid-cols-7">
                  <Card id="tickets" className="rounded-2xl shadow-sm lg:col-span-4">
                    <CardHeader>
                      <CardTitle>My Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-muted-foreground">Loading your tickets…</div>
                      ) : calls.length === 0 ? (
                        <div className="space-y-4">
                          <p className="text-muted-foreground">You have no tickets yet.</p>
                          <Button className="cta-primary" onClick={() => setLogOpen(true)}>Log a Call</Button>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Issue</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {calls.slice(0, 10).map((c) => (
                              <TableRow key={c.id}>
                                <TableCell className="whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</TableCell>
                                <TableCell className="font-medium">{(c.issues || []).join(", ") || "Support Call"}</TableCell>
                                <TableCell>{c.location || "—"}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{c.status}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl shadow-sm lg:col-span-3">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 sm:grid-cols-2">
                      <Button className="rounded-2xl justify-start gap-2" onClick={() => setLogOpen(true)}><Wrench className="h-4 w-4"/> Log a Call</Button>
                      <a href="https://wa.me/27815012993" target="_blank" rel="noreferrer" className="inline-flex"><Button variant="outline" className="rounded-2xl justify-start gap-2"><MessageSquare className="h-4 w-4"/> WhatsApp</Button></a>
                      <a href="/blog" className="inline-flex"><Button variant="outline" className="rounded-2xl justify-start gap-2"><ShieldCheck className="h-4 w-4"/> Knowledge Base</Button></a>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tickets" className="mt-6">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle>All Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-muted-foreground">Loading your tickets…</div>
                    ) : calls.length === 0 ? (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">You have no tickets yet.</p>
                        <Button className="cta-primary" onClick={() => setLogOpen(true)}>Log a Call</Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Issue</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {calls.map((c) => (
                            <TableRow key={c.id}>
                              <TableCell className="whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</TableCell>
                              <TableCell className="font-medium">{(c.issues || []).join(", ") || "Support Call"}</TableCell>
                              <TableCell>{c.location || "—"}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{c.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <LogCallDialog open={logOpen} onOpenChange={setLogOpen} />

            <footer className="mt-8 text-xs text-muted-foreground">
              © {new Date().getFullYear()} Siyakha Technology — All rights reserved.
            </footer>
          </section>
        </main>
      </div>
    </AuthGate>
  );
}
