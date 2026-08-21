import React from "react";
import { Server, Network, HardDrive, Wifi, Radio, type LucideIcon } from "lucide-react";
import { formatQty, type BoqItem } from "@/lib/boq";
import apGwn7660e from "@/assets/shopify/miro/grandstream-enterprise-wifi-6-indoor-access-point-gwn7660e-6.jpg";
import cat6Drum from "@/assets/shopify/cattex/cattex-cat6-500m-drum.png";
import hikCamera from "@/assets/shopify/hikvision/DS-2CD3346G2H-LISU_SL.png";
import grandstreamBrand from "/brands/grandstream-partner.png";

export type CatalogueStatus = "confirmed" | "proposed" | "provisional" | "hold";

const STATUS_LABEL: Record<CatalogueStatus, string> = {
  confirmed: "Confirmed",
  proposed: "Proposed",
  provisional: "Provisional / excluded",
  hold: "Design hold — TBC",
};

const statusClass = (status: CatalogueStatus) =>
  status === "confirmed"
    ? "border-foreground text-foreground"
    : status === "proposed"
      ? "border-border text-foreground"
      : "border-dashed border-border text-muted-foreground";

type Visual =
  | { kind: "photo"; src: string; alt: string; caption?: string }
  | { kind: "brand"; src: string; alt: string; model: string }
  | { kind: "icon"; icon: LucideIcon; model: string };

type Card = {
  key: string;
  brand: string;
  model: string;
  role: string;
  qty: string;
  status: CatalogueStatus;
  specs: string[];
  code: string;
  visual: Visual;
};

const Media: React.FC<{ visual: Visual }> = ({ visual }) => {
  if (visual.kind === "photo") {
    return (
      <figure className="m-0">
        <div className="flex h-40 items-center justify-center border-b border-border bg-muted/30 p-4">
          <img
            src={visual.src}
            alt={visual.alt}
            loading="lazy"
            className="h-full w-auto object-contain grayscale"
          />
        </div>
        {visual.caption && (
          <figcaption className="border-b border-border bg-muted/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {visual.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  if (visual.kind === "brand") {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 border-b border-border bg-muted/30 p-4">
        <img src={visual.src} alt={visual.alt} loading="lazy" className="h-8 w-auto object-contain grayscale" />
        <p className="font-display text-xl font-light tracking-tight">{visual.model}</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Model reference — no photo on file</p>
      </div>
    );
  }
  const Icon = visual.icon;
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 border-b border-border bg-muted/30 p-4">
      <Icon className="h-10 w-10 text-muted-foreground" strokeWidth={1} />
      <p className="font-display text-lg font-light tracking-tight text-center">{visual.model}</p>
    </div>
  );
};

/**
 * Client-facing equipment catalogue derived from the live BOQ lines and the
 * current floor-plan design snapshot. Quantities always mirror the BOQ.
 */
const BoqCatalogue: React.FC<{
  items: BoqItem[];
  snapshot: { aps: number; cameras: number; racks: number; routes: number; floors: number } | null;
  onOpenLine: (code: string) => void;
}> = ({ items, snapshot, onOpenLine }) => {
  const byCode = (code: string) => items.find((i) => i.item_code === code) ?? null;
  const qty = (code: string, fallback = 0) => {
    const it = byCode(code);
    return it ? Number(it.quantity) : fallback;
  };
  const num = (value: number) => formatQty(value);

  const rooftopAps = qty("WIFI-002", 0);
  const cameras = qty("CCTV-001", snapshot?.cameras ?? 0);
  const racks = qty("RACK-001", snapshot?.racks ?? 0);
  const points = qty("CAB-006", 0);

  const cards: Card[] = [
    {
      key: "gwn7813p",
      brand: "Grandstream",
      model: "GWN7813P",
      role: "Access switch — one in each rack, Levels 0–10",
      qty: `${num(qty("NET-001", racks))} units`,
      status: "confirmed",
      code: "NET-001",
      specs: [
        "24-port Layer 3 managed PoE switch",
        "1U rack mount with SFP+ uplinks",
        "Feeds all Wi-Fi and CCTV points on its level",
      ],
      visual: { kind: "brand", src: grandstreamBrand, alt: "Grandstream authorised partner", model: "GWN7813P" },
    },
    {
      key: "gwn7832",
      brand: "Grandstream",
      model: "GWN7832",
      role: "Level 0 fibre aggregation core",
      qty: `${num(qty("NET-002", 1))} unit`,
      status: "confirmed",
      code: "NET-002",
      specs: [
        "12 x 10G SFP+ Layer 3 aggregation switch",
        "10 planned riser uplinks from Levels 1–10",
        "2 spare SFP+ ports for future growth",
      ],
      visual: { kind: "brand", src: grandstreamBrand, alt: "Grandstream authorised partner", model: "GWN7832" },
    },
    {
      key: "wifi-indoor",
      brand: "Grandstream",
      model: "Enterprise Wi-Fi 6 indoor access point",
      role: "In-unit and common-area Wi-Fi coverage, Levels 1–10",
      qty: `${num(qty("WIFI-001", 100))} units (approved base)`,
      status: "proposed",
      code: "WIFI-001",
      specs: [
        "Wi-Fi 6 dual-band, PoE powered, cloud managed",
        "GWN7660E / GWN7664E final mix after RF validation",
        "Approved base quantity held at 100 access points",
      ],
      visual: {
        kind: "photo",
        src: apGwn7660e,
        alt: "Grandstream GWN7660E enterprise Wi-Fi 6 indoor access point",
        caption: "GWN7660E shown — final GWN7660E / GWN7664E mix TBC",
      },
    },
    {
      key: "wifi-roof",
      brand: "Weather-rated outdoor AP",
      model: "Model TBC",
      role: "Rooftop / service-level coverage",
      qty: `${num(rooftopAps)} unit${rooftopAps === 1 ? "" : "s"} (Level 11)`,
      status: "provisional",
      code: "WIFI-002",
      specs: [
        "Excluded provisional variance to the approved 100 access points",
        "Weather-rated outdoor model to be confirmed",
        "Feed from the Level 10 rack pending riser confirmation",
      ],
      visual: { kind: "icon", icon: Radio, model: "Rooftop outdoor AP — model TBC" },
    },
    {
      key: "cctv",
      brand: "Hikvision",
      model: "4MP PoE IP camera family",
      role: "Building-wide IP surveillance coverage",
      qty: `${num(cameras)} cameras`,
      status: "proposed",
      code: "CCTV-001",
      specs: [
        "4MP IP, PoE powered, IR night view",
        "Quantity tracked live from placed camera positions",
        "Final dome / bullet / PTZ and lens mix by field-of-view survey",
      ],
      visual: {
        kind: "photo",
        src: hikCamera,
        alt: "Hikvision 4MP PoE IP camera",
        caption: "Representative camera family — final model mix TBC",
      },
    },
    {
      key: "rack",
      brand: "Wall-mount network rack",
      model: "6U lockable enclosure",
      role: "Level distribution point, Levels 0–10",
      qty: `${num(racks)} racks`,
      status: "confirmed",
      code: "RACK-001",
      specs: [
        "6U lockable wall rack with vented door",
        "PDU, ventilation, earthing and accessory set per rack",
        "Houses the access switch, patch panel, fibre LIU and management",
      ],
      visual: { kind: "icon", icon: Server, model: "6U wall-mount rack" },
    },
    {
      key: "fibre",
      brand: "Riser backbone",
      model: "40-core OS2 single-mode fibre",
      role: "Levels 1–10 access racks to the Level 0 aggregation core",
      qty: `${num(qty("FIB-001", 500))} m — 10 uplinks`,
      status: "proposed",
      code: "FIB-001",
      specs: [
        "40-core OS2 single-mode riser fibre",
        "10GBASE-LR SFP+ optics, fusion spliced and LIU terminated",
        "OTDR and optical-loss tested per uplink",
      ],
      visual: { kind: "icon", icon: Network, model: "40-core OS2 backbone" },
    },
    {
      key: "cat6",
      brand: "Cattex",
      model: "Cat6 U/UTP structured cabling",
      role: "Horizontal home-runs to every access point and camera",
      qty: `${num(qty("CAB-001", 15))} x 500 m drums · ${num(points)} device points`,
      status: "proposed",
      code: "CAB-001",
      specs: [
        "Solid-copper Cat6 U/UTP on 500 m drums",
        "Permanent-link certified at both ends",
        "Patch panels, keystones and patch leads per rack",
      ],
      visual: {
        kind: "photo",
        src: cat6Drum,
        alt: "Cattex Cat6 500 m cable drum",
        caption: "Representative 500 m Cat6 drum",
      },
    },
    {
      key: "nvr",
      brand: "Recording platform & storage",
      model: "Channel count and storage TBC",
      role: "Ground-floor CCTV recording head-end",
      qty: `Minimum capacity above ${num(cameras)} channels`,
      status: "hold",
      code: "CCTV-004",
      specs: [
        `A single 64-channel recorder is insufficient for ${num(cameras)} cameras`,
        "Multi-recorder or higher-channel architecture required",
        "Surveillance-grade storage sized after retention calculation",
      ],
      visual: { kind: "icon", icon: HardDrive, model: "NVR & storage — design hold" },
    },
  ];

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0 print:grid-cols-2 print:gap-4">
      {cards.map((card) => (
        <li key={card.key} className="border border-border bg-background print:break-inside-avoid">
          <Media visual={card.visual} />
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{card.brand}</p>
                <h4 className="mt-1 font-display text-lg font-light tracking-tight">{card.model}</h4>
              </div>
              <span
                className={`inline-flex shrink-0 items-center border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${statusClass(card.status)}`}
              >
                {STATUS_LABEL[card.status]}
              </span>
            </div>

            <p className="mt-3 text-sm">{card.qty}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.role}</p>

            <ul className="mt-4 space-y-1.5">
              {card.specs.map((spec) => (
                <li key={spec} className="flex gap-2 text-xs text-muted-foreground">
                  <Wifi className="mt-0.5 h-3 w-3 shrink-0 opacity-40" strokeWidth={1.5} aria-hidden="true" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => onOpenLine(card.code)}
              className="mt-4 text-xs underline underline-offset-4 hover:no-underline print:hidden"
            >
              View BOQ line {card.code}
            </button>
            <p className="mt-4 hidden text-xs text-muted-foreground print:block">BOQ line {card.code}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default BoqCatalogue;
