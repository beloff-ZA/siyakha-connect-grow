import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

const Clients: React.FC = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", contact_person: "", email: "", phone: "", address: "", client_type: "business", notes: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").order("name");
    setClients(data || []);
    setLoading(false);
  };

  const save = async () => {
    if (!form.name) return;
    const payload = { ...form, notes: form.notes || null, contact_person: form.contact_person || null, email: form.email || null, phone: form.phone || null, address: form.address || null };
    let error;
    if (editing) {
      ({ error } = await supabase.from("clients").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("clients").insert(payload));
    }
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" as any });
    else { toast({ title: editing ? "Client updated" : "Client added" }); reset(); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this client?")) return;
    await supabase.from("clients").delete().eq("id", id);
    load();
  };

  const reset = () => { setShowForm(false); setEditing(null); setForm({ name: "", contact_person: "", email: "", phone: "", address: "", client_type: "business", notes: "" }); };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.name, contact_person: c.contact_person || "", email: c.email || "", phone: c.phone || "", address: c.address || "", client_type: c.client_type || "business", notes: c.notes || "" });
    setShowForm(true);
  };

  const filtered = clients.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.contact_person?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={showForm} onOpenChange={v => { if (!v) reset(); else setShowForm(true); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Add Client</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit Client" : "Add Client"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Company / School Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Contact Person</Label><Input value={form.contact_person} onChange={e => setForm(f => ({...f, contact_person: e.target.value}))} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.client_type} onValueChange={v => setForm(f => ({...f, client_type: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} /></div>
              <Button onClick={save} disabled={!form.name} className="w-full">{editing ? "Update" : "Add"} Client</Button>
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
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No clients yet</TableCell></TableRow>
                ) : filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.contact_person || "—"}</TableCell>
                    <TableCell className="text-xs">{c.email || "—"}</TableCell>
                    <TableCell className="text-xs">{c.phone || "—"}</TableCell>
                    <TableCell className="text-xs capitalize">{c.client_type || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Edit2 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default Clients;
