import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const TicketsList: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "My Tickets | Siyakha Technology";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", "View your logged tickets and their current status.");
    if (!meta.parentNode) document.head.appendChild(meta);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", window.location.href);
    if (!canonical.parentNode) document.head.appendChild(canonical);

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("tickets")
        .select("id, summary, status, created_at, tracking_ref, priority")
        .order("created_at", { ascending: false });
      if (!error) setTickets(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">My Tickets</h1>
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading…</div>
            ) : tickets.length === 0 ? (
              <div className="text-muted-foreground">No tickets yet. <Link to="/portal/tickets" className="underline">Create one</Link>.</div>
            ) : (
              <div className="divide-y">
                {tickets.map((t) => (
                  <div key={t.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{t.summary}</div>
                      <div className="text-sm text-muted-foreground">Ref: [{t.tracking_ref}] • {new Date(t.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm px-2 py-1 rounded bg-muted">{t.status}</span>
                      <Link to={`/portal/tickets/${t.id}`}>
                        <Button variant="outline">Open</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default TicketsList;
