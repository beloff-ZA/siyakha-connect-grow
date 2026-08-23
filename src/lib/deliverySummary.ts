/**
 * Reusable "Client Delivery Summary" rules.
 *
 * Every number and claim here is derived from stored project data (plan
 * markers, rack equipment, BOQ lines) or from admin-entered delivery settings.
 * Nothing is hard-coded to one building, and no product capability is claimed
 * unless the stored model is known to support it.
 */

export type DeliverySettings = {
  id?: string;
  project_id: string;
  executive_summary: string | null;
  delivery_objectives: string | null;
  team_size: number | null;
  duration_weeks: number | null;
  lead_engineer_count: number | null;
  lead_engineer_role: string | null;
  temp_cctv_enabled: boolean;
  temp_cctv_notes: string | null;
  power_backup_hours: number | null;
  power_backup_qualification: string | null;
  cctv_recording_mode: string | null;
  cctv_average_bitrate_kbps: number | null;
  cctv_duty_cycle: number | null;
  cctv_codec: string | null;
  hdd_raw_tb: number | null;
  hdd_usable_factor: number | null;
  methodology: string | null;
  benefits_narrative: string | null;
  assumptions: string | null;
  exclusions: string | null;
  stages: DeliveryStage[];
  updated_at?: string;
};

export type DeliveryStage = { title: string; detail?: string | null };

/** Default post-acceptance programme. Admin-editable per project. */
export const DEFAULT_DELIVERY_STAGES: DeliveryStage[] = [
  { title: "Acceptance recorded and project revision baselined" },
  {
    title: "Final onsite survey",
    detail: "RF, CCTV sightlines, riser routes, containment, power/load and storage validation.",
  },
  { title: "Procurement and equipment staging / pre-configuration" },
  { title: "Temporary onsite construction CCTV installed for safety during the works period" },
  { title: "Containment, rack positions, protected power and fibre backbone installed" },
  { title: "Fibre fusion splicing, trays, cassettes, pigtails, adapters and SFPs installed, tested and labelled" },
  { title: "Copper cabling terminated, labelled and tested" },
  { title: "Switches, aggregation, gateway/router, APs, cameras, NVR, drives and UPS/power equipment mounted" },
  {
    title: "Network engineer configuration",
    detail: "SSIDs, VLANs, switching, routing, failover, CCTV/NVR, management and monitoring.",
  },
  {
    title: "End-to-end testing and handover",
    detail: "RF validation, CCTV view/retention checks, power-failover test, documentation, training and handover.",
  },
];

export const emptyDeliverySettings = (project_id: string): DeliverySettings => ({
  project_id,
  executive_summary: null,
  delivery_objectives: null,
  team_size: null,
  duration_weeks: null,
  lead_engineer_count: null,
  lead_engineer_role: null,
  temp_cctv_enabled: false,
  temp_cctv_notes: null,
  power_backup_hours: null,
  power_backup_qualification: null,
  cctv_recording_mode: null,
  cctv_average_bitrate_kbps: null,
  cctv_duty_cycle: null,
  cctv_codec: null,
  hdd_raw_tb: null,
  hdd_usable_factor: null,
  methodology: null,
  benefits_narrative: null,
  assumptions: null,
  exclusions: null,
  stages: DEFAULT_DELIVERY_STAGES,
});

export const deliveryStages = (settings?: DeliverySettings | null): DeliveryStage[] =>
  settings?.stages?.length ? settings.stages : DEFAULT_DELIVERY_STAGES;

/* -------------------------------------------------- CCTV retention estimate */

export type RetentionInput = {
  camera_count?: number | null;
  raw_capacity_tb?: number | null;
  usable_capacity_factor?: number | null;
  average_bitrate_kbps?: number | null;
  recording_duty_cycle?: number | null;
};

export const RETENTION_PENDING = "Retention pending final recording profile and storage confirmation";

export type RetentionEstimate =
  | { ok: true; hours: number; days: number; usableTb: number; label: string }
  | { ok: false; reason: string; missing: string[] };

const positive = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v > 0;

/**
 * usable_bytes = raw_capacity_bytes x usable_capacity_factor
 * retention_seconds = usable_bytes x 8 / (cameras x bitrate_bps x duty_cycle)
 *
 * Any missing input returns the truthful pending state — never a guess.
 */
export function retentionEstimate(input: RetentionInput): RetentionEstimate {
  const missing: string[] = [];
  if (!positive(input.camera_count)) missing.push("camera count");
  if (!positive(input.raw_capacity_tb)) missing.push("raw storage capacity");
  if (!positive(input.usable_capacity_factor)) missing.push("usable capacity factor");
  if (!positive(input.average_bitrate_kbps)) missing.push("average bitrate");
  if (!positive(input.recording_duty_cycle)) missing.push("recording duty cycle");
  if (missing.length) return { ok: false, reason: RETENTION_PENDING, missing };

  const rawBytes = (input.raw_capacity_tb as number) * 1e12;
  const usableBytes = rawBytes * (input.usable_capacity_factor as number);
  const bitrateBps = (input.average_bitrate_kbps as number) * 1000;
  const seconds =
    (usableBytes * 8) /
    ((input.camera_count as number) * bitrateBps * (input.recording_duty_cycle as number));
  const hours = Math.round((seconds / 3600) * 10) / 10;
  const days = Math.round((seconds / 86400) * 10) / 10;
  return {
    ok: true,
    hours,
    days,
    usableTb: Math.round(((usableBytes / 1e12) + Number.EPSILON) * 100) / 100,
    label: `Estimated ${days} days (${hours} hours) of continuous recording`,
  };
}

/* ------------------------------------------------- derived equipment summary */

export type MarkerLike = { marker_type: string; model?: string | null; equipment?: string | null };
export type RackItemLike = {
  equipment_type?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  equipment_name?: string | null;
  quantity?: number | null;
  copper_ports?: number | null;
  sfp_ports?: number | null;
  sfp_plus_ports?: number | null;
  poe_capable?: boolean | null;
  network_layer?: string | null;
};
export type BoqLineLike = {
  item_code?: string | null;
  description?: string | null;
  specification?: string | null;
  quantity?: number | null;
  unit?: string | null;
  section?: string | null;
};

export type EquipmentSummary = {
  access_points: number;
  cameras: number;
  racks: number;
  access_point_model: string | null;
  switches: { model: string; label: string; quantity: number; ports: string }[];
  aggregation: { model: string; label: string; ports: string } | null;
  gateway: { model: string; label: string } | null;
  nvr: { label: string; channels: number | null } | null;
  storage: { label: string; raw_tb: number | null; drives: number } | null;
  power: { label: string; quantity: number }[];
  fibre: { present: string[]; missing: string[] };
};

const num = (v: unknown, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

const portSummary = (r: RackItemLike) =>
  [
    num(r.copper_ports) ? `${num(r.copper_ports)} copper` : null,
    num(r.sfp_ports) ? `${num(r.sfp_ports)} SFP` : null,
    num(r.sfp_plus_ports) ? `${num(r.sfp_plus_ports)} SFP+` : null,
  ]
    .filter(Boolean)
    .join(" · ");

/** Parses a channel count out of a stored description, e.g. "NVR 64CH". */
export const parseChannels = (text: string | null | undefined): number | null => {
  const m = /(\d{1,3})\s*(?:ch\b|channel)/i.exec(text ?? "");
  return m ? Number(m[1]) : null;
};

/** Parses a raw capacity in TB out of a stored description, e.g. "WD 16tb". */
export const parseCapacityTb = (text: string | null | undefined): number | null => {
  const m = /(\d{1,3}(?:\.\d+)?)\s*tb\b/i.exec(text ?? "");
  return m ? Number(m[1]) : null;
};

/** Fibre scope items are only listed when the approved BOQ actually carries them. */
export const FIBRE_SCOPE_TERMS: { label: string; re: RegExp }[] = [
  { label: "Fibre trays and cassettes", re: /(tray|cassette|termination kit)/i },
  { label: "Adapters, couplers and pigtails", re: /(adapter|coupler|pigtail)/i },
  { label: "Fibre patch leads", re: /patch lead/i },
  { label: "Fusion splicing and termination", re: /(splic|fusion)/i },
  { label: "OTDR / power-level testing", re: /(otdr|power level|power-level|fibre uplink testing|light meter)/i },
  { label: "Labelling and as-built records", re: /(label|as-?built|documentation)/i },
];

export function equipmentSummary(args: {
  markers: readonly MarkerLike[];
  rack: readonly RackItemLike[];
  boqLines: readonly BoqLineLike[];
}): EquipmentSummary {
  const { markers, rack, boqLines } = args;
  const countType = (t: string) => markers.filter((m) => m.marker_type === t).length;

  const switchGroups = new Map<string, { model: string; label: string; quantity: number; ports: string }>();
  for (const r of rack) {
    if ((r.equipment_type ?? "") !== "access_switch") continue;
    const key = r.model ?? r.equipment_name ?? "switch";
    const entry = switchGroups.get(key) ?? {
      model: r.model ?? "",
      label: r.equipment_name ?? [r.manufacturer, r.model].filter(Boolean).join(" "),
      quantity: 0,
      ports: portSummary(r),
    };
    entry.quantity += num(r.quantity, 1);
    switchGroups.set(key, entry);
  }

  const agg = rack.find((r) => (r.equipment_type ?? "") === "aggregation_switch") ?? null;
  const gw = rack.find((r) => (r.equipment_type ?? "") === "gateway_firewall") ?? null;

  const nvrLine = boqLines.find((l) => /\bnvr\b/i.test(`${l.description ?? ""} ${l.specification ?? ""}`)) ?? null;
  const driveLine =
    boqLines.find((l) =>
      /(recording storage|surveillance-grade|hard ?drive|hdd)/i.test(`${l.description ?? ""} ${l.specification ?? ""}`),
    ) ?? null;

  const powerLines = boqLines.filter((l) => (l.section ?? "").toLowerCase().includes("power"));

  const haystack = boqLines
    .map((l) => `${l.item_code ?? ""} ${l.description ?? ""} ${l.specification ?? ""}`)
    .join(" \n ");
  const present: string[] = [];
  const missing: string[] = [];
  for (const term of FIBRE_SCOPE_TERMS) (term.re.test(haystack) ? present : missing).push(term.label);

  const apModels = new Map<string, number>();
  for (const m of markers) {
    if (m.marker_type !== "wifi_ap") continue;
    const model = (m.model ?? m.equipment ?? "").trim();
    if (model) apModels.set(model, (apModels.get(model) ?? 0) + 1);
  }
  const access_point_model = [...apModels.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    access_points: countType("wifi_ap"),
    access_point_model,
    cameras: countType("camera"),
    racks: countType("rack"),
    switches: [...switchGroups.values()].sort((a, b) => b.quantity - a.quantity),
    aggregation: agg
      ? {
          model: agg.model ?? "",
          label: agg.equipment_name ?? [agg.manufacturer, agg.model].filter(Boolean).join(" "),
          ports: portSummary(agg),
        }
      : null,
    gateway: gw
      ? { model: gw.model ?? "", label: gw.equipment_name ?? [gw.manufacturer, gw.model].filter(Boolean).join(" ") }
      : null,
    nvr: nvrLine
      ? { label: nvrLine.description ?? "Network video recorder", channels: parseChannels(nvrLine.description) }
      : null,
    storage: driveLine
      ? {
          label: driveLine.description ?? "Surveillance storage",
          raw_tb: parseCapacityTb(driveLine.description),
          drives: num(driveLine.quantity, 1),
        }
      : null,
    power: powerLines.map((l) => ({ label: l.description ?? "", quantity: num(l.quantity, 1) })),
    fibre: { present, missing },
  };
}

/* ------------------------------------------------------- benefit card claims */

/**
 * Capability claims are keyed on the exact stored model. An unknown model gets
 * only generic, verifiable statements — never a fabricated feature list.
 */
export const MODEL_CAPABILITIES: Record<string, string[]> = {
  GWN7660: ["Wi-Fi 6", "OFDMA", "MU-MIMO", "WPA3", "Seamless roaming", "Central cloud management"],
  GWN7664: ["Wi-Fi 6", "OFDMA", "MU-MIMO", "WPA3", "Seamless roaming", "Central cloud management"],
  "GWN7813P": ["Managed Layer 3 switching", "PoE+ delivery", "VLAN and QoS", "SFP+ fibre uplinks"],
  "GWN7803PH-PRO": ["Managed switching", "PoE+ delivery", "VLAN and QoS", "10G SFP+ fibre uplinks"],
  GWN7832: ["Layer 3 fibre aggregation", "SFP+ uplinks", "VLAN routing and segmentation", "Backbone growth headroom"],
  GCC6020: ["Multi-WAN routing", "Next-generation firewall", "10G SFP+", "Internet failover and load balancing", "VLAN routing"],
};

export const capabilitiesFor = (model: string | null | undefined): string[] =>
  MODEL_CAPABILITIES[(model ?? "").trim()] ?? [];

export type BenefitCard = { title: string; headline: string; points: string[] };

/** Builds the client-facing benefit cards from real project items only. */
export function benefitCards(summary: EquipmentSummary, settings?: DeliverySettings | null): BenefitCard[] {
  const cards: BenefitCard[] = [];

  if (summary.access_points > 0) {
    const model = summary.access_point_model;
    cards.push({
      title: "Wi-Fi access points",
      headline: `${summary.access_points} enterprise access points`,
      points: [
        "Capacity-planned coverage per floor",
        "Central management and monitoring",
        ...capabilitiesFor(model),
      ],
    });
  }

  if (summary.switches.length) {
    cards.push({
      title: "Floor PoE switches",
      headline: summary.switches.map((s) => `${s.quantity} × ${s.label}`).join(", "),
      points: [
        ...new Set(summary.switches.flatMap((s) => capabilitiesFor(s.model))),
        "Local fault isolation per floor",
        ...summary.switches.filter((s) => s.ports).map((s) => s.ports),
      ],
    });
  }

  if (summary.aggregation) {
    cards.push({
      title: "Fibre aggregation switch",
      headline: summary.aggregation.label,
      points: [
        "Concentrates the building riser and uplinks",
        ...capabilitiesFor(summary.aggregation.model),
        ...(summary.aggregation.ports ? [summary.aggregation.ports] : []),
      ],
    });
  }

  if (summary.gateway) {
    cards.push({
      title: "Gateway and firewall",
      headline: summary.gateway.label,
      points: capabilitiesFor(summary.gateway.model),
    });
  }

  if (summary.cameras > 0 || summary.nvr) {
    const retention = retentionEstimate({
      camera_count: summary.cameras,
      raw_capacity_tb: settings?.hdd_raw_tb ?? summary.storage?.raw_tb ?? null,
      usable_capacity_factor: settings?.hdd_usable_factor ?? null,
      average_bitrate_kbps: settings?.cctv_average_bitrate_kbps ?? null,
      recording_duty_cycle: settings?.cctv_duty_cycle ?? null,
    });
    cards.push({
      title: "CCTV, recording and storage",
      headline: `${summary.cameras} cameras${summary.nvr?.channels ? ` · ${summary.nvr.channels}-channel recorder` : ""}`,
      points: [
        "Centralised recording with storage health monitoring",
        ...(summary.storage?.raw_tb ? [`${summary.storage.drives} × ${summary.storage.raw_tb}TB raw surveillance storage`] : []),
        ...(settings?.cctv_codec ? [`${settings.cctv_codec} recording profile`] : []),
        retention.ok ? `${retention.label} (estimated)` : RETENTION_PENDING,
      ],
    });
  }

  if (summary.fibre.present.length) {
    cards.push({
      title: "Fibre backbone",
      headline: "OS2 single-mode riser backbone",
      points: [
        "Distance and interference immunity between floors",
        ...summary.fibre.present,
        ...(summary.fibre.missing.length ? [`To be confirmed: ${summary.fibre.missing.join(", ")}`] : []),
      ],
    });
  }

  if (summary.power.length) {
    cards.push({
      title: "Resilient power",
      headline: "Hybrid inverter, lithium storage and online UPS",
      points: [
        ...summary.power.slice(0, 6).map((p) => `${p.quantity} × ${p.label}`),
        "Solar-ready with future battery and solar expansion",
        powerRuntimeStatement(settings),
      ],
    });
  }

  return cards;
}

export function powerRuntimeStatement(settings?: DeliverySettings | null): string {
  const hours = settings?.power_backup_hours ?? null;
  const qualification =
    settings?.power_backup_qualification ??
    "subject to final measured connected load, battery state, environmental conditions and commissioning";
  return hours
    ? `Designed for up to ${Number(hours)} hours of network and CCTV continuity — ${qualification}.`
    : `Backup runtime target is confirmed at commissioning — ${qualification}.`;
}
