import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, CalendarDays, Clock, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns";

const Dashboard: React.FC = () => {
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [diaryCount, setDiaryCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const now = new Date().toISOString();
    const weekEnd = addDays(new Date(), 7).toISOString();

    const [diaryRes, eventsRes, diaryCountRes, eventCountRes] = await Promise.all([
      supabase.from("diary_entries").select("*").order("entry_date", { ascending: false }).limit(5),
      supabase.from("calendar_events").select("*").gte("start_time", now).lte("start_time", weekEnd).order("start_time").limit(8),
      supabase.from("diary_entries").select("id", { count: "exact" }),
      supabase.from("calendar_events").select("id", { count: "exact" }).gte("start_time", now),
    ]);

    setDiaryEntries(diaryRes.data || []);
    setUpcomingEvents(eventsRes.data || []);
    setDiaryCount(diaryCountRes.count || 0);
    setEventCount(eventCountRes.count || 0);
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
      <div className="flex items-center gap-3">
        <Briefcase className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting()}, Director</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, dd MMMM yyyy")}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Link to="/helpdesk/diary">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <span className="text-2xl font-bold">{diaryCount}</span>
                <p className="text-xs text-muted-foreground">Diary Entries</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/helpdesk/calendar">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <span className="text-2xl font-bold">{eventCount}</span>
                <p className="text-xs text-muted-foreground">Upcoming Events</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
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
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-2">No events this week</p>
                <Link to="/helpdesk/calendar"><Button size="sm" variant="outline">Add Event</Button></Link>
              </div>
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
              <CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />Latest Diary Entries</CardTitle>
              <Link to="/helpdesk/diary"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {diaryEntries.length === 0 ? (
              <div className="text-center py-6">
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
      </div>
    </div>
  );
};

export default Dashboard;
