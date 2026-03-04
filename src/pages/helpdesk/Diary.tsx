import { useState, useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, Pencil, Trash2, Search, Calendar } from "lucide-react";
import { format } from "date-fns";

type DiaryEntry = {
  id: string;
  title: string;
  content: string | null;
  mood: string | null;
  tags: string[];
  entry_date: string;
  created_at: string;
};

const moodOptions = [
  { value: "productive", label: "🚀 Productive" },
  { value: "focused", label: "🎯 Focused" },
  { value: "creative", label: "💡 Creative" },
  { value: "stressed", label: "😤 Stressed" },
  { value: "calm", label: "😌 Calm" },
  { value: "energised", label: "⚡ Energised" },
];

const DiaryPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DiaryEntry | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [entryDate, setEntryDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .limit(100);
    if (!error && data) setEntries(data as DiaryEntry[]);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const resetForm = () => {
    setTitle(""); setContent(""); setMood(""); setTagsInput("");
    setEntryDate(format(new Date(), "yyyy-MM-dd"));
    setEditing(null);
  };

  const openNew = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (e: DiaryEntry) => {
    setEditing(e);
    setTitle(e.title);
    setContent(e.content || "");
    setMood(e.mood || "");
    setTagsInput((e.tags || []).join(", "));
    setEntryDate(e.entry_date);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      content: content.trim() || null,
      mood: mood || null,
      tags,
      entry_date: entryDate,
      user_id: user!.id,
    };

    if (editing) {
      const { error } = await supabase.from("diary_entries").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error updating", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Entry updated" });
    } else {
      const { error } = await supabase.from("diary_entries").insert(payload);
      if (error) { toast({ title: "Error saving", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Entry saved" });
    }
    setDialogOpen(false);
    resetForm();
    fetchEntries();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this diary entry?")) return;
    await supabase.from("diary_entries").delete().eq("id", id);
    toast({ title: "Entry deleted" });
    fetchEntries();
  };

  const filtered = entries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.content || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" /> Director's Diary
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Your personal journal — thoughts, decisions, and reflections.</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New Entry</Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            {entries.length === 0 ? "No diary entries yet. Start writing!" : "No entries match your search."}
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(entry => (
              <Card key={entry.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{entry.title}</CardTitle>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(entry.entry_date), "dd MMM yyyy")}
                        {entry.mood && <span className="ml-2">{moodOptions.find(m => m.value === entry.mood)?.label || entry.mood}</span>}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(entry)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(entry.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {entry.content && <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{entry.content}</p>}
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {entry.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={o => { if (!o) { resetForm(); } setDialogOpen(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Entry" : "New Diary Entry"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <Input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} />
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger><SelectValue placeholder="How are you feeling?" /></SelectTrigger>
              <SelectContent>
                {moodOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Write your thoughts…" rows={8} value={content} onChange={e => setContent(e.target.value)} />
            <Input placeholder="Tags (comma-separated)" value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Update" : "Save"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DiaryPage;
