/**
 * Siyakha Connect — planned device → asset lifecycle helpers.
 *
 * A plan marker is the planned device instance. `portal_assets` carries the
 * procured reality (serial, MAC, IP, supplier, warranty, install/test data).
 * Existing marker serial/MAC fields are left intact and are used as fallbacks.
 */

import { supabase } from "@/integrations/supabase/client";

const db = supabase as unknown as { from: (t: string) => any };

export type ProjectAsset = {
  id: string;
  project_id: string;
  marker_id: string | null;
  floor_id: string | null;
  lifecycle_status: string;
  asset_tag: string | null;
  serial_number: string | null;
  mac_address: string | null;
  ip_address: string | null;
  manufacturer: string | null;
  model: string | null;
  supplier: string | null;
  purchase_date: string | null;
  po_reference: string | null;
  warranty_expiry: string | null;
  area: string | null;
  rack_label: string | null;
  switch_label: string | null;
  switch_port: number | null;
  patch_panel: string | null;
  patch_panel_port: number | null;
  nvr_label: string | null;
  nvr_channel: number | null;
  installer: string | null;
  installed_on: string | null;
  test_result: string | null;
  tested_on: string | null;
  commissioned_on: string | null;
  evidence_path: string | null;
  document_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AssetPatch = Partial<Omit<ProjectAsset, "id" | "project_id" | "created_at" | "updated_at">>;

export async function loadAssets(projectId: string): Promise<ProjectAsset[]> {
  const { data, error } = await db.from("portal_assets").select("*").eq("project_id", projectId);
  if (error) throw error;
  return (data ?? []) as ProjectAsset[];
}

/** Creates or updates the asset record attached to one plan marker. */
export async function saveAssetForMarker(
  projectId: string,
  markerId: string,
  floorId: string | null,
  patch: AssetPatch,
): Promise<ProjectAsset> {
  const { data: existing } = await db.from("portal_assets").select("id").eq("marker_id", markerId).maybeSingle();
  if (existing?.id) {
    const { data, error } = await db.from("portal_assets").update(patch).eq("id", existing.id).select("*").maybeSingle();
    if (error) throw error;
    return data as ProjectAsset;
  }
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await db
    .from("portal_assets")
    .insert({ project_id: projectId, marker_id: markerId, floor_id: floorId, created_by: user?.user?.id ?? null, ...patch })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as ProjectAsset;
}

/* ------------------------------------------------------------------ CSV I/O */

/** Column order used for both export and import. `Device label` is the key. */
export const ASSET_CSV_COLUMNS = [
  "Device label",
  "Floor",
  "Device type",
  "Lifecycle status",
  "Asset tag",
  "Serial number",
  "MAC address",
  "IP address",
  "Manufacturer",
  "Model",
  "Supplier",
  "Purchase date",
  "PO reference",
  "Warranty expiry",
  "Area",
  "Rack",
  "Switch",
  "Switch port",
  "Patch panel",
  "Patch panel port",
  "NVR",
  "NVR channel",
  "Installer",
  "Installed on",
  "Test result",
  "Tested on",
  "Commissioned on",
  "Notes",
] as const;

const CSV_TO_FIELD: Record<string, keyof AssetPatch> = {
  "lifecycle status": "lifecycle_status",
  "asset tag": "asset_tag",
  "serial number": "serial_number",
  "mac address": "mac_address",
  "ip address": "ip_address",
  manufacturer: "manufacturer",
  model: "model",
  supplier: "supplier",
  "purchase date": "purchase_date",
  "po reference": "po_reference",
  "warranty expiry": "warranty_expiry",
  area: "area",
  rack: "rack_label",
  switch: "switch_label",
  "switch port": "switch_port",
  "patch panel": "patch_panel",
  "patch panel port": "patch_panel_port",
  nvr: "nvr_label",
  "nvr channel": "nvr_channel",
  installer: "installer",
  "installed on": "installed_on",
  "test result": "test_result",
  "tested on": "tested_on",
  "commissioned on": "commissioned_on",
  notes: "notes",
};

const NUMERIC_FIELDS: (keyof AssetPatch)[] = ["switch_port", "patch_panel_port", "nvr_channel"];
const DATE_FIELDS: (keyof AssetPatch)[] = ["purchase_date", "warranty_expiry", "installed_on", "tested_on", "commissioned_on"];
const VALID_STATUSES = ["planned", "ordered", "received", "installed", "tested", "commissioned", "replaced", "removed"];

/** Minimal RFC4180 parser — handles quoted fields and embedded commas. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else inQuotes = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export type ImportRow = { markerId: string; label: string; floorId: string | null; patch: AssetPatch };
export type ImportPlan = { rows: ImportRow[]; errors: string[] };

/**
 * Validates an asset CSV against the project's plan markers.
 * Bad rows are reported and skipped — good rows are never discarded because of
 * an unrelated failure, and nothing already stored is overwritten with blanks.
 */
export function planAssetImport(
  csv: string,
  markers: { id: string; label: string; floor_id: string | null }[],
  existing: ProjectAsset[],
): ImportPlan {
  const rows = parseCsv(csv);
  const errors: string[] = [];
  if (rows.length < 2) return { rows: [], errors: ["The file has no data rows."] };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const labelCol = header.findIndex((h) => h === "device label");
  if (labelCol < 0) return { rows: [], errors: ['A "Device label" column is required.'] };

  const byLabel = new Map<string, { id: string; floor_id: string | null }>();
  const ambiguous = new Set<string>();
  for (const m of markers) {
    const key = m.label.trim().toLowerCase();
    if (byLabel.has(key)) ambiguous.add(key);
    byLabel.set(key, { id: m.id, floor_id: m.floor_id });
  }

  const serials = new Map<string, string>();
  const macs = new Map<string, string>();
  for (const a of existing) {
    if (a.serial_number) serials.set(a.serial_number.trim().toLowerCase(), a.marker_id ?? a.id);
    if (a.mac_address) macs.set(a.mac_address.trim().toLowerCase(), a.marker_id ?? a.id);
  }

  const out: ImportRow[] = [];
  for (let r = 1; r < rows.length; r += 1) {
    const line = rows[r];
    const label = (line[labelCol] ?? "").trim();
    const at = `Row ${r + 1}`;
    if (!label) {
      errors.push(`${at}: missing device label — skipped.`);
      continue;
    }
    const key = label.toLowerCase();
    if (ambiguous.has(key)) {
      errors.push(`${at}: "${label}" matches more than one device in this project — skipped.`);
      continue;
    }
    const marker = byLabel.get(key);
    if (!marker) {
      errors.push(`${at}: no plan device named "${label}" in this project — skipped.`);
      continue;
    }

    const patch: AssetPatch = {};
    let rowInvalid = false;
    header.forEach((h, ci) => {
      const field = CSV_TO_FIELD[h];
      if (!field) return;
      const raw = (line[ci] ?? "").trim();
      if (raw === "") return;
      if (field === "lifecycle_status") {
        const v = raw.toLowerCase();
        if (!VALID_STATUSES.includes(v)) {
          errors.push(`${at}: unknown lifecycle status "${raw}" — skipped.`);
          rowInvalid = true;
          return;
        }
        patch.lifecycle_status = v;
        return;
      }
      if (NUMERIC_FIELDS.includes(field)) {
        const n = Number(raw);
        if (!Number.isFinite(n)) {
          errors.push(`${at}: "${h}" must be a number — skipped.`);
          rowInvalid = true;
          return;
        }
        (patch as any)[field] = Math.round(n);
        return;
      }
      if (DATE_FIELDS.includes(field)) {
        if (Number.isNaN(new Date(raw).getTime())) {
          errors.push(`${at}: "${h}" is not a valid date — skipped.`);
          rowInvalid = true;
          return;
        }
        (patch as any)[field] = new Date(raw).toISOString().slice(0, 10);
        return;
      }
      (patch as any)[field] = raw;
    });
    if (rowInvalid) continue;

    const serial = patch.serial_number?.trim().toLowerCase();
    if (serial) {
      const owner = serials.get(serial);
      if (owner && owner !== marker.id) {
        errors.push(`${at}: serial "${patch.serial_number}" is already used by another device — skipped.`);
        continue;
      }
      serials.set(serial, marker.id);
    }
    const mac = patch.mac_address?.trim().toLowerCase();
    if (mac) {
      const owner = macs.get(mac);
      if (owner && owner !== marker.id) {
        errors.push(`${at}: MAC "${patch.mac_address}" is already used by another device — skipped.`);
        continue;
      }
      macs.set(mac, marker.id);
    }

    if (Object.keys(patch).length === 0) {
      errors.push(`${at}: nothing to update — skipped.`);
      continue;
    }
    out.push({ markerId: marker.id, label, floorId: marker.floor_id, patch });
  }
  return { rows: out, errors };
}

/** Applies a validated import plan. Failures are reported per row. */
export async function applyAssetImport(projectId: string, plan: ImportPlan) {
  const failures: string[] = [];
  let applied = 0;
  for (const row of plan.rows) {
    try {
      await saveAssetForMarker(projectId, row.markerId, row.floorId, row.patch);
      applied += 1;
    } catch (e) {
      failures.push(`${row.label}: ${(e as any)?.message ?? String(e)}`);
    }
  }
  return { applied, failures };
}
