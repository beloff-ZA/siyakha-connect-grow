import React, { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import {
  TYPICAL_PLAN_NOTE,
  floorUseLabel,
  levelCode,
  statusText,
  type FloorSummary,
} from "@/lib/buildingView";
import { FloorChips, type StackFilters } from "@/components/portal/BuildingStack";

const Card: React.FC<{
  s: FloorSummary;
  planUrl?: string;
  filters: StackFilters;
  onOpen: (floorId: string) => void;
  onSelect: (floorId: string) => void;
  selected: boolean;
}> = ({ s, planUrl, filters, onOpen, onSelect, selected }) => (
  <article
    className={[
      "border p-4 space-y-3 transition-colors",
      selected ? "border-foreground bg-muted/40" : "border-border",
    ].join(" ")}
  >
    <button
      type="button"
      onClick={() => onSelect(s.floor.id)}
      className="block w-full text-left"
      aria-label={`Select ${s.floor.display_name}`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden border border-border bg-muted/30">
        {planUrl ? (
          <img
            src={planUrl}
            alt={`${s.floor.display_name} plan thumbnail`}
            loading="lazy"
            className="h-full w-full object-cover grayscale"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Plan pending
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="text-sm">{s.floor.display_name}</p>
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
          {levelCode(s.level)}
        </span>
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {floorUseLabel(s.floor.floor_use)} · {statusText[s.status]}
      </p>
    </button>

    <FloorChips s={s} filters={filters} />

    {s.floor.floor_use === "accommodation" && (
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {TYPICAL_PLAN_NOTE}
      </p>
    )}

    <button
      type="button"
      onClick={() => onOpen(s.floor.id)}
      className="inline-flex items-center gap-2 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.18em] hover:bg-muted print:hidden"
    >
      <ExternalLink className="h-3 w-3" strokeWidth={1.5} /> View floor plan
    </button>
  </article>
);

/** "All floor plans" gallery with search/filter and a two-floor compare mode. */
const AllFloorPlans: React.FC<{
  occupied: FloorSummary[];
  rooftop: FloorSummary[];
  planUrls: Record<string, string>;
  filters: StackFilters;
  selectedId: string | null;
  onSelect: (floorId: string) => void;
  onOpen: (floorId: string) => void;
}> = ({ occupied, rooftop, planUrls, filters, selectedId, onSelect, onOpen }) => {
  const [query, setQuery] = useState("");
  const [use, setUse] = useState("all");
  const [compare, setCompare] = useState(false);
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const uses = useMemo(
    () => Array.from(new Set([...occupied, ...rooftop].map((s) => s.floor.floor_use))),
    [occupied, rooftop],
  );

  const match = (s: FloorSummary) => {
    const q = query.trim().toLowerCase();
    const hit =
      !q ||
      s.floor.display_name.toLowerCase().includes(q) ||
      floorUseLabel(s.floor.floor_use).toLowerCase().includes(q) ||
      levelCode(s.level).toLowerCase().includes(q) ||
      String(s.level) === q;
    return hit && (use === "all" || s.floor.floor_use === use);
  };

  const accommodation = useMemo(
    () => occupied.filter((s) => s.floor.floor_use === "accommodation"),
    [occupied],
  );
  const sa = accommodation.find((s) => s.floor.id === a) ?? null;
  const sb = accommodation.find((s) => s.floor.id === b) ?? null;

  const shownOccupied = occupied.filter(match);
  const shownRooftop = rooftop.filter(match);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search level or use"
            aria-label="Search floor plans"
            className="border border-border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={use}
          onChange={(e) => setUse(e.target.value)}
          aria-label="Filter by floor use"
          className="border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All uses</option>
          {uses.map((u) => (
            <option key={u} value={u}>
              {floorUseLabel(u)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setCompare((c) => !c)}
          aria-pressed={compare}
          className={[
            "border px-3 py-2 text-[10px] uppercase tracking-[0.18em]",
            compare ? "border-foreground bg-muted" : "border-border hover:bg-muted",
          ].join(" ")}
        >
          Compare two accommodation floors
        </button>
      </div>

      {compare && (
        <div className="border border-border p-5 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Floor A", a, setA] as const,
              ["Floor B", b, setB] as const,
            ].map(([label, value, set]) => (
              <label key={label} className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {label}
                </span>
                <select
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a level…</option>
                  {accommodation.map((s) => (
                    <option key={s.floor.id} value={s.floor.id}>
                      {s.floor.display_name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {sa && sb ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <th className="py-3 pr-4 text-left">Metric</th>
                    <th className="py-3 pr-4 text-left">{sa.floor.display_name}</th>
                    <th className="py-3 text-left">{sb.floor.display_name}</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["Wi-Fi access points", (s: FloorSummary) => s.aps],
                      ["CCTV cameras", (s: FloorSummary) => s.cameras],
                      ["Racks", (s: FloorSummary) => s.racks],
                      ["Cable routes", (s: FloorSummary) => s.routes],
                      [
                        "Access switch",
                        (s: FloorSummary) => s.switchModel ?? "—",
                      ],
                      [
                        "Routed ports",
                        (s: FloorSummary) =>
                          s.portCount ? `${s.portsUsed} / ${s.portCount}` : "—",
                      ],
                      ["Status", (s: FloorSummary) => statusText[s.status]],
                      ["Plan basis", () => "Typical accommodation architecture"],
                    ] as const
                  ).map(([label, fn]) => (
                    <tr key={label} className="border-b border-border last:border-b-0">
                      <td className="py-3 pr-4 text-muted-foreground">{label}</td>
                      <td className="py-3 pr-4">{fn(sa)}</td>
                      <td className="py-3">{fn(sb)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                Compare view is read-only. Shared plan imagery does not mean shared device data —
                each level keeps its own markers and routes.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Select two accommodation levels to compare their live counts side by side.
            </p>
          )}
        </div>
      )}

      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Occupied levels · {occupied.length}
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shownOccupied.map((s) => (
            <Card
              key={s.floor.id}
              s={s}
              planUrl={planUrls[s.floor.id]}
              filters={filters}
              onOpen={onOpen}
              onSelect={onSelect}
              selected={s.floor.id === selectedId}
            />
          ))}
        </div>
      </div>

      {shownRooftop.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Rooftop / service level · excluded from the occupied level count
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shownRooftop.map((s) => (
              <Card
                key={s.floor.id}
                s={s}
                planUrl={planUrls[s.floor.id]}
                filters={filters}
                onOpen={onOpen}
                onSelect={onSelect}
                selected={s.floor.id === selectedId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllFloorPlans;
