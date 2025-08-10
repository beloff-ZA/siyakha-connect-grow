import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createTicket } from "@/lib/tickets";
import { sendViaWhatsApp, markWhatsAppSent } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";

const PortalTickets: React.FC = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    document.title = "Portal Tickets | Siyakha Technology";
    const ensureMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    ensureMeta("description", "Log a ticket and send WhatsApp updates easily.");

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", window.location.href);
    if (!canonical.parentNode) document.head.appendChild(canonical);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to create a ticket.", variant: "destructive" as any });
        return;
      }
      if (!summary || !phone || !message) {
        toast({ title: "Missing info", description: "Summary, phone and message are required." });
        return;
      }
      const created = await createTicket(user.id, { summary, details });
      if (!created?.id) throw new Error("Could not create ticket");

      const msg = `${message}\n\nRef: [${created.tracking_ref}]`;
      const { messageId, opened } = await sendViaWhatsApp({ phoneE164: phone, message: msg, ticketId: created.id, trackingRef: created.tracking_ref });
      if (!opened) {
        await navigator.clipboard?.writeText(msg);
        toast({ title: "Popup blocked", description: "We copied the message. Paste it into WhatsApp." });
      }
      toast({
        title: "WhatsApp opened",
        description: "After sending, mark as sent.",
        action: (
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await markWhatsAppSent({ messageId, ticketId: created.id });
                toast({ title: "Marked as sent", description: "Logged to the timeline." });
              } catch (err: any) {
                toast({ title: "Error", description: err?.message || "Try again" });
              }
            }}
          >
            Mark as sent
          </Button>
        ),
      });
    } catch (err: any) {
      toast({ title: "Failed", description: err?.message || "Please try again", variant: "destructive" as any });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">Log a Ticket and Send via WhatsApp</h1>
        <Card>
          <CardHeader>
            <CardTitle>Log a Ticket & Send via WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Input id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Details</Label>
                <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} rows={5} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Client WhatsApp (E.164)</Label>
                  <Input id="phone" placeholder="e.g. +27721234567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">WhatsApp Message</Label>
                  <Input id="message" placeholder="Short update…" value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={creating}>Create & Open WhatsApp</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PortalTickets;
