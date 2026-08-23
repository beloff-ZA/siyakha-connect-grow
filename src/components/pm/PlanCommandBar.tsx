import React from "react";
import {
  EDIT_TOOLS,
  PLACE_TOOLS,
  TEMP_LINK_COPY,
  boqStatus,
  contextActions,
  editToolEnabled,
  saveStateLabel,
  type EditTool,
  type PlaceTool,
  type SaveState,
} from "@/lib/planWorkspace";
import { bearingText } from "@/lib/planGeometry";
import { kindLabel, type FloorMarker } from "@/lib/floorPlans";
import {
  Camera,
  Cable,
  FileText,
  Link2,
  MousePointer2,
  Move,
  Compass,
  Radar,
  Server,
  Settings2,
  Archive,
  Wifi,
  Network,
} from "lucide-react";

const btn =
  "inline-flex min-h-[36px] items-center gap-1.5 border px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const off = "border-border text-muted-foreground hover:bg-muted hover:text-foreground";
const on = "border-foreground bg-foreground text-background";

const PLACE_ICONS: Record<PlaceTool, React.ElementType> = {
  camera: Camera,
  wifi_ap: Wifi,
  rack: Server,
  switch: Network,
  cable_route: Cable,
};

const EDIT_ICONS: Record<EditTool, React.ElementType> = {
  select: MousePointer2,
  move: Move,
  aim: Compass,
  coverage: Radar,
  properties: Settings2,
  archive: Archive,
};

const Group: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    <span className="mr-1 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
    {children}
  </div>
);

/**
 * Top command bar and selected-device context strip for the plan workspace.
 * Every button is wired to an existing editor capability by the parent — this
 * component holds no data logic of its own.
 */
const PlanCommandBar: React.FC<{
  placeTool: PlaceTool | null;
  onPlaceTool: (tool: PlaceTool) => void;
  editTool: EditTool;
  onEditTool: (tool: EditTool) => void;
  selected: FloorMarker | null;
  coverageOn: boolean;
  saveState: SaveState;
  designBoqId: string | null;
  onOpenBoq: () => void;
  onGenerateReport: () => void;
  onShareLink: () => void;
  onArchive: () => void;
  onOpenProperties: () => void;
  onOpenRackBuild: () => void;
  busy?: boolean;
}> = ({
  placeTool,
  onPlaceTool,
  editTool,
  onEditTool,
  selected,
  coverageOn,
  saveState,
  designBoqId,
  onOpenBoq,
  onGenerateReport,
  onShareLink,
  onArchive,
  onOpenProperties,
  onOpenRackBuild,
  busy,
}) => {
  const boq = boqStatus(designBoqId);
  const actions = contextActions(selected?.marker_type);

  return (
    <div className="border border-border">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-3">
        <Group label="Place">
          {PLACE_TOOLS.map((t) => {
            const Icon = PLACE_ICONS[t.value];
            const active = placeTool === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={active}
                onClick={() => onPlaceTool(t.value)}
                className={`${btn} ${active ? on : off}`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} /> {t.label}
              </button>
            );
          })}
        </Group>

        <Group label="Edit">
          {EDIT_TOOLS.map((t) => {
            const Icon = EDIT_ICONS[t.value];
            const enabled = editToolEnabled(t.value, selected);
            const active =
              t.value === "coverage" ? coverageOn && enabled : editTool === t.value && enabled;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={active}
                disabled={!enabled || busy}
                onClick={() => onEditTool(t.value)}
                className={`${btn} ${active ? on : off}`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} /> {t.label}
              </button>
            );
          })}
        </Group>

        <Group label="Outputs">
          <button
            type="button"
            onClick={onOpenBoq}
            title={boq.hint}
            className={`${btn} ${boq.linked ? "border-foreground text-foreground" : off}`}
          >
            {boq.label}
          </button>
          <button type="button" onClick={onGenerateReport} className={`${btn} ${off}`}>
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} /> Generate report
          </button>
          <button type="button" onClick={onShareLink} className={`${btn} ${off}`} title={TEMP_LINK_COPY}>
            <Link2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Share temporary link
          </button>
        </Group>

        <span
          className={`ml-auto text-[10px] uppercase tracking-[0.18em] ${
            saveState === "error" ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {saveStateLabel(saveState)}
        </span>
      </div>

      <div className="border-t border-border bg-muted/40 px-3 py-2 text-[11px]">
        {!selected ? (
          <span className="text-muted-foreground">
            Select a device on the plan, or choose a device type above and click the plan to place it.
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{selected.label}</span>
            <span className="text-muted-foreground">{kindLabel(selected.marker_type)}</span>
            {actions.includes("move") && (
              <button type="button" onClick={() => onEditTool("move")} className={`${btn} ${off}`}>
                Move
              </button>
            )}
            {actions.includes("aim") && (
              <button type="button" onClick={() => onEditTool("aim")} className={`${btn} ${off}`}>
                Aim {bearingText(Number(selected.direction_deg ?? 0))}
              </button>
            )}
            {actions.includes("fov") && (
              <span className="text-muted-foreground">FOV {Number(selected.fov_deg ?? 90)}°</span>
            )}
            {actions.includes("coverage") && (
              <button type="button" onClick={() => onEditTool("coverage")} className={`${btn} ${off}`}>
                Coverage
              </button>
            )}
            {(actions.includes("edit") || actions.includes("properties")) && (
              <button type="button" onClick={onOpenProperties} className={`${btn} ${off}`}>
                Edit details
              </button>
            )}
            {actions.includes("rack_build") && (
              <button type="button" onClick={onOpenRackBuild} className={`${btn} ${off}`}>
                Open rack build
              </button>
            )}
            {actions.includes("archive") && (
              <button type="button" onClick={onArchive} disabled={busy} className={`${btn} ${off}`}>
                Archive
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCommandBar;
