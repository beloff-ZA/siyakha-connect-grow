/**
 * Pure model for the QS planning workspace command bar and context strip.
 *
 * Every control here maps onto an existing capability of the plan editor
 * (placement mode, drag, aim, coverage, the single device inspector, the
 * recoverable archive action) — nothing decorative, and nothing that can claim
 * a state the database has not confirmed.
 */

export type PlaceTool = "camera" | "wifi_ap" | "rack" | "switch" | "cable_route";

export const PLACE_TOOLS: { value: PlaceTool; label: string }[] = [
  { value: "camera", label: "Camera" },
  { value: "wifi_ap", label: "Wi-Fi AP" },
  { value: "rack", label: "Rack" },
  { value: "switch", label: "Switch" },
  { value: "cable_route", label: "Cable route" },
];

export type EditTool = "select" | "move" | "aim" | "coverage" | "properties" | "archive";

export const EDIT_TOOLS: { value: EditTool; label: string }[] = [
  { value: "select", label: "Select" },
  { value: "move", label: "Move" },
  { value: "aim", label: "Aim" },
  { value: "coverage", label: "Coverage" },
  { value: "properties", label: "Properties" },
  { value: "archive", label: "Archive" },
];

export type SelectedLike = { id: string; marker_type: string; label?: string } | null | undefined;

/** Only enable a tool when the selection genuinely supports it. */
export function editToolEnabled(tool: EditTool, selected: SelectedLike): boolean {
  if (tool === "select") return true;
  if (!selected) return false;
  if (tool === "aim") return selected.marker_type === "camera";
  if (tool === "coverage") return !["rack", "cable_route", "note_marker"].includes(selected.marker_type);
  return true;
}

/** Compact context-strip actions for the selected device. */
export function contextActions(markerType?: string | null): string[] {
  if (!markerType) return [];
  if (markerType === "camera") return ["move", "aim", "fov", "coverage", "edit"];
  if (markerType === "wifi_ap") return ["move", "coverage", "edit"];
  if (markerType === "rack") return ["rack_build"];
  return ["move", "properties", "archive"];
}

/* --------------------------------------------------------- BOQ truthfulness */

export type BoqStatus = {
  linked: boolean;
  label: string;
  hint: string;
};

/**
 * Reflects reality only: a bill is never created or linked as a side effect of
 * rendering the workspace.
 */
export function boqStatus(designBoqId?: string | null): BoqStatus {
  const linked = !!(designBoqId ?? "").trim();
  return linked
    ? {
        linked: true,
        label: "BOQ auto-sync on",
        hint: "Placing or archiving a catalogue device updates the linked draft bill in the same transaction. Moving or aiming a device does not change quantities.",
      }
    : {
        linked: false,
        label: "BOQ not linked",
        hint: "No bill is linked to this design yet. Open BOQ & costing to choose a draft revision — nothing is created automatically.",
      };
}

/* ------------------------------------------------------------- save state */

export type SaveState = "idle" | "saving" | "error";

export function saveStateLabel(state: SaveState): string {
  if (state === "saving") return "Saving…";
  if (state === "error") return "Not saved — last change failed";
  return "All changes saved";
}

/* ----------------------------------------------------------------- copy */

export const TEMP_LINK_COPY =
  "A temporary link shares the plans, report and customer bill read-only, with an expiry date and instant revocation. Supplier cost, markup, margin and internal notes are never included.";

/* ------------------------------------------------ Placement tool behaviour */

export type PlaceToolAction = "place_marker" | "edit_routes";

/**
 * "Cable route" is not a device: it must open route editing instead of entering
 * marker placement, and it never writes anything when clicked.
 */
export function placeToolAction(tool: PlaceTool): PlaceToolAction {
  return tool === "cable_route" ? "edit_routes" : "place_marker";
}
