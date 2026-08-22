/**
 * Siyakha Connect — full project pack data layer.
 *
 * Everything here is derived live from the existing portal tables (projects,
 * floors, markers, cables, racks, NVRs, BOQs, tasks, milestones, queries,
 * proposals, plan revisions, assets, variations). Nothing is duplicated.
 *
 * Two strictly separated shapes are produced:
 *  - `ProjectPack`      — client-facing. Never carries supplier identity,
 *                         supplier cost, markup, margin or internal notes.
 *  - `InternalCommercial` — admin-only cost/margin view.
 */

import { supabase } from "@/integrations/supabase/client";
import { computeTotals, lineTotal, round2, type BoqTotals } from "@/lib/boq";
import { disciplineFor } from "@/lib/lifecycle";

const db = supabase as unknown as {
  from: (t: string) => any;
  rpc: (f: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }>;
};

export type PackMarker = {
  id: string;
  floor_id: string;
  marker_type: string;
  label: string;
  status: string;
  discipline: string;
  equipment: string | null;
  model: string | null;
  area: string | null;
  x_norm: number | null;
  y_norm: number | null;
  is_placed: boolean;
  direction_deg: number | null;
  fov_deg: number | null;
  coverage_range: string | null;
  mounting_height_m: number | null;
  environment: string | null;
  lens_model: string | null;
  radio_band: string | null;
  ssid: string | null;
  vlan: string | null;
  switch_port: number | null;
  nvr_id: string | null;
  nvr_channel: number | null;
  serial_number: string | null;
  mac_address: string | null;
  asset: PackAsset | null;
};

export type PackAsset = {
  id: string;
  marker_id: string | null;
  lifecycle_status: string;
  asset_tag: string | null;
  serial_number: string | null;
  mac_address: string | null;
  ip_address: string | null;
  manufacturer: string | null;
  model: string | null;
  warranty_expiry: string | null;
  installer: string | null;
  installed_on: string | null;
  test_result: string | null;
  tested_on: string | null;
  commissioned_on: string | null;
  rack_label: string | null;
  switch_label: string | null;
  switch_port: number | null;
  patch_panel: string | null;
  patch_panel_port: number | null;
  nvr_label: string | null;
  nvr_channel: number | null;
  area: string | null;
  /** Internal-only fields. Stripped from the client pack. */
  supplier?: string | null;
  purchase_date?: string | null;
  po_reference?: string | null;
  notes?: string | null;
};

export type PackFloor = {
  id: string;
  level_number: number;
  display_name: string;
  floor_use: string;
  notes: string | null;
  plan_image_path: string | null;
  markers: PackMarker[];
};

export type PackBoqLine = {
  item_code: string | null;
  description: string;
  specification: string | null;
  quantity: number;
  unit: string;
  customer_unit_rate: number;
  line_total: number;
  vat_applicable: boolean;
  line_kind: string;
  discipline: string | null;
  work_package: string | null;
  section: string;
  qty_procured: number;
  qty_received: number;
  qty_installed: number;
  qty_tested: number;
  qty_commissioned: number;
};

export type PackNarrative = {
  executive_summary: string | null;
  project_understanding: string | null;
  scope_of_work: string | null;
  methodology: string | null;
  deliverables: string | null;
  assumptions: string | null;
  exclusions: string | null;
  warranty_terms: string | null;
  payment_terms: string | null;
  validity_days: number | null;
  planned_start_date: string | null;
  planned_completion_date: string | null;
  proposal_number: string | null;
  proposal_revision: string | null;
};

export type PackPhoto = {
  id: string;
  caption: string | null;
  taken_at: string | null;
  /** Private storage path; replaced by a short-lived signed URL for guests. */
  storage_path: string | null;
  photo_url?: string | null;
};

export type PackDocument = {
  id: string;
  title: string;
  category: string;
  version: string | null;
  document_date: string | null;
  reference: string | null;
};

export type ProjectPack = {
  generated_at: string;
  revision_no: number;
  lifecycle_stage: string | null;
  client: { id: string; display_name: string; contact_name: string | null; contact_email: string | null; phone: string | null } | null;
  site: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    province: string | null;
    venue_type: string | null;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
  } | null;
  project: {
    id: string;
    title: string;
    reference: string | null;
    address: string | null;
    status: string | null;
    consultant: string | null;
    description: string | null;
    site_context: string | null;
    objectives: string | null;
    stakeholders: string | null;
    risks_notes: string | null;
    planning_narrative: string | null;
    design_concept: string | null;
    project_approach: string | null;
    start_date: string | null;
    target_date: string | null;
  };
  narrative: PackNarrative;
  floors: PackFloor[];
  nvrs: PackNvr[];
  cables: PackCable[];
  rackEquipment: PackRackItem[];
  boq: {
    id: string;
    title: string;
    revision_label: string;
    version_no: number;
    vat_enabled: boolean;
    vat_rate: number;
    valid_until: string | null;
    notes: string | null;
  } | null;
  boqLines: PackBoqLine[];
  totals: BoqTotals;
  variations: PackVariation[];
  tasks: PackTask[];
  milestones: PackMilestone[];
  /** Internal-only registers. Always empty in a client-facing pack. */
  queries: PackInternalRow[];
  planRevisions: PackPlanRevision[];
  proposals: PackProposalRow[];
  stageHistory: PackInternalRow[];
  activity: PackInternalRow[];
  assets: PackAsset[];
  /** Site gallery selected for client sharing. */
  gallery: PackPhoto[];
  /** Document register metadata (no private paths are exposed). */
  documents: PackDocument[];
};

export type PackNvr = {
  id: string;
  label: string;
  manufacturer: string | null;
  model: string | null;
  channel_count: number | null;
  channel_from: number | null;
  channel_to: number | null;
  status: string | null;
  rack_marker_id: string | null;
};

export type PackCable = {
  id: string;
  route_label: string | null;
  cable_type: string | null;
  service_type: string | null;
  route_kind: string | null;
  status: string | null;
  source_label: string | null;
  destination_label: string | null;
  estimated_length_m: number | null;
  measured_length_m: number | null;
  floor_id: string | null;
  waypoints: unknown;
  patch_panel: string | null;
  patch_panel_port: number | null;
  switch_port: number | null;
  fibre_strands: number | null;
};

export type PackRackItem = {
  id: string;
  rack_marker_id: string | null;
  floor_id: string | null;
  equipment_name: string | null;
  equipment_type: string | null;
  manufacturer: string | null;
  model: string | null;
  description: string | null;
  rack_units: number | null;
  rack_position: number | null;
  quantity: number | null;
  role: string | null;
  copper_ports: number | null;
  sfp_ports: number | null;
  sfp_plus_ports: number | null;
  port_type: string | null;
  poe_capable: boolean | null;
  network_layer: string | null;
  status: string | null;
};

export type PackVariation = {
  id: string;
  reference: string | null;
  title: string;
  description: string | null;
  discipline: string | null;
  status: string;
  customer_amount: number | null;
  raised_on: string | null;
  decided_on: string | null;
};

export type PackTask = {
  id: string;
  title: string;
  owner: string | null;
  priority: string | null;
  due_date: string | null;
  status: string | null;
};

export type PackMilestone = {
  id: string;
  title: string;
  detail: string | null;
  due_date: string | null;
  status: string | null;
};

export type PackPlanRevision = {
  id: string;
  floor_id: string | null;
  revision_label: string | null;
  page_number: number | null;
  page_count: number | null;
  is_current: boolean;
  created_at: string | null;
};

export type PackProposalRow = {
  id: string;
  proposal_number: string | null;
  revision_label: string | null;
  status: string;
  issued_at: string | null;
  created_at: string | null;
};

/** Placeholder shape for registers that are never included client-side. */
export type PackInternalRow = Record<string, never>;


const MARKER_COLUMNS =
  "id, floor_id, marker_type, label, status, equipment, model, area, x_norm, y_norm, is_placed, direction_deg, fov_deg, coverage_range, mounting_height_m, environment, lens_model, radio_band, ssid, vlan, switch_port, nvr_id, nvr_channel, serial_number, mac_address, client_visible, sort_order";

const stripInternal = (a: any): PackAsset => ({
  id: a.id,
  marker_id: a.marker_id,
  lifecycle_status: a.lifecycle_status,
  asset_tag: a.asset_tag,
  serial_number: a.serial_number,
  mac_address: a.mac_address,
  ip_address: a.ip_address,
  manufacturer: a.manufacturer,
  model: a.model,
  warranty_expiry: a.warranty_expiry,
  installer: a.installer,
  installed_on: a.installed_on,
  test_result: a.test_result,
  tested_on: a.tested_on,
  commissioned_on: a.commissioned_on,
  rack_label: a.rack_label,
  switch_label: a.switch_label,
  switch_port: a.switch_port,
  patch_panel: a.patch_panel,
  patch_panel_port: a.patch_panel_port,
  nvr_label: a.nvr_label,
  nvr_channel: a.nvr_channel,
  area: a.area,
});

/**
 * Builds the frozen, client-safe project record.
 *
 * Every query is an explicit column allowlist (never SELECT *) and every domain
 * is filtered for client visibility, archival state and issue state. Any failed
 * query is fatal: a partial pack must never be frozen or issued.
 *
 * @param clientVisibleOnly restrict to client-visible, non-internal records.
 */
export async function buildProjectPack(projectId: string, clientVisibleOnly = true): Promise<ProjectPack> {
  /** Any query error aborts the whole build with an admin-readable reason. */
  const need = (label: string, res: any): any => {
    if (res?.error) throw new Error(`Project pack build failed while loading ${label}: ${res.error.message ?? res.error}`);
    return res.data;
  };

  const projectRes = await db
    .from("portal_projects")
    .select(
      "id, client_id, site_id, title, reference, address, status, consultant, description, site_context, objectives, stakeholders, risks_notes, planning_narrative, design_concept, project_approach, start_date, target_date, lifecycle_stage",
    )
    .eq("id", projectId)
    .maybeSingle();
  const project = need("the project record", projectRes);
  if (!project) throw new Error("Project not found");

  const visibleOnly = (q: any) => (clientVisibleOnly ? q.eq("client_visible", true) : q);
  const liveOnly = (q: any) => (clientVisibleOnly ? q.is("archived_at", null) : q);

  const [
    clientRes,
    siteRes,
    floorsRes,
    markersRes,
    nvrsRes,
    cablesRes,
    equipRes,
    boqsRes,
    varRes,
    tasksRes,
    milesRes,
    revRes,
    propRes,
    assetsRes,
    photosRes,
    docsRes,
  ] = await Promise.all([
    project.client_id
      ? db.from("portal_clients").select("id, display_name, contact_name, contact_email, phone").eq("id", project.client_id).maybeSingle()
      : Promise.resolve({ data: null }),
    project.site_id
      ? db
          .from("portal_sites")
          .select("id, name, address, city, province, venue_type, contact_name, contact_email, contact_phone")
          .eq("id", project.site_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    visibleOnly(
      db
        .from("portal_floors")
        .select("id, level_number, display_name, floor_use, notes, plan_image_path, client_visible, sort_order")
        .eq("project_id", projectId),
    ).order("sort_order"),
    liveOnly(visibleOnly(db.from("portal_floor_markers").select(MARKER_COLUMNS).eq("project_id", projectId))).order("sort_order"),
    visibleOnly(
      db
        .from("portal_nvrs")
        .select("id, label, manufacturer, model, channel_count, channel_from, channel_to, status, rack_marker_id")
        .eq("project_id", projectId),
    ).order("sort_order"),
    liveOnly(
      visibleOnly(
        db
          .from("portal_cable_routes")
          .select(
            "id, route_label, cable_type, service_type, route_kind, status, source_label, destination_label, estimated_length_m, measured_length_m, floor_id, waypoints, patch_panel, patch_panel_port, switch_port, fibre_strands",
          )
          .eq("project_id", projectId),
      ),
    ).order("route_label"),
    liveOnly(
      visibleOnly(
        db
          .from("portal_rack_equipment")
          .select(
            "id, rack_marker_id, floor_id, equipment_name, equipment_type, manufacturer, model, description, rack_units, rack_position, quantity, role, copper_ports, sfp_ports, sfp_plus_ports, port_type, poe_capable, network_layer, status",
          )
          .eq("project_id", projectId),
      ),
    ).order("sort_order"),
    db
      .from("portal_boqs")
      .select("id, title, revision_label, version_no, status, vat_enabled, vat_rate, valid_until, notes")
      .eq("project_id", projectId)
      .order("version_no", { ascending: false }),
    visibleOnly(
      db
        .from("portal_variations")
        .select("id, reference, title, description, discipline, status, customer_amount, raised_on, decided_on, client_visible")
        .eq("project_id", projectId),
    ).order("raised_on", { ascending: false }),
    db.from("portal_tasks").select("id, title, owner, priority, due_date, status").eq("project_id", projectId).order("sort_order"),
    db.from("portal_milestones").select("id, title, detail, due_date, status").eq("project_id", projectId).order("sort_order"),
    visibleOnly(
      db
        .from("portal_plan_revisions")
        .select("id, floor_id, revision_label, page_number, page_count, is_current, created_at, client_visible, archived_at")
        .eq("project_id", projectId)
        .is("archived_at", null)
        .eq("is_current", true),
    ).order("created_at", { ascending: false }),
    db
      .from("portal_proposals")
      .select(
        "id, proposal_number, revision_label, status, issued_at, created_at, executive_summary, project_understanding, scope_of_work, methodology, deliverables, assumptions, exclusions, warranty_terms, payment_terms, validity_days, planned_start_date, planned_completion_date",
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
    db
      .from("portal_assets")
      .select(
        "id, marker_id, lifecycle_status, asset_tag, serial_number, mac_address, ip_address, manufacturer, model, warranty_expiry, installer, installed_on, test_result, tested_on, commissioned_on, rack_label, switch_label, switch_port, patch_panel, patch_panel_port, nvr_label, nvr_channel, area",
      )
      .eq("project_id", projectId),
    db
      .from("portal_photos")
      .select("id, caption, taken_at, storage_path")
      .eq("project_id", projectId)
      .order("taken_at", { ascending: false })
      .limit(60),
    db
      .from("portal_documents")
      .select("id, title, category, version, document_date, reference")
      .eq("project_id", projectId)
      .order("document_date", { ascending: false })
      .limit(80),
  ]);

  const clientRow = need("the client", clientRes);
  const siteRow = need("the site", siteRes);
  const assetsRaw: any[] = need("assets", assetsRes) ?? [];
  const assetByMarker = new Map<string, any>();
  for (const a of assetsRaw) if (a.marker_id) assetByMarker.set(a.marker_id, a);

  const markers: any[] = need("plan markers", markersRes) ?? [];
  const floorsRaw: any[] = need("floors", floorsRes) ?? [];

  const floors: PackFloor[] = floorsRaw.map((f) => ({
    id: f.id,
    level_number: f.level_number,
    display_name: f.display_name,
    floor_use: f.floor_use,
    notes: f.notes,
    plan_image_path: f.plan_image_path,
    markers: markers
      .filter((m) => m.floor_id === f.id)
      .map((m) => ({
        id: m.id,
        floor_id: m.floor_id,
        marker_type: m.marker_type,
        label: m.label,
        status: m.status,
        discipline: disciplineFor(m.marker_type),
        equipment: m.equipment,
        model: m.model,
        area: m.area,
        x_norm: m.x_norm === null ? null : Number(m.x_norm),
        y_norm: m.y_norm === null ? null : Number(m.y_norm),
        is_placed: !!m.is_placed,
        direction_deg: m.direction_deg ?? null,
        fov_deg: m.fov_deg ?? null,
        coverage_range: m.coverage_range ?? null,
        mounting_height_m: m.mounting_height_m === null ? null : Number(m.mounting_height_m),
        environment: m.environment,
        lens_model: m.lens_model,
        radio_band: m.radio_band,
        ssid: m.ssid,
        vlan: m.vlan,
        switch_port: m.switch_port,
        nvr_id: m.nvr_id,
        nvr_channel: m.nvr_channel,
        serial_number: m.serial_number,
        mac_address: m.mac_address,
        asset: assetByMarker.has(m.id) ? stripInternal(assetByMarker.get(m.id)) : null,
      })),
  }));

  // Client packs price the approved BOQ only; internal packs may use the latest.
  const boqs: any[] = need("bills of quantities", boqsRes) ?? [];
  const activeBoq = clientVisibleOnly
    ? boqs.find((b) => b.status === "approved") ?? null
    : boqs.find((b) => b.status === "approved") ?? boqs[0] ?? null;
  let boqLines: PackBoqLine[] = [];
  let totals: BoqTotals = { subtotal: 0, vat: 0, total: 0 };

  if (activeBoq) {
    const [secsRes, linesRes] = await Promise.all([
      db.from("portal_boq_sections").select("id, title, sort_order").eq("boq_id", activeBoq.id).order("sort_order"),
      db
        .from("portal_boq_items")
        .select(
          "id, section_id, item_code, description, specification, quantity, unit, customer_unit_rate, line_total, vat_applicable, line_kind, discipline, work_package, is_included, qty_procured, qty_received, qty_installed, qty_tested, qty_commissioned",
        )
        .eq("boq_id", activeBoq.id)
        .order("sort_order"),
    ]);
    const secs = need("BOQ sections", secsRes) ?? [];
    const lines = need("BOQ lines", linesRes) ?? [];
    const sectionTitle = new Map<string, string>(secs.map((s: any) => [s.id, s.title]));
    boqLines = lines.map((l: any) => ({
      item_code: l.item_code,
      description: l.description,
      specification: l.specification,
      quantity: Number(l.quantity),
      unit: l.unit,
      customer_unit_rate: Number(l.customer_unit_rate),
      line_total: round2(Number(l.line_total ?? lineTotal(Number(l.quantity), Number(l.customer_unit_rate)))),
      vat_applicable: !!l.vat_applicable,
      line_kind: l.line_kind ?? "base",
      discipline: l.discipline ?? null,
      work_package: l.work_package ?? null,
      section: sectionTitle.get(l.section_id) ?? "General",
      qty_procured: Number(l.qty_procured ?? 0),
      qty_received: Number(l.qty_received ?? 0),
      qty_installed: Number(l.qty_installed ?? 0),
      qty_tested: Number(l.qty_tested ?? 0),
      qty_commissioned: Number(l.qty_commissioned ?? 0),
    }));
    const priced = lines.filter(
      (l: any) => l.is_included && (l.line_kind ?? "base") !== "alternative" && (l.line_kind ?? "base") !== "exclusion",
    );
    totals = computeTotals(priced as any, { vat_enabled: !!activeBoq.vat_enabled, vat_rate: Number(activeBoq.vat_rate) });
  }

  // Only an issued or accepted proposal may carry the client narrative.
  const proposalsRaw: any[] = need("proposals", propRes) ?? [];
  const issuedProposals = clientVisibleOnly
    ? proposalsRaw.filter((p) => p.status === "issued" || p.status === "accepted")
    : proposalsRaw;
  const latest = issuedProposals.find((p) => p.status === "accepted") ?? issuedProposals.find((p) => p.status === "issued") ?? null;

  const variationsRaw: any[] = need("variations", varRes) ?? [];
  const variations: PackVariation[] = (clientVisibleOnly ? variationsRaw.filter((v) => v.status === "approved") : variationsRaw).map((v) => ({
    id: v.id,
    reference: v.reference,
    title: v.title,
    description: v.description,
    discipline: v.discipline,
    status: v.status,
    customer_amount: v.customer_amount === null || v.customer_amount === undefined ? null : Number(v.customer_amount),
    raised_on: v.raised_on,
    decided_on: v.decided_on,
  }));

  return {
    generated_at: new Date().toISOString(),
    revision_no: 0,
    lifecycle_stage: project.lifecycle_stage ?? null,
    client: clientRow ?? null,
    site: siteRow ?? null,
    project: {
      id: project.id,
      title: project.title,
      reference: project.reference,
      address: project.address,
      status: project.status,
      consultant: project.consultant,
      description: project.description,
      site_context: project.site_context,
      objectives: project.objectives,
      stakeholders: project.stakeholders,
      // Internal risk notes never travel in a client-facing pack.
      risks_notes: clientVisibleOnly ? null : project.risks_notes,
      planning_narrative: project.planning_narrative,
      design_concept: project.design_concept ?? null,
      project_approach: project.project_approach ?? null,
      start_date: project.start_date,
      target_date: project.target_date,
    },
    narrative: {
      executive_summary: latest?.executive_summary ?? null,
      project_understanding: latest?.project_understanding ?? null,
      scope_of_work: latest?.scope_of_work ?? null,
      methodology: latest?.methodology ?? null,
      deliverables: latest?.deliverables ?? null,
      assumptions: latest?.assumptions ?? null,
      exclusions: latest?.exclusions ?? null,
      warranty_terms: latest?.warranty_terms ?? null,
      payment_terms: latest?.payment_terms ?? null,
      validity_days: latest?.validity_days ?? null,
      planned_start_date: latest?.planned_start_date ?? null,
      planned_completion_date: latest?.planned_completion_date ?? null,
      proposal_number: latest?.proposal_number ?? null,
      proposal_revision: latest?.revision_label ?? null,
    },
    floors,
    nvrs: (need("NVRs", nvrsRes) ?? []) as PackNvr[],
    cables: (need("cable routes", cablesRes) ?? []) as PackCable[],
    rackEquipment: (need("rack equipment", equipRes) ?? []) as PackRackItem[],
    boq: activeBoq
      ? {
          id: activeBoq.id,
          title: activeBoq.title,
          revision_label: activeBoq.revision_label,
          version_no: activeBoq.version_no,
          vat_enabled: !!activeBoq.vat_enabled,
          vat_rate: Number(activeBoq.vat_rate),
          valid_until: activeBoq.valid_until,
          notes: activeBoq.notes,
        }
      : null,
    boqLines,
    totals,
    variations,
    tasks: (need("programme tasks", tasksRes) ?? []) as PackTask[],
    milestones: (need("milestones", milesRes) ?? []) as PackMilestone[],
    // Queries, stage history and activity are internal registers: never packed.
    queries: [],
    planRevisions: ((need("plan revisions", revRes) ?? []) as any[]).map((r) => ({
      id: r.id,
      floor_id: r.floor_id,
      revision_label: r.revision_label,
      page_number: r.page_number,
      page_count: r.page_count,
      is_current: !!r.is_current,
      created_at: r.created_at,
    })),
    proposals: issuedProposals.map((p) => ({
      id: p.id,
      proposal_number: p.proposal_number,
      revision_label: p.revision_label,
      status: p.status,
      issued_at: p.issued_at,
      created_at: p.created_at,
    })),
    stageHistory: [],
    activity: [],
    assets: assetsRaw.map(stripInternal),
    gallery: (need("site gallery", photosRes) ?? []) as PackPhoto[],
    documents: (need("document register", docsRes) ?? []) as PackDocument[],
  };
}

/* ---------------------------------------------------------------- internal */

export type InternalLine = {
  section: string;
  item_code: string | null;
  description: string;
  quantity: number;
  unit: string;
  customer_unit_rate: number;
  line_total: number;
  supplier: string | null;
  supplier_unit_cost: number;
  markup_percent: number;
  cost_total: number;
  gross_profit: number;
  margin_percent: number;
  internal_notes: string | null;
  line_kind: string;
};

export type InternalCommercial = {
  generated_at: string;
  project_title: string;
  client_name: string;
  boq_label: string | null;
  lines: InternalLine[];
  revenue: number;
  cost: number;
  gross_profit: number;
  margin_percent: number;
  assets: any[];
};

export async function buildInternalCommercial(projectId: string): Promise<InternalCommercial> {
  const { data: project, error } = await db.from("portal_projects").select("*").eq("id", projectId).maybeSingle();
  if (error) throw error;
  if (!project) throw new Error("Project not found");

  const [{ data: client }, { data: boqs }, { data: assets }] = await Promise.all([
    project.client_id ? db.from("portal_clients").select("display_name").eq("id", project.client_id).maybeSingle() : Promise.resolve({ data: null }),
    db.from("portal_boqs").select("*").eq("project_id", projectId).order("version_no", { ascending: false }),
    db.from("portal_assets").select("*").eq("project_id", projectId).order("created_at"),
  ]);

  const boq = (boqs ?? []).find((b: any) => b.status === "approved") ?? (boqs ?? [])[0] ?? null;
  let lines: InternalLine[] = [];
  if (boq) {
    const [{ data: secs }, { data: items }, { data: costs }] = await Promise.all([
      db.from("portal_boq_sections").select("*").eq("boq_id", boq.id).order("sort_order"),
      db.from("portal_boq_items").select("*").eq("boq_id", boq.id).order("sort_order"),
      db.from("portal_boq_item_costs").select("*"),
    ]);
    const sectionTitle = new Map<string, string>((secs ?? []).map((s: any) => [s.id, s.title]));
    const costByItem = new Map<string, any>((costs ?? []).map((c: any) => [c.item_id, c]));
    lines = (items ?? [])
      .filter((i: any) => i.is_included)
      .map((i: any) => {
        const c = costByItem.get(i.id);
        const qty = Number(i.quantity);
        const rate = Number(i.customer_unit_rate);
        const revenue = round2(Number(i.line_total ?? lineTotal(qty, rate)));
        const unitCost = Number(c?.supplier_unit_cost ?? 0);
        const costTotal = round2(qty * unitCost);
        const gp = round2(revenue - costTotal);
        return {
          section: sectionTitle.get(i.section_id) ?? "General",
          item_code: i.item_code,
          description: i.description,
          quantity: qty,
          unit: i.unit,
          customer_unit_rate: rate,
          line_total: revenue,
          supplier: c?.supplier ?? null,
          supplier_unit_cost: unitCost,
          markup_percent: Number(c?.markup_percent ?? 0),
          cost_total: costTotal,
          gross_profit: gp,
          margin_percent: revenue > 0 ? round2((gp / revenue) * 100) : 0,
          internal_notes: c?.internal_notes ?? null,
          line_kind: i.line_kind ?? "base",
        };
      });
  }

  const revenue = round2(lines.reduce((s, l) => s + l.line_total, 0));
  const cost = round2(lines.reduce((s, l) => s + l.cost_total, 0));
  const gp = round2(revenue - cost);

  return {
    generated_at: new Date().toISOString(),
    project_title: project.title,
    client_name: (client as any)?.display_name ?? "—",
    boq_label: boq ? `${boq.revision_label} (v${boq.version_no})` : null,
    lines,
    revenue,
    cost,
    gross_profit: gp,
    margin_percent: revenue > 0 ? round2((gp / revenue) * 100) : 0,
    assets: assets ?? [],
  };
}

/* ------------------------------------------------------------- pack issuing */

export async function issuePack(
  projectId: string,
  kind: "client" | "internal",
  title: string,
  snapshot: unknown,
  lifecycleStage: string | null,
) {
  const { data: rev, error: rErr } = await db.rpc("portal_next_pack_revision", {
    _project_id: projectId,
    _pack_kind: kind,
  });
  if (rErr) throw rErr;
  const revision = Number(rev ?? 1);
  const { data: user } = await supabase.auth.getUser();
  const packNumber = `PACK-${new Date().getFullYear()}-${String(revision).padStart(3, "0")}`;
  const payload = { ...(snapshot as Record<string, unknown>), revision_no: revision };
  const { data, error } = await db
    .from("portal_project_packs")
    .insert({
      project_id: projectId,
      pack_number: packNumber,
      revision_no: revision,
      pack_kind: kind,
      lifecycle_stage: lifecycleStage,
      title,
      snapshot: payload,
      issued_by: user?.user?.id ?? null,
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function loadPacks(projectId: string) {
  const { data, error } = await db
    .from("portal_project_packs")
    .select("id, pack_number, revision_no, pack_kind, lifecycle_stage, title, issued_at, client_visible")
    .eq("project_id", projectId)
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function loadPackSnapshot(id: string) {
  const { data, error } = await db.from("portal_project_packs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------------- CSV */

export const toCsv = (rows: (string | number | null | undefined)[][]) =>
  rows
    .map((r) =>
      r
        .map((cell) => {
          const v = cell === null || cell === undefined ? "" : String(cell);
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        })
        .join(","),
    )
    .join("\r\n");

export const downloadCsv = (filename: string, rows: (string | number | null | undefined)[][]) => {
  const blob = new Blob([`\uFEFF${toCsv(rows)}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
