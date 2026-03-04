import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/helpdesk/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, ChevronLeft, ChevronRight, Clock, MapPin, Trash2, Pencil,
  CalendarDays, List
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay,
  addMonths, subMonths, startOfWeek, endOfWeek, parseISO, isToday
} from "date-fns";
import { cn } from "@/lib/utils";

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  location: string | null;
  category: string;
  color: string;
  created_at: string;
};

const categories = [
  { value: "general", label: "General", color: "#3b82f6" },
  { value: "meeting", label: "Meeting", color: "#8b5cf6" },
  { value: "project", label: "Project", color: "#10b981" },
  { value: "marketing", label: "Marketing", color: "#f59e0b" },
  { value: "personal", label: "Personal", color: "#ec4899" },
  { value: "deadline", label: "Deadline", color: "#ef4444" },
];

const DirectorCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("general");

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("start_time", { ascending: true })
      .limit(500);
    if (!error && data) setEvents(data as CalendarEvent[]);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const resetForm = () => {
    setTitle(""); setDescription(""); setStartTime(""); setEndTime("");
    setAllDay(false); setLocation(""); setCategory("general"); setEditing(null);
  };

  const openNew = (date?: Date) => {
    resetForm();
    if (date) {
      const d = format(date, "yyyy-MM-dd");
      setStartTime(`${d}T09:00`);
      setEndTime(`${d}T10:00`);
    }
    setDialogOpen(true);
  };

  const openEdit = (e: CalendarEvent) => {
    setEditing(e);
    setTitle(e.title);
    setDescription(e.description || "");
    setStartTime(format(parseISO(e.start_time), "yyyy-MM-dd'T'HH:mm"));
    setEndTime(e.end_time ? format(parseISO(e.end_time), "yyyy-MM-dd'T'HH:mm") : "");
    setAllDay(e.all_day);
    setLocation(e.location || "");
    setCategory(e.category);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!title.trim() || !startTime) {
      toast({ title: "Title and start time required", variant: "destructive" });
      return;
    }
    const cat = categories.find(c => c.value === category);
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      start_time: new Date(startTime).toISOString(),
      end_time: endTime ? new Date(endTime).toISOString() : null,
      all_day: allDay,
      location: location.trim() || null,
      category,
      color: cat?.color || "#3b82f6",
      user_id: user!.id,
    };

    if (editing) {
      const { error } = await supabase.from("calendar_events").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Event updated" });
    } else {
      const { error } = await supabase.from("calendar_events").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Event created" });
    }
    setDialogOpen(false);
    resetForm();
    fetchEvents();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("calendar_events").delete().eq("id", id);
    toast({ title: "Event deleted" });
    fetchEvents();
  };

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(ev => {
      const key = format(parseISO(ev.start_time), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  const selectedDayEvents = selectedDate
    ? eventsByDate[format(selectedDate, "yyyy-MM-dd")] || []
    : [];

  // Upcoming events for list view
  const upcoming = events.filter(e => new Date(e.start_time) >= new Date()).slice(0, 30);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" /> Director's Calendar
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your schedule, projects, and deadlines.</p>
          </div>
          <div className="flex gap-2">
            <Button variant={view === "calendar" ? "default" : "outline"} size="sm" onClick={() => setView("calendar")}>
              <CalendarDays className="h-4 w-4 mr-1" />Month
            </Button>
            <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>
              <List className="h-4 w-4 mr-1" />List
            </Button>
            <Button onClick={() => openNew()}><Plus className="h-4 w-4 mr-2" />New Event</Button>
          </div>
        </div>

        {view === "calendar" ? (
          <div className="space-y-4">
            {/* Month nav */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="h-5 w-5" /></Button>
              <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="h-5 w-5" /></Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
              {days.map(day => {
                const key = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDate[key] || [];
                const selected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(day)}
                    onDoubleClick={() => openNew(day)}
                    className={cn(
                      "bg-background p-1.5 min-h-[80px] text-left transition-colors hover:bg-accent/50 relative",
                      !isSameMonth(day, currentMonth) && "opacity-40",
                      selected && "ring-2 ring-primary ring-inset",
                      isToday(day) && "bg-primary/5"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium",
                      isToday(day) && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                    )}>
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className="text-[10px] truncate rounded px-1 py-0.5 text-white" style={{ backgroundColor: ev.color }}>
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected day detail */}
            {selectedDate && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{format(selectedDate, "EEEE, dd MMMM yyyy")}</h3>
                    <Button size="sm" variant="outline" onClick={() => openNew(selectedDate)}>
                      <Plus className="h-3.5 w-3.5 mr-1" />Add
                    </Button>
                  </div>
                  {selectedDayEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events. Double-click a day to add one.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayEvents.map(ev => (
                        <div key={ev.id} className="flex items-start gap-3 p-2 rounded-md border group">
                          <div className="w-1 h-full rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{ev.title}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              {!ev.all_day && (
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(parseISO(ev.start_time), "HH:mm")}{ev.end_time && ` – ${format(parseISO(ev.end_time), "HH:mm")}`}</span>
                              )}
                              {ev.all_day && <Badge variant="secondary" className="text-[10px]">All day</Badge>}
                              {ev.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(ev)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(ev.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* List view */
          <div className="space-y-3">
            {loading ? <p className="text-muted-foreground">Loading…</p> : upcoming.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No upcoming events.</CardContent></Card>
            ) : upcoming.map(ev => (
              <Card key={ev.id} className="group hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-1.5 rounded-full self-stretch shrink-0" style={{ backgroundColor: ev.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{ev.title}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(parseISO(ev.start_time), "EEE, dd MMM yyyy")}
                      </span>
                      {!ev.all_day && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(parseISO(ev.start_time), "HH:mm")}{ev.end_time && ` – ${format(parseISO(ev.end_time), "HH:mm")}`}</span>
                      )}
                      {ev.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>}
                      <Badge variant="secondary" className="text-[10px]">{ev.category}</Badge>
                    </div>
                    {ev.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ev.description}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(ev)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(ev.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Event dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => { if (!o) resetForm(); setDialogOpen(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Event title" value={title} onChange={e => setTitle(e.target.value)} />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Checkbox checked={allDay} onCheckedChange={c => setAllDay(!!c)} id="allDay" />
              <label htmlFor="allDay" className="text-sm">All day</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start</label>
                <Input type={allDay ? "date" : "datetime-local"} value={allDay ? startTime.split("T")[0] : startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">End</label>
                <Input type={allDay ? "date" : "datetime-local"} value={allDay ? endTime.split("T")[0] : endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>
            <Input placeholder="Location (optional)" value={location} onChange={e => setLocation(e.target.value)} />
            <Textarea placeholder="Description (optional)" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default DirectorCalendar;
