import { supabase } from "@/integrations/supabase/client";
import { computeTotals, lineTotal, round2, type BoqTotals } from "@/lib/boq";
import { deviceTotals, type DeviceTotals } from "@/lib/reporting";
import type { BuildingDetails } from "@/lib/projectWizard";


/** Untyped access for tables added after the generated types were produced. */
const db = supabase as unknown as {
  from: (t: string) => any;
  rpc: (f: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }>;
};

export const SIYAKHA = {
  company: "Siyakha Technology Solutions",
  email: "nikita@siyakhatechnology.co.za",
  website: "www.siyakhatechnology.co.za",
  phone: "081 501 2993",
  positioning:
    "A full-service technology infrastructure and managed solutions company delivering smart, scalable and secure technology environments.",
};

export type ProposalStatus = "draft" | "issued" | "accepted" | "superseded";

export type Proposal = {
  id: string;
  project_id: string;
  boq_id: string | null;
  proposal_number: string;
  revision_label: string;
  title: string;
  status: ProposalStatus;
  executive_summary: string | null;
  project_understanding: string | null;
  scope_of_work: string | null;
  methodology: string | null;
  deliverables: string | null;
  assumptions: string | null;
  exclusions: string | null;
  warranty_terms: string | null;
  payment_terms: string | null;
  validity_days: number;
  planned_start_date: string | null;
  planned_completion_date: string | null;
  prepared_by_name: string | null;
  prepared_by_email: string | null;
  snapshot: ProposalSnapshot | null;
  issued_at: string | null;
  accepted_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SnapshotLine = {
  item_code: string | null;
  description: string;
  specification: string | null;
  quantity: number;
  unit: string;
  customer_unit_rate: number;
  line_total: number;
  vat_applicable: boolean;
};

export type SnapshotSection = { title: string; description: string | null; lines: SnapshotLine[] };

/** Client-safe floor / plan schedule row frozen into a proposal. */
export type SnapshotFloor = {
  id: string;
  level_number: number;
  display_name: string;
  floor_use: string | null;
  notes: string | null;
  drawing_number: string | null;
  drawing_title: string | null;
  drawing_scale: string | null;
  revision_label: string | null;
  device_count: number;
};

export type ProposalSnapshot = {
  generated_at: string;
  client: { id: string; display_name: string; contact_name: string | null; contact_email: string | null; phone: string | null } | null;
  site: { id: string; name: string; address: string | null; city: string | null; province: string | null } | null;
  project: { id: string; title: string; reference: string | null; address: string | null; status: string | null } | null;
  /** QS building schedule captured on the project (never invented). */
  building?: BuildingDetails | null;
  /** Floor / plan schedule with per-floor device counts. */
  floors?: SnapshotFloor[];
  /** Device quantity roll-up (client-safe counts only). */
  devices?: DeviceTotals | null;
  boq: {
    id: string;
    title: string;
    revision_label: string;
    version_no: number;
    currency: string;
    vat_enabled: boolean;
    vat_rate: number;
    valid_until: string | null;
    notes: string | null;
  } | null;
  sections: SnapshotSection[];
  totals: BoqTotals;
};


export const PROPOSAL_DEFAULTS = {
  payment_terms:
    "50% deposit on order acceptance, 40% on delivery of equipment to site, 10% on practical completion and handover. Payment strictly 7 days from invoice date.",
  warranty_terms:
    "12 months workmanship warranty on all installation and cabling. Equipment carries the manufacturer's standard warranty. Warranty excludes damage caused by power surges, lightning, water ingress, theft, vandalism or third-party interference.",
  assumptions:
    "Free and safe access to all work areas during agreed working hours.\nPower, lockable storage and ablution facilities provided on site.\nCeiling voids, risers and containment routes are accessible.\nExisting electrical supply and DB capacity are adequate.\nPricing is based on a single continuous mobilisation.",
  exclusions:
    "Builders work, core drilling through structural elements and making good of finishes.\nElectrical reticulation, DB work and UPS supply unless quoted.\nInternet or fibre link subscription costs.\nAfter-hours or weekend work unless quoted.\nCivil works, trenching and sleeving unless quoted.",
  methodology:
    "1. Detailed design confirmation and site survey sign-off.\n2. Procurement and staging of equipment, pre-configuration in our workshop.\n3. Containment and cabling installation, labelled to standard.\n4. Device installation, termination and patching.\n5. Certification and testing with results documented per point.\n6. Commissioning, optimisation and client walk-through.\n7. Handover pack, as-built documentation and training.",
  deliverables:
    "Fully installed and certified structured cabling infrastructure.\nConfigured and commissioned active equipment.\nTest and certification results per point.\nAs-built documentation and labelling schedule.\nHandover pack and user orientation session.",
};

export const proposalStatusTone = (status: string) =>
  status === "accepted"
    ? "border-foreground bg-foreground text-background"
    : status === "issued"
      ? "border-foreground text-foreground"
      : status === "superseded"
        ? "border-dashed border-border text-muted-foreground line-through"
        : "border-dashed border-border text-muted-foreground";

export const isLocked = (p: Pick<Proposal, "status">) => p.status === "issued" || p.status === "accepted" || p.status === "superseded";

export const validUntil = (p: Pick<Proposal, "issued_at" | "created_at" | "validity_days">) => {
  const base = new Date(p.issued_at ?? p.created_at);
  base.setDate(base.getDate() + (Number(p.validity_days) || 30));
  return base;
};

export const nextProposalNumber = async () => {
  const { data, error } = await db.rpc("portal_next_proposal_number");
  if (error) throw error;
  return data as string;
};

/**
 * Builds an immutable client-facing snapshot. Supplier names, supplier costs,
 * markup, margin and internal notes are never read here, so they can never leak
 * into an issued document.
 */
export const buildSnapshot = async (projectId: string, boqId: string | null): Promise<ProposalSnapshot> => {
  const { data: project, error: pErr } = await db
    .from("portal_projects")
    .select("id, title, reference, address, status, client_id, site_id")
    .eq("id", projectId)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!project) throw new Error("Project not found");

  const [{ data: client }, { data: site }] = await Promise.all([
    project.client_id
      ? db.from("portal_clients").select("id, display_name, contact_name, contact_email, phone").eq("id", project.client_id).maybeSingle()
      : Promise.resolve({ data: null }),
    project.site_id
      ? db.from("portal_sites").select("id, name, address, city, province").eq("id", project.site_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  let boq: ProposalSnapshot["boq"] = null;
  let sections: SnapshotSection[] = [];
  let totals: BoqTotals = { subtotal: 0, vat: 0, total: 0 };

  if (boqId) {
    const [{ data: b, error: bErr }, { data: secs }, { data: lines }] = await Promise.all([
      db.from("portal_boqs").select("*").eq("id", boqId).maybeSingle(),
      db.from("portal_boq_sections").select("*").eq("boq_id", boqId).order("sort_order"),
      db.from("portal_boq_items").select("*").eq("boq_id", boqId).order("sort_order"),
    ]);
    if (bErr) throw bErr;
    if (b) {
      boq = {
        id: b.id,
        title: b.title,
        revision_label: b.revision_label,
        version_no: b.version_no,
        currency: b.currency,
        vat_enabled: b.vat_enabled,
        vat_rate: Number(b.vat_rate),
        valid_until: b.valid_until,
        notes: b.notes,
      };
      const included = (lines ?? []).filter((l: any) => l.is_included);
      sections = (secs ?? []).map((s: any) => ({
        title: s.title,
        description: s.description,
        lines: included
          .filter((l: any) => l.section_id === s.id)
          .map((l: any) => ({
            item_code: l.item_code,
            description: l.description,
            specification: l.specification,
            quantity: Number(l.quantity),
            unit: l.unit,
            customer_unit_rate: Number(l.customer_unit_rate),
            line_total: round2(Number(l.line_total ?? lineTotal(Number(l.quantity), Number(l.customer_unit_rate)))),
            vat_applicable: !!l.vat_applicable,
          })),
      }));
      totals = computeTotals(included as any, { vat_enabled: !!b.vat_enabled, vat_rate: Number(b.vat_rate) });
    }
  }

  return {
    generated_at: new Date().toISOString(),
    client: client ?? null,
    site: site ?? null,
    project: { id: project.id, title: project.title, reference: project.reference, address: project.address, status: project.status },
    boq,
    sections,
    totals,
  };
};

export const proposalsDb = db;
