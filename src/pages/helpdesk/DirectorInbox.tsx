import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Inbox, Send, Bell, CheckCheck, Trash2, Mail,
  AlertCircle, Info, ShieldCheck, CalendarDays, FolderKanban, Users
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Notification = {
  id: string; title: string; body: string | null; type: string;
  source: string | null; source_id: string | null; is_read: boolean;
  created_at: string;
};

type SentEmail = {
  id: string; to_email: string; to_name: string | null;
  subject: string; body: string; status: string; created_at: string;
};

const typeIcons: Record<string, React.ElementType> = {
  lead: Users,
  ticket: AlertCircle,
  calendar: CalendarDays,
  project: FolderKanban,
  security: ShieldCheck,
  info: Info,
};

const DirectorInbox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [tab, setTab] = useState("notifications");

  // Compose form
  const [toEmail, setToEmail] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [notifRes, sentRes] = await Promise.all([
      supabase.from("director_notifications").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("director_sent_emails").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setNotifications((notifRes.data || []) as Notification[]);
    setSentEmails((sentRes.data || []) as SentEmail[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const markRead = async (id: string) => {
    await supabase.from("director_notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unread.length === 0) return;
    await supabase.from("director_notifications").update({ is_read: true }).in("id", unread);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast({ title: "All marked as read" });
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("director_notifications").delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const sendEmail = async () => {
    if (!toEmail.trim() || !subject.trim() || !body.trim()) {
      toast({ title: "Fill in all required fields", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: [toEmail.trim()],
          subject: subject.trim(),
          text: body.trim(),
        },
      });

      if (error) throw error;

      // Log to sent emails
      await supabase.from("director_sent_emails").insert({
        user_id: user!.id,
        to_email: toEmail.trim(),
        to_name: toName.trim() || null,
        subject: subject.trim(),
        body: body.trim(),
        status: "sent",
      });

      toast({ title: "Email sent successfully" });
      setComposeOpen(false);
      setToEmail(""); setToName(""); setSubject(""); setBody("");
      fetchAll();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6" /> Inbox
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} · {sentEmails.length} sent
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-1" />Mark all read
            </Button>
          )}
          <Button onClick={() => setComposeOpen(true)}>
            <Send className="h-4 w-4 mr-2" />Compose
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-foreground text-background text-[10px] h-5 min-w-[20px] px-1">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-1.5">
            <Send className="h-4 w-4" />Sent
          </TabsTrigger>
        </TabsList>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4 space-y-2">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No notifications yet.</p>
                <p className="text-xs text-muted-foreground mt-1">System alerts, lead reviews, and calendar reminders will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map(n => {
              const Icon = typeIcons[n.type] || Info;
              return (
                <Card
                  key={n.id}
                  className={cn(
                    "group hover:shadow-sm transition-shadow cursor-pointer",
                    !n.is_read && "border-l-2 border-l-foreground"
                  )}
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", !n.is_read ? "bg-foreground/10" : "bg-muted")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm", !n.is_read ? "font-semibold" : "font-medium text-muted-foreground")}>{n.title}</p>
                        {n.source && <Badge variant="secondary" className="text-[10px]">{n.source}</Badge>}
                      </div>
                      {n.body && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(n.created_at), "dd MMM yyyy, HH:mm")}</p>
                    </div>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Sent */}
        <TabsContent value="sent" className="mt-4 space-y-2">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : sentEmails.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Send className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No emails sent yet.</p>
              </CardContent>
            </Card>
          ) : (
            sentEmails.map(e => (
              <Card key={e.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">To: {e.to_name ? `${e.to_name} <${e.to_email}>` : e.to_email}</p>
                      <Badge variant="outline" className="text-[10px]">{e.status}</Badge>
                    </div>
                    <p className="text-sm font-medium mt-0.5">{e.subject}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{e.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(e.created_at), "dd MMM yyyy, HH:mm")}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Compose dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Compose Email</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">To (email) *</label>
                <Input type="email" placeholder="recipient@example.com" value={toEmail} onChange={e => setToEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Name (optional)</label>
                <Input placeholder="Recipient name" value={toName} onChange={e => setToName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Subject *</label>
              <Input placeholder="Email subject" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Message *</label>
              <Textarea placeholder="Write your message..." rows={8} value={body} onChange={e => setBody(e.target.value)} />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Sent from: Siyakha Technology &lt;notifications@mail.siyakhatechnology.co.za&gt;
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
              <Button onClick={sendEmail} disabled={sending || !toEmail.trim() || !subject.trim() || !body.trim()}>
                {sending ? "Sending…" : "Send Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectorInbox;
