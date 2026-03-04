import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, Users, UserPlus, Mail, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(213,90%,18%)", "hsl(190,80%,42%)", "hsl(25,95%,55%)", "hsl(0,84%,60%)", "hsl(150,60%,40%)", "hsl(270,60%,50%)"];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ tickets: 0, open: 0, resolved: 0, clients: 0, leads: 0, emailsSent: 0 });
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [priorityData, setPriorityData] = useState<{ name: string; count: number }[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [ticketsRes, clientsRes, leadsRes, campaignsRes] = await Promise.all([
      supabase.from("tickets").select("id, status, priority, summary, tracking_ref, created_at, caller_company", { count: "exact" }),
      supabase.from("clients").select("id", { count: "exact" }),
      supabase.from("leads").select("id", { count: "exact" }),
      supabase.from("email_campaigns").select("sent_count"),
    ]);

    const tickets = ticketsRes.data || [];
    const totalEmails = (campaignsRes.data || []).reduce((sum, c) => sum + (c.sent_count || 0), 0);

    const openCount = tickets.filter(t => ["open", "new", "in_progress", "waiting_for_client"].includes(t.status)).length;
    const resolvedCount = tickets.filter(t => ["resolved", "closed"].includes(t.status)).length;

    setStats({
      tickets: ticketsRes.count || tickets.length,
      open: openCount,
      resolved: resolvedCount,
      clients: clientsRes.count || 0,
      leads: leadsRes.count || 0,
      emailsSent: totalEmails,
    });

    // Status breakdown
    const statusMap: Record<string, number> = {};
    tickets.forEach(t => { statusMap[t.status] = (statusMap[t.status] || 0) + 1; });
    setStatusData(Object.entries(statusMap).map(([name, value]) => ({ name, value })));

    // Priority breakdown
    const prioMap: Record<string, number> = {};
    tickets.forEach(t => { prioMap[t.priority] = (prioMap[t.priority] || 0) + 1; });
    setPriorityData(Object.entries(prioMap).map(([name, count]) => ({ name, count })));

    setRecentTickets(tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
  };

  const statCards = [
    { label: "Total Tickets", value: stats.tickets, icon: Ticket, color: "text-primary" },
    { label: "Open Tickets", value: stats.open, icon: AlertTriangle, color: "text-orange-500" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "text-green-600" },
    { label: "Active Clients", value: stats.clients, icon: Users, color: "text-accent" },
    { label: "Leads", value: stats.leads, icon: UserPlus, color: "text-purple-600" },
    { label: "Emails Sent", value: stats.emailsSent, icon: Mail, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className="text-2xl font-bold">{s.value}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Tickets by Status</CardTitle></CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm">No ticket data yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Tickets by Priority</CardTitle></CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(190,80%,42%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm">No ticket data yet</p>}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Tickets</CardTitle></CardHeader>
        <CardContent>
          {recentTickets.length > 0 ? (
            <div className="space-y-2">
              {recentTickets.map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.summary}</p>
                    <p className="text-xs text-muted-foreground">{t.tracking_ref} · {t.caller_company || "—"}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.status === "open" || t.status === "new" ? "bg-orange-100 text-orange-700" :
                    t.status === "resolved" || t.status === "closed" ? "bg-green-100 text-green-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{t.status}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground text-sm">No tickets logged yet</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
