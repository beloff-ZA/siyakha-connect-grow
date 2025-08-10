import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import AuthGate from "@/components/msp/AuthGate";

interface SupportCall {
  id: string;
  status: string;
  created_at: string;
  location: string | null;
  issues: string[];
  description: string | null;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [calls, setCalls] = useState<SupportCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const title = "Your Support Dashboard | Siyakha Technology";
    const description = "View and track all your logged support calls with Siyakha Technology.";
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
    const fetchCalls = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("support_calls")
        .select("id, status, created_at, location, issues, description")
        .order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Could not load calls", description: error.message, variant: "destructive" });
      } else {
        setCalls(data as SupportCall[]);
      }
      setLoading(false);
    };

    fetchCalls();

    // Optional: realtime updates for new calls
    const channel = supabase
      .channel("support_calls_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_calls" }, fetchCalls)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_calls" }, fetchCalls)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return (
    <AuthGate>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <section className="py-10 md:py-14 border-b border-border">
            <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
              <h1 className="text-3xl md:text-4xl font-bold text-primary">Your Support Dashboard</h1>
              <p className="text-muted-foreground mt-3">Track all your logged calls in one place.</p>
            </div>
          </section>
          <section className="py-10 md:py-14">
            <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>Logged Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-muted-foreground">Loading your calls...</div>
                  ) : calls.length === 0 ? (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">You have no logged calls yet.</p>
                      <a href="/need-help" className="inline-flex"><Button className="cta-primary">Log a Call</Button></a>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {calls.map((c) => (
                        <li key={c.id} className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                              <div className="font-medium mt-1">{(c.issues || []).join(", ") || "Support Call"}</div>
                              {c.location && <div className="text-sm text-muted-foreground">Location: {c.location}</div>}
                              {c.description && <p className="text-sm mt-2 line-clamp-2">{c.description}</p>}
                            </div>
                            <div>
                              <span className="inline-flex items-center rounded-md border border-border px-2 py-1 text-xs">
                                {c.status}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </AuthGate>
  );
}
