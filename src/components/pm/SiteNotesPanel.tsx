import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Field, Panel } from "./ui";
import SiteImagesManager from "@/components/helpdesk/SiteImagesManager";

const db = supabase as unknown as { from: (t: string) => any };

/**
 * Scope, deliverables and site notes live on the existing project record. Named
 * site images reuse the existing secure site-image module, so there is only one
 * image system in the app.
 */
const SiteNotesPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [form, setForm] = useState({ scope_of_work: "", deliverables: "", site_context: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await db
        .from("portal_projects")
        .select("scope_of_work, deliverables, site_context")
        .eq("id", projectId)
        .maybeSingle();
      if (alive && data)
        setForm({
          scope_of_work: data.scope_of_work ?? "",
          deliverables: data.deliverables ?? "",
          site_context: data.site_context ?? "",
        });
    })();
    return () => {
      alive = false;
    };
  }, [projectId]);

  const save = async () => {
    setBusy(true);
    try {
      const { error } = await db
        .from("portal_projects")
        .update({
          scope_of_work: form.scope_of_work.trim() || null,
          deliverables: form.deliverables.trim() || null,
          site_context: form.site_context.trim() || null,
        })
        .eq("id", projectId);
      if (error) throw error;
      toast({ title: "Project record saved" });
    } catch (e) {
      toast({
        title: "Could not save",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive" as never,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title="Scope, deliverables & site notes"
      actions={
        <Button size="sm" onClick={save} disabled={busy}>
          Save
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Field label="Scope of work">
          <Textarea rows={5} value={form.scope_of_work} onChange={(e) => setForm({ ...form, scope_of_work: e.target.value })} />
        </Field>
        <Field label="Deliverables">
          <Textarea rows={5} value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} />
        </Field>
        <Field label="Site notes / current condition">
          <Textarea rows={5} value={form.site_context} onChange={(e) => setForm({ ...form, site_context: e.target.value })} />
        </Field>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
          Site images — every image needs a name so viewers know what they are looking at
        </p>
        <SiteImagesManager projectId={projectId} />
      </div>
    </Panel>
  );
};

export default SiteNotesPanel;
