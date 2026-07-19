import type { ShopifyProduct } from "@/lib/shopify";

export const SHOP_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "computers", label: "Computers" },
  { id: "displays", label: "Displays" },
  { id: "networking-cables", label: "Networking Cables" },
  { id: "wifi", label: "Wi-Fi Devices" },
  { id: "switching", label: "Switching" },
  { id: "routers", label: "Routers" },
  { id: "firewalls", label: "Firewalls" },
  { id: "surveillance", label: "Surveillance" },
  { id: "storage", label: "Storage" },
  { id: "voip", label: "VoIP & Intercom" },
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

  if (/(nas|synology|diskstation|rackstation|storage|hdd|ssd|nvme|flash drive|microsd|memory card|sd card|external hard|usb (2|3)\.\d)/.test(hay)) return "storage";
  if (/(voip|sip|dect|intercom|fanvil|ip phone|video intercom)/.test(hay)) return "voip";
  if (/(interactive display|smart whiteboard|smartboard|whiteboard|monitor|smart tv|led monitor|\bdisplay\b)/.test(hay)) return "displays";
  if (/(notebook|laptop|desktop pc|mini pc|mini desktop|vivobook|tuf gaming|asus pro|workstation)/.test(hay)) return "computers";
  if (/(cctv|camera|surveillance|hikvision|nvr|dvr|bullet|dome)/.test(hay)) return "surveillance";
  if (/(switch|switching|poe switch|managed switch|hpe.*switch|aruba.*switch)/.test(hay)) return "switching";
  if (/(access point|wi[- ]?fi|wifi|mesh|deco|grandstream|gwn|ap\b|omada)/.test(hay)) return "wifi";
  if (/(firewall|fortigate|fortinet|sophos|xgs|palo alto|checkpoint)/.test(hay)) return "firewalls";
  if (/(router|gateway|teltonika|mikrotik|edgerouter|reyee|ptp|wireless bridge|dream machine|udm)/.test(hay)) return "routers";
  if (/(cable|cat6|cat6a|cat5|flylead|patch|fibre|fiber|drum|utp|ftp)/.test(hay)) return "networking-cables";
  return "other";
}