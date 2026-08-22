/**
 * Siyakha Connect — QS-style project lifecycle.
 *
 * Stages are stored on `portal_projects.lifecycle_stage` and are independent of
 * the legacy `status` column, so existing projects keep their current mapping
 * until an administrator changes the stage explicitly.
 */

export const LIFECYCLE_STAGES = [
  { value: "lead", label: "Lead" },
  { value: "quotation", label: "Quotation" },
  { value: "client_review", label: "Client review" },
  { value: "approved", label: "Approved" },
  { value: "detailed_design", label: "Detailed design" },
  { value: "procurement", label: "Procurement" },
  { value: "implementation", label: "Implementation" },
  { value: "testing_commissioning", label: "Testing & commissioning" },
  { value: "handover", label: "Handover" },
  { value: "complete", label: "Complete" },
  { value: "on_hold", label: "On hold" },
] as const;

export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number]["value"];

export const stageLabel = (stage?: string | null) =>
  LIFECYCLE_STAGES.find((s) => s.value === stage)?.label ?? (stage ? stage.replace(/_/g, " ") : "Not set");

/** Ordinal position used to decide which pack sections are relevant yet. */
export const stageIndex = (stage?: string | null) => {
  if (stage === "on_hold") return 0;
  const i = LIFECYCLE_STAGES.findIndex((s) => s.value === stage);
  return i < 0 ? 1 : i;
};

export const stageAtLeast = (stage: string | null | undefined, min: LifecycleStage) =>
  stageIndex(stage) >= stageIndex(min);

/** Delivery sections only appear once the project has moved past design. */
export const packSectionFlags = (stage?: string | null) => ({
  procurement: stageAtLeast(stage, "procurement"),
  installation: stageAtLeast(stage, "implementation"),
  testing: stageAtLeast(stage, "testing_commissioning"),
  handover: stageAtLeast(stage, "handover"),
});

export const ASSET_STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "ordered", label: "Ordered" },
  { value: "received", label: "Received" },
  { value: "installed", label: "Installed" },
  { value: "tested", label: "Tested" },
  { value: "commissioned", label: "Commissioned" },
  { value: "replaced", label: "Replaced" },
  { value: "removed", label: "Removed" },
] as const;

export type AssetStatus = (typeof ASSET_STATUSES)[number]["value"];

export const assetStatusLabel = (v?: string | null) =>
  ASSET_STATUSES.find((s) => s.value === v)?.label ?? "Planned";

export const BOQ_LINE_KINDS = [
  { value: "base", label: "Base scope" },
  { value: "alternative", label: "Optional alternative" },
  { value: "provisional", label: "Provisional sum / allowance" },
  { value: "contingency", label: "Contingency" },
  { value: "exclusion", label: "Exclusion" },
  { value: "variation", label: "Variation order" },
] as const;

export type BoqLineKind = (typeof BOQ_LINE_KINDS)[number]["value"];

export const lineKindLabel = (v?: string | null) =>
  BOQ_LINE_KINDS.find((k) => k.value === v)?.label ?? "Base scope";

export const VARIATION_STATUSES = ["proposed", "approved", "instructed", "rejected", "withdrawn"] as const;

/** Marker types are grouped into QS disciplines for schedules and packs. */
export const DISCIPLINE_BY_MARKER: Record<string, string> = {
  camera: "CCTV & surveillance",
  nvr: "CCTV & surveillance",
  wifi_ap: "Wireless networking",
  switch: "Network infrastructure",
  fibre_agg_switch: "Network infrastructure",
  fibre_liu: "Fibre infrastructure",
  fibre_splice: "Fibre infrastructure",
  patch_panel: "Structured cabling",
  data_point: "Structured cabling",
  cable_route: "Structured cabling",
  rack: "Network infrastructure",
  router_firewall: "Network security",
  access_control: "Access control",
  note_marker: "General",
  other: "General",
};

export const disciplineFor = (markerType?: string | null) =>
  DISCIPLINE_BY_MARKER[markerType ?? "other"] ?? "General";

export const MARKER_SHORT: Record<string, string> = {
  camera: "CAM",
  wifi_ap: "AP",
  rack: "RK",
  switch: "SW",
  nvr: "NVR",
  data_point: "DP",
  patch_panel: "PP",
  fibre_agg_switch: "FAS",
  fibre_liu: "LIU",
  fibre_splice: "SPL",
  router_firewall: "FW",
  access_control: "AC",
  cable_route: "CR",
  note_marker: "N",
  other: "DEV",
};

export const markerShort = (t?: string | null) => MARKER_SHORT[t ?? "other"] ?? "DEV";

export const deviceTypeLabel = (t?: string | null) =>
  (t ?? "other").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export const NOT_PROCURED = "Not yet procured";
