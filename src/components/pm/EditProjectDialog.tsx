import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Field, selectCls } from "./ui";
import type { PmProject } from "@/hooks/usePmWorkspace";

/**
 * Edits the SAME project record in place — the project id never changes, so
 * every drawing, BOQ, update and share link stays attached to it. Only the
 * descriptive project fields are editable here; floors, plans and delivery data
 * keep their own existing screens.
 */
const EditProjectDialog: React.FC<{
  project: PmProject;
  open: boolean;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}> = ({ project, open, onClose, onSaved }) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: project.title ?? "",
    reference: project.reference ?? "",
    address: project.address ?? "",
    consultant: project.consultant ?? "",
    status: project.status ?? "planning",
    start_date: project.start_date ?? "",
    target_date: project.target_date ?? "",
    description: project.description ?? "",
    scope_of_work: (project as { scope_of_work?: string | null }).scope_of_work ?? "",
    deliverables: (project as { deliverables?: string | null }).deliverables ?? "",
    site_context: (project as { site_context?: string | null }).site_context ?? "",
  });

  const patch = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "The project needs a title" });
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase
        .from("portal_projects")
        .update({
          title: form.title.trim(),
          reference: form.reference.trim() || null,
          address: form.address.trim() || null,
          consultant: form.consultant.trim() || null,
          status: form.status,
          start_date: form.start_date || null,
          target_date: form.target_date || null,
          description: form.description.trim() || null,
          scope_of_work: form.scope_of_work.trim() || null,
          deliverables: form.deliverables.trim() || null,
          site_context: form.site_context.trim() || null,
        } as never)
        .eq("id", project.id);
      if (error) throw error;
      await onSaved();
      toast({ title: "Project updated" });
      onClose();
    } catch (e) {
      toast({
        title: "Could not save the project",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project title" className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => patch("title", e.target.value)} />
          </Field>
          <Field label="Reference">
            <Input value={form.reference} onChange={(e) => patch("reference", e.target.value)} />
          </Field>
          <Field label="Status">
            <select className={selectCls} value={form.status} onChange={(e) => patch("status", e.target.value)}>
              {["planning", "design", "implementation", "in_progress", "on_hold", "complete"].map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input value={form.address} onChange={(e) => patch("address", e.target.value)} />
          </Field>
          <Field label="Consultant">
            <Input value={form.consultant} onChange={(e) => patch("consultant", e.target.value)} />
          </Field>
          <Field label="Start date">
            <Input type="date" value={form.start_date} onChange={(e) => patch("start_date", e.target.value)} />
          </Field>
          <Field label="Target date">
            <Input type="date" value={form.target_date} onChange={(e) => patch("target_date", e.target.value)} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea rows={3} value={form.description} onChange={(e) => patch("description", e.target.value)} />
          </Field>
          <Field label="Scope of work" className="sm:col-span-2">
            <Textarea rows={3} value={form.scope_of_work} onChange={(e) => patch("scope_of_work", e.target.value)} />
          </Field>
          <Field label="Deliverables" className="sm:col-span-2">
            <Textarea rows={3} value={form.deliverables} onChange={(e) => patch("deliverables", e.target.value)} />
          </Field>
          <Field label="Site notes / current condition" className="sm:col-span-2">
            <Textarea rows={3} value={form.site_context} onChange={(e) => patch("site_context", e.target.value)} />
          </Field>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
