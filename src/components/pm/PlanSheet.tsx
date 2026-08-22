import React, { useEffect, useState } from "react";
import { DOCUMENTS_BUCKET, signedUrl } from "@/lib/portalFiles";
import { markerShort } from "@/lib/lifecycle";
import type { PackFloor } from "@/lib/projectPack";

/**
 * Renders a saved plan background with normalised marker coordinates on top,
 * so pack pages never depend on manual screenshots.
 */
const PlanSheet: React.FC<{ floor: PackFloor; compact?: boolean }> = ({ floor, compact }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setFailed(false);
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
  }, [floor.plan_image_path]);

  const placed = floor.markers.filter((m) => m.is_placed && m.x_norm !== null && m.y_norm !== null);

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
          placed.map((m) => (
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
