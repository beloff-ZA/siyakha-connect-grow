import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/helpdesk/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pin, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const categories = ["general", "urgent", "follow-up", "idea", "meeting"];

const DirectorNotes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "general" });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["director-notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("director_notes")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from("director_notes").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("director_notes").insert({ ...form, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-notes"] });
      toast.success(editId ? "Note updated" : "Note added");
      setOpen(false);
      setEditId(null);
      setForm({ title: "", content: "", category: "general" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePin = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase.from("director_notes").update({ is_pinned: !pinned }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["director-notes"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("director_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-notes"] });
      toast.success("Note deleted");
    },
  });

  const openEdit = (note: any) => {
    setEditId(note.id);
    setForm({ title: note.title, content: note.content || "", category: note.category || "general" });
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditId(null); setForm({ title: "", content: "", category: "general" }); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Note</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editId ? "Edit Note" : "New Note"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Textarea placeholder="Content..." rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                <Button onClick={() => upsert.mutate()} disabled={!form.title.trim()}>{editId ? "Update" : "Save"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note: any) => (
              <Card key={note.id} className={note.is_pinned ? "border-accent" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{note.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePin.mutate({ id: note.id, pinned: note.is_pinned })}>
                        <Pin className={`h-3.5 w-3.5 ${note.is_pinned ? "text-accent fill-accent" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(note)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove.mutate(note.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs">{note.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted-foreground/50 mt-3">{new Date(note.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
            {notes.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No notes yet. Add your first note above.</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DirectorNotes;
