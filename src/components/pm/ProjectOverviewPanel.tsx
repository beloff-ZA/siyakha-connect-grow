import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Panel, Stat } from "./ui";
import type { PmProject, PmWorkspace } from "@/hooks/usePmWorkspace";

type Counts = Record<string, number>;

// Untyped handle: the generated Database types make these head-count queries too
// deep for the compiler, and no row data is read here.
const db = supabase as unknown as { from: (t: string) => any };

/**
 * Live project summary. Every number is derived from the existing tables on each
 * load — no counters are stored or duplicated.
 */
const ProjectOverviewPanel: React.FC<{ ws: PmWorkspace; project: PmProject }> = ({ ws, project }) => {
  const [counts, setCounts] = useState<Counts | null>(null);
  const client = ws.clients.find((c) => c.id === project.client_id) ?? null;
  const site = ws.sites.find((s) => s.id === project.site_id) ?? null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [floors, revisions, markers, routes, racks, boqItems, docs, images] = await Promise.all([
        db.from("portal_floors").select("id", { count: "exact", head: true }).eq("project_id", project.id),
        db
          .from("portal_plan_revisions")
          .select("id", { count: "exact", head: true })
          .eq("project_id", project.id)
          .is("archived_at", null),
        db.from("portal_floor_markers").select("marker_type").eq("project_id", project.id).is("archived_at", null),
        db.from("portal_cable_routes").select("id", { count: "exact", head: true }).eq("project_id", project.id),
        db.from("portal_rack_equipment").select("id", { count: "exact", head: true }).eq("project_id", project.id),
        db.from("portal_boq_items").select("id", { count: "exact", head: true }).eq("project_id", project.id),
        db.from("portal_documents").select("id", { count: "exact", head: true }).eq("project_id", project.id),
        db.from("portal_site_images").select("id", { count: "exact", head: true }).eq("project_id", project.id),
      ]);
      if (cancelled) return;
      const types = ((markers.data ?? []) as { marker_type: string }[]).map((m) => m.marker_type);
      const of = (...kinds: string[]) => types.filter((t) => kinds.includes(t)).length;
      setCounts({
        floors: floors.count ?? 0,
        revisions: revisions.count ?? 0,
        aps: of("wifi_ap"),
        cameras: of("camera"),
        racks: of("rack"),
        switches: of("switch", "fibre_agg_switch", "nvr", "router_firewall"),
        otherDevices: types.length - of("wifi_ap", "camera", "rack", "switch", "fibre_agg_switch", "nvr", "router_firewall"),
        routes: routes.count ?? 0,
        rackEquipment: racks.count ?? 0,
        boq: boqItems.count ?? 0,
        docs: docs.count ?? 0,
        images: images.count ?? 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [project.id]);

  const facts: [string, string][] = [
    ["Client", client?.display_name ?? "Unassigned"],
    ["Site", site?.name ?? "—"],
    ["Address", project.address ?? site?.address ?? "—"],
    ["Reference", project.reference ?? "—"],
    ["Status / stage", project.status ?? "—"],
    ["Consultant", project.consultant ?? "—"],
    ["Start date", project.start_date ?? "—"],
    ["Target date", project.target_date ?? "—"],
  ];

  return (
    <div>
      <Panel title="Project details">
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{k}</dt>
              <dd className="mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
        {project.description && <p className="mt-4 text-sm text-muted-foreground">{project.description}</p>}
      </Panel>

      <Panel title="Live project summary">
        {!counts ? (
          <p className="text-sm text-muted-foreground">Counting records…</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Stat label="Floors" value={counts.floors} />
            <Stat label="Plan revisions" value={counts.revisions} />
            <Stat label="Wi-Fi APs" value={counts.aps} />
            <Stat label="CCTV cameras" value={counts.cameras} />
            <Stat label="Racks" value={counts.racks} />
            <Stat label="Switches / NVR / firewall" value={counts.switches} />
            <Stat label="Other devices" value={counts.otherDevices} />
            <Stat label="Cable routes" value={counts.routes} />
            <Stat label="Rack equipment" value={counts.rackEquipment} />
            <Stat label="BOQ lines" value={counts.boq} />
            <Stat label="Documents" value={counts.docs} />
            <Stat label="Site images" value={counts.images} />
          </div>
        )}
      </Panel>
    </div>
  );
};

export default ProjectOverviewPanel;
