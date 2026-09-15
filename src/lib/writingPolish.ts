/**
 * Offline (no AI, no API calls) writing polish for engineer-written text such as
 * the fault solution / work done field. Pure string rules so it is instant,
 * free and testable.
 */

export type PolishResult = {
  /** Improved text. Equal to the input when nothing needed changing. */
  text: string;
  /** Plain-English list of what was tidied up. */
  changes: string[];
  /** Coaching hints — things worth adding. Never applied automatically. */
  suggestions: string[];
};

/** Words that should always carry their industry casing. */
const CASING: Record<string, string> = {
  ip: "IP",
  lan: "LAN",
  wan: "WAN",
  vlan: "VLAN",
  dns: "DNS",
  dhcp: "DHCP",
  nat: "NAT",
  vpn: "VPN",
  poe: "PoE",
  ups: "UPS",
  nvr: "NVR",
  dvr: "DVR",
  cctv: "CCTV",
  sfp: "SFP",
  ont: "ONT",
  isp: "ISP",
  ssid: "SSID",
  wifi: "Wi-Fi",
  "wi-fi": "Wi-Fi",
  utp: "UTP",
  poc: "PoC",
  sla: "SLA",
  coc: "CoC",
  mbps: "Mbps",
  gbps: "Gbps",
  qos: "QoS",
  vlans: "VLANs",
  aps: "APs",
  ap: "AP",
};

/** Shorthand → full word. */
const EXPANSIONS: Record<string, string> = {
  rtr: "router",
  fw: "firewall",
  sw: "switch",
  cfg: "configuration",
  config: "configuration",
  configed: "configured",
  asap: "as soon as possible",
  info: "information",
  temp: "temporary",
  pwr: "power",
  cust: "customer",
  eng: "engineer",
};

/** Informal wording → professional wording. */
const PHRASES: [RegExp, string, string][] = [
  [/\bsorted out\b/gi, "resolved", "“sorted out” → “resolved”"],
  [/\bsorted\b/gi, "resolved", "“sorted” → “resolved”"],
  [/\bno joy\b/gi, "without success", "“no joy” → “without success”"],
  [/\bswapped out\b/gi, "replaced", "“swapped out” → “replaced”"],
  [/\bswapped\b/gi, "replaced", "“swapped” → “replaced”"],
  [/\bplugged in\b/gi, "connected", "“plugged in” → “connected”"],
  [/\bhad a look at\b/gi, "inspected", "“had a look at” → “inspected”"],
  [/\blooked at\b/gi, "inspected", "“looked at” → “inspected”"],
  [/\bcheck(ed)? that\b/gi, "verified that", "“checked that” → “verified that”"],
  [/\bswitched? it on\b/gi, "powered it on", "“switched it on” → “powered it on”"],
  [/\bwent to site\b/gi, "attended site", "“went to site” → “attended site”"],
  [/\bthe guy\b/gi, "the site contact", "“the guy” → “the site contact”"],
  [/\bguys\b/gi, "team", "“guys” → “team”"],
  [/\bgonna\b/gi, "will", "“gonna” → “will”"],
  [/\bstuff\b/gi, "equipment", "“stuff” → “equipment”"],
  [/\bbroken\b/gi, "faulty", "“broken” → “faulty”"],
  [/\ball good\b/gi, "operating correctly", "“all good” → “operating correctly”"],
  [/\bworking 100%?\b/gi, "fully operational", "“working 100” → “fully operational”"],
  [/\bok\b/gi, "confirmed working", "“ok” → “confirmed working”"],
];

/** Common typos. */
const SPELLING: Record<string, string> = {
  recieved: "received",
  recieve: "receive",
  seperate: "separate",
  occured: "occurred",
  sucessful: "successful",
  succesful: "successful",
  teh: "the",
  wich: "which",
  becuase: "because",
  instaled: "installed",
  instalation: "installation",
  connectiviy: "connectivity",
  conectivity: "connectivity",
  swithc: "switch",
  cabel: "cable",
  didnt: "did not",
  cant: "cannot",
  wont: "will not",
  doesnt: "does not",
  couldnt: "could not",
  wasnt: "was not",
  havent: "have not",
  isnt: "is not",
  its: "its",
};

const wordSwap = (text: string, map: Record<string, string>) =>
  text.replace(/[A-Za-z][A-Za-z-]*/g, (w) => {
    const hit = map[w.toLowerCase()];
    if (!hit) return w;
    // keep an already-correct word untouched
    return w === hit ? w : hit;
  });

const capitaliseSentences = (text: string) =>
  text.replace(/(^|[.!?]\s+|\n\s*)([a-z])/g, (_m, lead: string, ch: string) => `${lead}${ch.toUpperCase()}`);

/** Professional starter phrases an engineer can drop into the field. */
export const SOLUTION_TEMPLATES: { label: string; text: string }[] = [
  {
    label: "Router / CPE installation",
    text:
      "On arrival the site contact was briefed and access to the communications rack was obtained. The new router was mounted in the rack, powered from the protected supply and cabled to the incoming service and the customer LAN. The WAN service was activated, the configuration was loaded and connectivity was verified end to end. Throughput and latency were tested and the results were confirmed acceptable. The site contact confirmed that the network and internet access were fully operational before departure.",
  },
  {
    label: "Fault found and repaired",
    text:
      "The reported fault was replicated on site and isolated to the affected equipment. The faulty unit was replaced with a tested spare, the configuration was restored and all cabling was re-terminated and labelled. Full service was verified after the repair and the site contact confirmed normal operation before departure.",
  },
  {
    label: "No fault found",
    text:
      "All reported symptoms were investigated on site. Cabling, power, configuration and the upstream service were tested and no fault was found; the service was operating within specification throughout the visit. Findings were explained to the site contact and monitoring recommendations were provided.",
  },
  {
    label: "Site survey only",
    text:
      "A site survey was carried out at the customer's request. The communications rack, power provision, patch panels, active equipment and LAN cabling were inspected and recorded, and photographs were taken for the record. Findings and recommendations were discussed with the site contact.",
  },
];

/**
 * Tidy an engineer's write-up: grammar, casing, spelling and professional
 * wording. Returns the improved text plus what changed and what is still worth
 * adding.
 */
export function polishWorkDone(input: string): PolishResult {
  const original = String(input ?? "");
  const changes: string[] = [];
  let text = original;

  const before = text;
  text = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").trim();
  text = text.replace(/\s+([,.;:!?])/g, "$1").replace(/([,.;:])(?=[^\s\d])/g, "$1 ");
  if (text !== before) changes.push("Tidied spacing and punctuation");

  const spelled = wordSwap(text, SPELLING);
  if (spelled !== text) changes.push("Corrected spelling");
  text = spelled;

  const expanded = wordSwap(text, EXPANSIONS);
  if (expanded !== text) changes.push("Wrote abbreviations out in full");
  text = expanded;

  for (const [re, to, note] of PHRASES) {
    if (re.test(text)) {
      text = text.replace(re, to);
      changes.push(note);
    }
  }

  const cased = wordSwap(text, CASING);
  if (cased !== text) changes.push("Fixed technical wording (Wi-Fi, LAN, PoE, …)");
  text = cased;

  const iFixed = text.replace(/\bi\b/g, "I");
  if (iFixed !== text) changes.push("Capitalised “I”");
  text = iFixed;

  const capped = capitaliseSentences(text);
  if (capped !== text) changes.push("Started each sentence with a capital letter");
  text = capped;

  if (text && !/[.!?]$/.test(text)) {
    text = `${text}.`;
    changes.push("Added a closing full stop");
  }

  const low = text.toLowerCase();
  const suggestions: string[] = [];
  if (text.replace(/\s/g, "").length < 80)
    suggestions.push("Add more detail — what you found, what you did and what you tested.");
  if (!/(test|verif|confirm)/.test(low)) suggestions.push("State what you tested and the result.");
  if (!/(customer|site contact|client)/.test(low))
    suggestions.push("Note that the site contact confirmed the service before you left.");
  if (!/(replac|install|configur|repair|terminat|clean|restor)/.test(low))
    suggestions.push("Describe the work performed using clear action words (installed, configured, replaced).");
  if (/\b(we|i)\b/i.test(text))
    suggestions.push("Consider a neutral tone: “the router was configured” instead of “I configured the router”.");

  return { text, changes, suggestions };
}
