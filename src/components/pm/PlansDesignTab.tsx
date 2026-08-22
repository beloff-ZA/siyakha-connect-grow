import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FloorPlansManager from "@/components/helpdesk/FloorPlansManager";
import { Panel, Field, selectCls } from "./ui";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";

/**
 * Plan upload and concept design entry point. Client → site → project selection
 * reuses the workspace data, and the plan workspace itself is the existing
 * FloorPlansManager so there is a single place where plans and devices live.
 */
const PlansDesignTab: React.FC<{
  ws: PmWorkspace;
  projectId: string;
  setProjectId: (id: string) => void;
  /** Hides the project picker when the project comes from the URL. */
  locked?: boolean;
}> = ({ ws, projectId, setProjectId, locked }) => {
  const { projects, clients, sites } = ws;
  const { toast } = useToast();
  const [draftBoqs, setDraftBoqs] = useState<{ id: string; revision_label: string; title: string | null }[]>([]);
  const [designBoqId, setDesignBoqId] = useState("");

  const loadDesignLink = useCallback(async () => {
    if (!projectId) {
      setDraftBoqs([]);
      setDesignBoqId("");
      return;
    }
    const [{ data: boqs }, { data: project }] = await Promise.all([
      supabase
        .from("portal_boqs")
        .select("id,revision_label,title")
        .eq("project_id", projectId)
        .eq("status", "draft")
        .order("created_at"),
      supabase.from("portal_projects").select("design_boq_id").eq("id", projectId).maybeSingle(),
    ]);
    setDraftBoqs((boqs ?? []) as { id: string; revision_label: string; title: string | null }[]);
    setDesignBoqId((project as { design_boq_id?: string | null } | null)?.design_boq_id ?? "");
  }, [projectId]);

  useEffect(() => {
    loadDesignLink();
  }, [loadDesignLink]);

  const linkDesignBoq = async (value: string) => {
    const { error } = await supabase
      .from("portal_projects")
      .update({ design_boq_id: value || null })
      .eq("id", projectId);
    if (error) {
      toast({ title: "Could not link the design bill", description: error.message, variant: "destructive" });
      return;
    }
    setDesignBoqId(value);
    toast({
      title: value ? "Design bill linked" : "Design bill unlinked",
      description: value
        ? "Devices you place, archive or delete now update this draft bill automatically."
        : "Plan changes will no longer adjust any bill quantities.",
    });
  };

  const options = useMemo(
    () =>
      projects.map((p) => {
        const client = clients.find((c) => c.id === p.client_id)?.display_name ?? "Unassigned";
        const site = sites.find((s) => s.id === p.site_id)?.name;
        return { id: p.id, label: [client, site, p.title].filter(Boolean).join(" — ") };
      }),
    [projects, clients, sites],
  );

  return (
    <div>
      <Panel title="Plans & concept design">
        {!locked && (
          <Field label="Client → site → project">
            <select className={selectCls} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select a project…</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        )}
        {projectId && (
          <Field label="Design bill of quantities (draft revisions only)">
            <select className={selectCls} value={designBoqId} onChange={(e) => linkDesignBoq(e.target.value)}>
              <option value="">Not linked — plan changes do not affect any bill</option>
              {draftBoqs.map((b) => (
                <option key={b.id} value={b.id}>
                  {[b.revision_label, b.title].filter(Boolean).join(" — ")}
                </option>
              ))}
            </select>
          </Field>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Add the levels or areas, upload the plan as a PDF or image and design across every discipline. Original files and
          earlier revisions are always retained, coordinates are stored normalised to the plan image, and each product you
          place feeds the linked bill of quantities automatically.
        </p>
      </Panel>

      {projectId ? (
        <FloorPlansManager projectId={projectId} />
      ) : (
        <p className="text-sm text-muted-foreground">Select a project to open its plan workspace.</p>
      )}
    </div>
  );
};

export default PlansDesignTab;
