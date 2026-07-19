import type { ShopifyProduct } from "@/lib/shopify";

export const SHOP_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "networking-cables", label: "Networking Cables" },
  { id: "wifi", label: "Wi-Fi Devices" },
  { id: "switching", label: "Switching" },
  { id: "routers", label: "Routers" },
  { id: "surveillance", label: "Surveillance" },
  { id: "storage", label: "Storage" },
  { id: "other", label: "Other" },
] as const;

export type CategoryId = (typeof SHOP_CATEGORIES)[number]["id"];

export function categorise(p: ShopifyProduct): CategoryId {
  const hay = [
    p.node.title,
    p.node.productType ?? "",
    (p.node.tags ?? []).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  if (/(nas|synology|diskstation|rackstation|storage|hdd|ssd|nvme)/.test(hay)) return "storage";
  if (/(cctv|camera|surveillance|hikvision|nvr|dvr|bullet|dome)/.test(hay)) return "surveillance";
  if (/(switch|switching|poe switch|managed switch|hpe.*switch|aruba.*switch)/.test(hay)) return "switching";
  if (/(access point|wi[- ]?fi|wifi|mesh|deco|grandstream|gwn|ap\b|omada)/.test(hay)) return "wifi";
  if (/(router|gateway|teltonika|mikrotik|edgerouter|firewall)/.test(hay)) return "routers";
  if (/(cable|cat6|cat6a|cat5|flylead|patch|fibre|fiber|drum|utp|ftp)/.test(hay)) return "networking-cables";
  return "other";
}