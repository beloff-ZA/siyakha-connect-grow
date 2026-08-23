import React from "react";
import {
  RETENTION_PENDING,
  benefitCards,
  deliveryStages,
  equipmentSummary,
  powerRuntimeStatement,
  retentionEstimate,
  type DeliverySettings,
  type MarkerLike,
  type RackItemLike,
  type BoqLineLike,
} from "@/lib/deliverySummary";
import { floorCountLabel } from "@/lib/reporting";

/**
 * Client-facing delivery summary: benefit cards, storage retention estimate and
 * the post-acceptance programme. Every figure is read back from the live
 * project data or from admin-entered delivery settings — nothing is hard-coded
 * to one building and no capability is claimed for an absent model.
 */

const Card: React.FC<{ title: string; headline: string; points: string[] }> = ({ title, headline, points }) => (
  <article className="border border-border p-5">
    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
    <p className="mt-1 text-sm font-semibold">{headline}</p>
    <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
      {points.filter(Boolean).map((p) => (
        <li key={p}>· {p}</li>
      ))}
    </ul>
  </article>
);

export type DeckDeliveryProps = {
  settings?: DeliverySettings | null;
  markers: readonly MarkerLike[];
  rack: readonly RackItemLike[];
  boqLines: readonly BoqLineLike[];
  floors: readonly { floor_use?: string | null }[];
};

export const DeckBenefitCards: React.FC<DeckDeliveryProps> = ({ settings, markers, rack, boqLines }) => {
  const summary = equipmentSummary({ markers, rack, boqLines });
  const cards = benefitCards(summary, settings ?? null);
  if (!cards.length) return null;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.title} {...c} />
      ))}
    </div>
  );
};

export const DeckProjectSummary: React.FC<DeckDeliveryProps> = ({ settings, markers, rack, boqLines, floors }) => {
  const s = equipmentSummary({ markers, rack, boqLines });
  const switchTotal = s.switches.reduce((n, x) => n + x.quantity, 0);
  const team = settings?.team_size ?? null;
  const weeks = settings?.duration_weeks ?? null;

  const sentences = [
    `Integrated structured cabling, OS2 fibre backbone, Wi-Fi, CCTV, switching, storage, configuration and resilient power across ${floorCountLabel(floors)}.`,
    s.access_points || s.cameras || s.racks
      ? `The current design carries ${s.access_points} Wi-Fi access points, ${s.cameras} CCTV cameras and ${s.racks} network racks.`
      : null,
    switchTotal
      ? `${switchTotal} managed PoE floor switches distribute connectivity and power to the access points and cameras.`
      : null,
    s.aggregation
      ? `The ${s.aggregation.label} consolidates the building riser and uplinks${s.aggregation.ports ? ` (${s.aggregation.ports})` : ""}, with VLAN separation and headroom for growth.`
      : null,
    s.gateway ? `${s.gateway.label} provides gateway, routing, firewall and internet failover for the building.` : null,
    s.nvr
      ? `Recording is centralised on the ${s.nvr.label}${s.nvr.channels ? ` (${s.nvr.channels} channels)` : ""}${
          s.storage?.raw_tb ? ` with ${s.storage.drives} × ${s.storage.raw_tb}TB raw surveillance storage` : ""
        }, with health monitoring and secure evidence retention.`
      : null,
    s.fibre.present.length
      ? `Fibre scope in the approved schedule includes ${s.fibre.present.join(", ").toLowerCase()}.${
          s.fibre.missing.length ? ` Still to be confirmed: ${s.fibre.missing.join(", ").toLowerCase()}.` : ""
        }`
      : null,
    s.power.length ? `${powerRuntimeStatement(settings)} The solution is solar-ready and supports future battery and solar expansion.` : null,
    `A network engineer configures the gateway and routers, switching and aggregation, SSIDs and access-point management, the CCTV network and NVR, VLANs, failover, security policies, addressing, monitoring and testing.`,
    `Labour covers containment and cable pulling, fibre splicing, rack building, mounting access points, cameras and other devices, termination, labelling, testing, configuration support, cleanup and handover${
      team && weeks ? ` by a ${team}-engineer team over ${weeks} planned weeks` : ""
    }.`,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      {settings?.executive_summary && <p className="whitespace-pre-line text-foreground">{settings.executive_summary}</p>}
      {sentences.map((t) => (
        <p key={t}>{t}</p>
      ))}
      {settings?.delivery_objectives && <p className="whitespace-pre-line">{settings.delivery_objectives}</p>}
      {settings?.temp_cctv_enabled && (
        <p>
          A temporary onsite CCTV safety kit is installed after quote acceptance and before the main works, for safety
          and visibility during construction.
          {settings.temp_cctv_notes ? ` ${settings.temp_cctv_notes}` : ""}
        </p>
      )}
    </div>
  );
};

export const DeckRetentionPanel: React.FC<DeckDeliveryProps> = ({ settings, markers, rack, boqLines }) => {
  const s = equipmentSummary({ markers, rack, boqLines });
  if (!s.cameras && !s.storage) return null;
  const raw = settings?.hdd_raw_tb ?? s.storage?.raw_tb ?? null;
  const est = retentionEstimate({
    camera_count: s.cameras,
    raw_capacity_tb: raw,
    usable_capacity_factor: settings?.hdd_usable_factor ?? null,
    average_bitrate_kbps: settings?.cctv_average_bitrate_kbps ?? null,
    recording_duty_cycle: settings?.cctv_duty_cycle ?? null,
  });

  const rows: [string, string][] = [
    ["Cameras", String(s.cameras)],
    ["Codec", settings?.cctv_codec ?? "To be confirmed"],
    ["Average bitrate", settings?.cctv_average_bitrate_kbps ? `${settings.cctv_average_bitrate_kbps} kbps` : "To be confirmed"],
    ["Recording mode", settings?.cctv_recording_mode ?? "To be confirmed"],
    ["Duty cycle", settings?.cctv_duty_cycle ? `${Math.round(Number(settings.cctv_duty_cycle) * 100)}%` : "To be confirmed"],
    ["Raw capacity", raw ? `${raw} TB` : "To be confirmed"],
    ["Usable factor", settings?.hdd_usable_factor ? String(settings.hdd_usable_factor) : "To be confirmed"],
    ["Estimated retention", est.ok ? `${est.days} days (${est.hours} hours) — estimated` : RETENTION_PENDING],
  ];

  return (
    <div className="border border-border p-5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">CCTV storage and retention</p>
      <dl className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="text-muted-foreground">{k}</dt>
            <dd>{v}</dd>
          </React.Fragment>
        ))}
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        Retention is an estimate based on the assumptions shown and is not a guarantee.
      </p>
    </div>
  );
};

export const DeckNextStepsTimeline: React.FC<{ settings?: DeliverySettings | null }> = ({ settings }) => (
  <ol className="space-y-3">
    {deliveryStages(settings).map((stage, i) => (
      <li key={`${i}-${stage.title}`} className="flex gap-4 border border-border px-4 py-3">
        <span className="text-xs tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
        <span>
          <span className="block text-sm font-medium">{stage.title}</span>
          {stage.detail && <span className="mt-1 block text-xs text-muted-foreground">{stage.detail}</span>}
        </span>
      </li>
    ))}
  </ol>
);
