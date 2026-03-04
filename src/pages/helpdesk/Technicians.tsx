import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2 } from "lucide-react";

const Technicians: React.FC = () => {
  const { toast } = useToast();
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "technician" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("technicians").select("*").order("name");
    setTechs(data || []);
    setLoading(false);
  };

  const save = async () => {
    if (!form.name) return;
    const payload = { name: form.name, email: form.email || null, phone: form.phone || null, role: form.role };
    let error;
    if (editing) {
      ({ error } = await supabase.from("technicians").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("technicians").insert(payload));
    }
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" as any });
    else { toast({ title: editing ? "Updated" : "Technician added" }); reset(); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this technician?")) return;
    await supabase.from("technicians").delete().eq("id", id);
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("technicians").update({ is_active: !active }).eq("id", id);
    load();
  };

  const reset = () => { setShowForm(false); setEditing(null); setForm({ name: "", email: "", phone: "", role: "technician" }); };

  const openEdit = (t: any) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email || "", phone: t.phone || "", role: t.role || "technician" });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showForm} onOpenChange={v => { if (!v) reset(); else setShowForm(true); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Add Technician</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Technician</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
              <div><Label>Role</Label><Input value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} /></div>
              <Button onClick={save} disabled={!form.name} className="w-full">{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? <p className="p-6 text-muted-foreground">Loading…</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {techs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No technicians yet</TableCell></TableRow>
                ) : techs.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-xs">{t.email || "—"}</TableCell>
                    <TableCell className="text-xs">{t.phone || "—"}</TableCell>
                    <TableCell className="text-xs capitalize">{t.role || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={t.is_active ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggle(t.id, t.is_active)}>
                        {t.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Edit2 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Technicians;
