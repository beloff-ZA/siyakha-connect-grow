import React, { useEffect, useMemo, useState } from "react";
import { DOCUMENTS_BUCKET, signedUrl } from "@/lib/portalFiles";
import { markerShort } from "@/lib/lifecycle";
import { kindLabel, type FloorMarker, type PortalFloor } from "@/lib/floorPlans";
import { selectedCoverageMode, coverageHelpText } from "@/lib/planGeometry";
import FloorPlanCanvas from "@/components/portal/FloorPlanCanvas";
import { RackContents } from "@/components/portal/RackEquipment";
import type { RackEquipment } from "@/lib/rackEquipment";
import type { PackFloor, PackMarker, PackRackItem, PackCable } from "@/lib/projectPack";

/** Rack equipment installed in one rack marker. */
export function rackItemsFor(
  equipment: (PackRackItem | RackEquipment)[] | undefined,
  rackMarkerId: string,
): RackEquipment[] {
  return ((equipment ?? []) as RackEquipment[]).filter(
    (e) => (e as { rack_marker_id?: string | null }).rack_marker_id === rackMarkerId,
  );
}

/**
 * Renders a saved plan background with normalised marker coordinates on top,
 * so pack pages never depend on manual screenshots.
 *
 * Default rendering is the static print/report sheet. Pass `interactive` for a
 * read-only client view where selecting a device highlights it (and selecting a
 * rack reveals that rack's 6U build) — nothing is ever editable here.
 */
const PlanSheet: React.FC<{
  floor: PackFloor;
  compact?: boolean;
  interactive?: boolean;
  rackEquipment?: (PackRackItem | RackEquipment)[];
  cables?: PackCable[];
}> = ({ floor, compact, interactive, rackEquipment, cables }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Guest share pages receive a pre-signed URL from the resolver, so no auth is needed.
  const presigned = (floor as PackFloor & { plan_image_url?: string | null }).plan_image_url ?? null;

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setFailed(false);
    if (presigned) {
      setUrl(presigned);
      return;
    }
    if (!floor.plan_image_path) {
      setFailed(true);
      return;
    }
    signedUrl(DOCUMENTS_BUCKET, floor.plan_image_path, 3600)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [floor.plan_image_path, presigned]);

  const placed = useMemo(
    () => floor.markers.filter((m) => m.is_placed && m.x_norm !== null && m.y_norm !== null),
    [floor.markers],
  );
  const selected = useMemo(
    () => placed.find((m) => m.id === selectedId) ?? null,
    [placed, selectedId],
  );

  if (interactive) {
    return (
      <div>
        <FloorPlanCanvas
          imageUrl={url}
          markers={placed as unknown as FloorMarker[]}
          selectedId={selectedId}
          onSelect={(m) => setSelectedId(m?.id ?? null)}
          coverage={selectedCoverageMode(selected?.marker_type)}
          height="h-[55vh]"
          emptyLabel={
            failed ? "Plan background not available for this level." : "Loading plan…"
          }
        />
        {coverageHelpText(selected?.marker_type) && (
          <p className="mt-2 text-xs text-muted-foreground">{coverageHelpText(selected?.marker_type)}</p>
        )}

        {selected && selected.marker_type !== "rack" && (
          <div className="mt-4 border border-border p-4 text-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Selected device
            </p>
            <p className="mt-2 font-semibold">
              {selected.label} · {kindLabel(selected.marker_type as never)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {[selected.equipment, selected.model, selected.area].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        )}

        {selected?.marker_type === "rack" && (
          <RackContents
            rack={selected as unknown as FloorMarker}
            floor={floor as unknown as PortalFloor}
            items={rackItemsFor(rackEquipment, selected.id)}
            routes={((cables ?? []) as unknown as { floor_id: string; service_type: string }[]).filter(
              (c) => c.floor_id === floor.id,
            )}
            canManage={false}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="relative w-full border border-neutral-400 bg-white">
        {url ? (
          <img src={url} alt={`${floor.display_name} layout plan`} className="block w-full" loading="lazy" />
        ) : (
          <div className="flex h-[90mm] items-center justify-center text-[9pt] text-neutral-500">
            {failed ? "Plan background not available for this level." : "Loading plan…"}
          </div>
        )}
        {url &&
          placed.map((m: PackMarker) => (
            <span
              key={m.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(m.x_norm as number) * 100}%`, top: `${(m.y_norm as number) * 100}%` }}
            >
              <span className="flex items-center gap-[2px]">
                <span className="flex h-[9px] w-[9px] items-center justify-center border border-black bg-white" />
                <span className="whitespace-nowrap border border-neutral-400 bg-white/90 px-[2px] text-[4.5pt] leading-tight">
                  {markerShort(m.marker_type)} {m.label}
                </span>
              </span>
            </span>
          ))}
      </div>
      {!compact && (
        <p className="mt-1 text-[8pt] text-neutral-600">
          {floor.display_name} — {floor.markers.length} planned devices, {placed.length} mapped on this sheet.
        </p>
      )}
    </div>
  );
};

export default PlanSheet;
