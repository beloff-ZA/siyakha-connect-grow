import { Building2, Camera, Radar, Cable, MonitorCog, Bot } from "lucide-react";

export interface Capability {
  slug: string;
  label: string;
  icon: typeof Building2;
  teaser: string;
  what: string;
  how: string[];
  who: string;
  caseStudySlug?: string;
}

export const CAPABILITIES: Capability[] = [
  {
    slug: "smart-estates",
    label: "Smart Estate Systems",
    icon: Building2,
    teaser: "IoT, access control, energy and tenant experience — engineered in from blueprint stage, not bolted on after handover.",
    what: "The integrated technology layer for residential estates and mixed-use developments — smart access, IoT automation, energy management and tenant-facing digital services delivered as one system.",
    how: [
      "Access control at gates, boom lanes and MDU entrances",
      "IoT sensor mesh for water, energy, and building health",
      "Tenant / resident app for concierge, comms, and requests",
      "Integration with the estate's security and networking backbone",
    ],
    who: "Developers, estate managers, HOAs and mixed-use owners who want one accountable partner across gates, buildings and services.",
    caseStudySlug: "exmile-student-accommodation",
  },
  {
    slug: "ai-surveillance",
    label: "AI Surveillance",
    icon: Camera,
    teaser: "Camera systems that classify, alert and act — active deterrence, verified alarms, and 24/7 command-centre response.",
    what: "AI-analytics CCTV designed for verified detection rather than after-the-fact review — human/vehicle classification, loitering and perimeter breach detection, with active deterrence and command-centre dispatch.",
    how: [
      "PTZ and fixed AI cameras with on-device classification",
      "Line-crossing, intrusion and loitering analytics",
      "Two-way audio and light-based active deterrence",
      "Verified alerts dispatched to command centre operators",
    ],
    who: "Estates, commercial sites and schools that need alarms they can trust — and evidence they can produce.",
    caseStudySlug: "franchise-firewall-wifi-rollout",
  },
  {
    slug: "border-radar",
    label: "Border Radar & Perimeter Detection",
    icon: Radar,
    teaser: "Long-range radar fused with thermal PTZ optics — human classification out to 5km, verified in seconds.",
    what: "Digital perimeter and border intrusion detection built to detect, classify and verify targets from up to 5km — radar plus thermal PTZ plus AI classification, dispatched to on-site or command-centre response teams.",
    how: [
      "Long-range ground-surveillance radar",
      "Thermal PTZ auto-slew and target tracking",
      "AI classification: human vs vehicle vs wildlife vs drone",
      "Verified dispatch to command centre and response",
    ],
    who: "Government agencies, border authorities and large private perimeters where false alarms cost more than the system.",
  },
  {
    slug: "fibre-connectivity",
    label: "Fibre & Connectivity",
    icon: Cable,
    teaser: "Fibre backbones, enterprise WiFi for MDUs, and public-area WiFi engineered by the same team that runs the network.",
    what: "Structured cabling, fibre backbones, enterprise WiFi for multi-dwelling units, and public-area WiFi — designed, installed and operated by one team.",
    how: [
      "Fibre backbone and last-mile design",
      "Enterprise WiFi for MDUs and campuses",
      "Public-area / guest WiFi with captive portal",
      "ISP integration and managed failover",
    ],
    who: "Estates, commercial buildings, franchises and schools that need a network — not a wiring job.",
    caseStudySlug: "franchise-firewall-wifi-rollout",
  },
  {
    slug: "command-centre",
    label: "Command Centre Operations",
    icon: MonitorCog,
    teaser: "24/7 operators watching the alarms your cameras raise — the difference between a recorded incident and an intercepted one.",
    what: "24/7 monitored operations for AI cameras, radar, access control and alarms — the operational layer that makes the technology worth installing.",
    how: [
      "24/7 operator coverage",
      "Verified alarm handling and SOP execution",
      "Response team dispatch and incident logging",
      "Client dashboards and monthly reporting",
    ],
    who: "Any client whose security posture depends on someone actually watching — not just recording.",
  },
  {
    slug: "ai-agents",
    label: "AI Agents for Business",
    icon: Bot,
    teaser: "Always-on AI agents that answer calls, log support requests and book appointments — available from as little as R399 per month.",
    what: "Siyakha AI agents work alongside your team — answering calls, helping clients log support requests faster, booking appointments and handling routine enquiries around the clock. Available to businesses from as little as R399 per month.",
    how: [
      "Answers calls and WhatsApp enquiries 24/7 in a natural voice",
      "Logs support requests and tickets directly into your helpdesk",
      "Books appointments and confirms them with your clients",
      "Escalates complex queries to your team with full context",
    ],
    who: "Small and growing businesses that want every call answered and every request logged — without hiring more staff.",
  },
];

export const getCapability = (slug: string) => CAPABILITIES.find((c) => c.slug === slug);