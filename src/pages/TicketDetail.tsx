import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getTicketMessages } from "@/lib/tickets";
import { supabase } from "@/integrations/supabase/client";
import SendViaWhatsAppButton from "@/components/SendViaWhatsAppButton";

const TicketDetail: React.FC = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title = "Ticket Detail | Siyakha Technology";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", "View ticket details and timeline.");
    if (!meta.parentNode) document.head.appendChild(meta);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", window.location.href);
    if (!canonical.parentNode) document.head.appendChild(canonical);
  }, []);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data: t, error } = await supabase
        .from("tickets")
        .select("id, summary, status, created_at, tracking_ref")
        .eq("id", id)
        .maybeSingle();
      if (!error) setTicket(t);
      const msgs = await getTicketMessages(id);
      setMessages(msgs);
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">Ticket</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{ticket?.summary || "Ticket"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading…</div>
            ) : !ticket ? (
              <div className="text-muted-foreground">Not found or access denied.</div>
            ) : (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Ref: [{ticket.tracking_ref}]</div>
                <div>Status: {ticket.status}</div>
                <div>Created: {new Date(ticket.created_at).toLocaleString()}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Send Update via WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Client WhatsApp (E.164)</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2772…" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="message">Message</Label>
                <Input id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Short update…" />
              </div>
            </div>
            <div className="mt-4">
              <SendViaWhatsAppButton
                phoneE164={phone}
                message={`${message}\n\nRef: [${ticket?.tracking_ref || ''}]`}
                ticketId={ticket?.id || ''}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-muted-foreground">No messages yet.</div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className="p-3 rounded-md border border-border">
                    <div className="text-xs text-muted-foreground mb-1">
                      {m.direction} • {m.channel} • {new Date(m.created_at).toLocaleString()} • {m.status}
                    </div>
                    <div className="whitespace-pre-wrap text-sm">{m.body}</div>
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

export default TicketDetail;
