import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Ticket, Users, UserPlus, Mail, AlertTriangle, CheckCircle,
  BookOpen, CalendarDays, Clock, TrendingUp, Briefcase
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isToday, isTomorrow, isThisWeek, addDays } from "date-fns";

const COLORS = ["hsl(213,90%,18%)", "hsl(190,80%,42%)", "hsl(25,95%,55%)", "hsl(0,84%,60%)", "hsl(150,60%,40%)", "hsl(270,60%,50%)"];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tickets: 0, open: 0, resolved: 0, clients: 0, leads: 0, emailsSent: 0 });
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const now = new Date().toISOString();
    const weekEnd = addDays(new Date(), 7).toISOString();

    const [ticketsRes, clientsRes, leadsRes, campaignsRes, diaryRes, eventsRes] = await Promise.all([
      supabase.from("tickets").select("id, status, priority, summary, tracking_ref, created_at, caller_company", { count: "exact" }),
      supabase.from("clients").select("id", { count: "exact" }),
      supabase.from("leads").select("id", { count: "exact" }),
      supabase.from("email_campaigns").select("sent_count"),
      supabase.from("diary_entries").select("*").order("entry_date", { ascending: false }).limit(3),
      supabase.from("calendar_events").select("*").gte("start_time", now).lte("start_time", weekEnd).order("start_time").limit(6),
    ]);

    const tickets = ticketsRes.data || [];
    const totalEmails = (campaignsRes.data || []).reduce((sum: number, c: any) => sum + (c.sent_count || 0), 0);
    const openCount = tickets.filter(t => ["open", "new", "in_progress", "waiting_for_client"].includes(t.status)).length;
    const resolvedCount = tickets.filter(t => ["resolved", "closed"].includes(t.status)).length;

    setStats({ tickets: ticketsRes.count || tickets.length, open: openCount, resolved: resolvedCount, clients: clientsRes.count || 0, leads: leadsRes.count || 0, emailsSent: totalEmails });

    const statusMap: Record<string, number> = {};
    tickets.forEach(t => { statusMap[t.status] = (statusMap[t.status] || 0) + 1; });
    setStatusData(Object.entries(statusMap).map(([name, value]) => ({ name, value })));

    setRecentTickets(tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
    setDiaryEntries(diaryRes.data || []);
    setUpcomingEvents(eventsRes.data || []);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatEventTime = (ev: any) => {
    const d = parseISO(ev.start_time);
    if (isToday(d)) return `Today, ${format(d, "HH:mm")}`;
    if (isTomorrow(d)) return `Tomorrow, ${format(d, "HH:mm")}`;
    return format(d, "EEE dd MMM, HH:mm");
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <Briefcase className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting()}, Director</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, dd MMMM yyyy")} — Here's your overview.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Tickets", value: stats.tickets, icon: Ticket, color: "text-primary", link: "/helpdesk/tickets" },
          { label: "Open Tickets", value: stats.open, icon: AlertTriangle, color: "text-orange-500", link: "/helpdesk/tickets" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "text-green-600", link: "/helpdesk/tickets" },
          { label: "Clients", value: stats.clients, icon: Users, color: "text-accent", link: "/helpdesk/clients" },
          { label: "Leads", value: stats.leads, icon: UserPlus, color: "text-purple-600", link: "/helpdesk/leads" },
          { label: "Campaigns Sent", value: stats.emailsSent, icon: Mail, color: "text-primary", link: "/helpdesk/campaigns" },
        ].map(s => (
          <Link key={s.label} to={s.link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <span className="text-2xl font-bold">{s.value}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main grid: Upcoming + Diary + Tickets */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />This Week</CardTitle>
              <Link to="/helpdesk/calendar"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No events this week</p>
            ) : upcomingEvents.map(ev => (
              <div key={ev.id} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: ev.color || "#3b82f6" }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{ev.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatEventTime(ev)}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">{ev.category}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Diary */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />Latest Diary</CardTitle>
              <Link to="/helpdesk/diary"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {diaryEntries.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">No diary entries yet</p>
                <Link to="/helpdesk/diary"><Button size="sm" variant="outline">Write First Entry</Button></Link>
              </div>
            ) : diaryEntries.map(e => (
              <div key={e.id} className="py-1.5 border-b last:border-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{e.title}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{format(new Date(e.entry_date), "dd MMM")}</span>
                </div>
                {e.content && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{e.content}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ticket Status Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Ticket Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm py-8 text-center">No ticket data yet</p>}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Ticket className="h-4 w-4 text-primary" />Recent Support Tickets</CardTitle>
            <Link to="/helpdesk/tickets"><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTickets.length > 0 ? (
            <div className="space-y-1">
              {recentTickets.map(t => (
                <Link key={t.id} to={`/helpdesk/tickets/${t.id}`} className="block">
                  <div className="flex items-center justify-between py-2 px-2 border-b last:border-0 hover:bg-muted/50 rounded transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.summary}</p>
                      <p className="text-xs text-muted-foreground">{t.tracking_ref} · {t.caller_company || "—"} · {new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                      t.status === "open" || t.status === "new" ? "bg-orange-100 text-orange-700" :
                      t.status === "resolved" || t.status === "closed" ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{t.status.replace(/_/g, " ")}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm mb-3">No tickets logged yet</p>
              <Link to="/helpdesk/tickets"><Button size="sm">Create First Ticket</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
