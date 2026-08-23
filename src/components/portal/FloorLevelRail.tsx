import React, { useEffect, useMemo, useRef, useState } from "react";
import { DOCUMENTS_BUCKET, signedUrl } from "@/lib/portalFiles";
import {
  buildFloorLevels,
  railHeading,
  type FloorLike,
  type RailLevel,
} from "@/lib/floorLevels";

/**
 * Reusable level rail shared by the admin plan workspace, the signed-in client
 * floor-plan view and the read-only client project deck.
 *
 * It only ever selects a level — it never renders an editing control, so the
 * client surfaces can reuse it verbatim.
 */

type Counts = Record<string, number>;

const Thumb: React.FC<{ path?: string | null; presigned?: string | null; alt: string }> = ({
  path,
  presigned,
  alt,
}) => {
  const [url, setUrl] = useState<string | null>(presigned ?? null);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  // Lazy: only sign a thumbnail once it is close to the viewport.
  useEffect(() => {
    if (presigned || !ref.current || near) return;
    const el = ref.current;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setNear(true)),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [presigned, near]);

  useEffect(() => {
    if (presigned) {
      setUrl(presigned);
      return;
    }
    if (!near || !path) return;
    let cancelled = false;
    signedUrl(DOCUMENTS_BUCKET, path, 900)
      .then((u) => !cancelled && setUrl(u))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [near, path, presigned]);

  return (
    <div
      ref={ref}
      className="aspect-[4/3] w-full overflow-hidden border border-border bg-white dark:bg-neutral-100"
    >
      {url && !failed ? (
        <img src={url} alt={alt} loading="lazy" className="h-full w-full object-contain" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          {path ? "Plan" : "No plan"}
        </div>
      )}
    </div>
  );
};

function RailButton<T extends FloorLike>({
  level,
  active,
  count,
  presigned,
  onSelect,
}: {
  level: RailLevel<T>;
  active: boolean;
  count: number;
  presigned?: string | null;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      aria-label={`${level.longLabel}, ${count} device${count === 1 ? "" : "s"}`}
      className={[
        "flex min-h-[44px] w-full min-w-[132px] flex-col gap-1 border p-2 text-left transition-colors",
        active
          ? "border-2 border-foreground bg-muted"
          : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      ].join(" ")}
    >
      <Thumb path={level.floor.plan_image_path} presigned={presigned} alt={`${level.longLabel} plan`} />
      <span className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">{level.shortLabel}</span>
        {active && (
          <span className="border border-foreground px-1 text-[9px] uppercase tracking-[0.16em] text-foreground">
            Active
          </span>
        )}
      </span>
      <span className="truncate text-[10px] text-muted-foreground">{level.floor.display_name}</span>
      <span className="text-[10px] tabular-nums text-muted-foreground">{count} devices</span>
    </button>
  );
}

const FloorLevelRail = <T extends FloorLike>({
  floors,
  selectedId,
  onSelect,
  deviceCounts,
  presignedFor,
  className,
}: {
  floors: readonly T[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** Active device count per floor id. */
  deviceCounts?: Counts;
  /** Guest share pages already hold a signed plan URL. */
  presignedFor?: (floor: T) => string | null | undefined;
  className?: string;
}) => {
  const levels = useMemo(() => buildFloorLevels(floors), [floors]);
  const count = (id: string) => deviceCounts?.[id] ?? 0;

  // Roving keyboard navigation across the whole rail order.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const order = levels.all.map((l) => l.floor.id);
    const i = order.indexOf(selectedId);
    if (i < 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      onSelect(order[Math.min(order.length - 1, i + 1)]);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      onSelect(order[Math.max(0, i - 1)]);
    } else if (e.key === "Home") {
      e.preventDefault();
      onSelect(order[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      onSelect(order[order.length - 1]);
    }
  };

  if (levels.all.length === 0) return null;

  return (
    <nav
      aria-label="Building levels"
      onKeyDown={onKeyDown}
      className={["border border-border p-2 lg:sticky lg:top-4", className ?? ""].join(" ")}
    >
      <p className="px-1 pb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {railHeading(levels.floorCount)}
      </p>

      {/* Mobile / tablet: horizontal thumbnail carousel. Desktop: vertical rail. */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:max-h-[70vh] lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
        {levels.floors.map((l) => (
          <RailButton
            key={l.floor.id}
            level={l}
            active={l.floor.id === selectedId}
            count={count(l.floor.id)}
            presigned={presignedFor?.(l.floor) ?? null}
            onSelect={() => onSelect(l.floor.id)}
          />
        ))}
      </div>

      {levels.rooftop.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="px-1 pb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Rooftop / service plan
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible">
            {levels.rooftop.map((l) => (
              <RailButton
                key={l.floor.id}
                level={l}
                active={l.floor.id === selectedId}
                count={count(l.floor.id)}
                presigned={presignedFor?.(l.floor) ?? null}
                onSelect={() => onSelect(l.floor.id)}
              />
            ))}
          </div>
          <p className="mt-2 px-1 text-[10px] text-muted-foreground">Not counted as a floor.</p>
        </div>
      )}
    </nav>
  );
};

export default FloorLevelRail;
