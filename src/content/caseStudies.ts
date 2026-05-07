import maristImg from "@/assets/case-marist-network.jpg";
import exmileImg from "@/assets/case-exmile-rack.jpg";
import franchiseImg from "@/assets/case-franchise-wifi.jpg";

export interface CaseStudy {
  slug: string;
  client: string;
  title: string;
  industry: string;
  location: string;
  year: string;
  hero: string;
  summary: string;
  problem: string;
  solution: string;
  process: string[];
  results: string[];
  services: string[];
  quote?: { text: string; author: string };
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "exmile-student-accommodation",
    client: "Exmile",
    title: "Structured Cabling Partner — IT Service Provider",
    industry: "IT Service Provider",
    location: "Multiple sites · South Africa",
    year: "2024–2025",
    hero: exmileImg,
    summary:
      "Siyakha is Exmile's trusted cabling partner — delivering certified structured cabling, dressed comms-room buildouts and labelled patch-panel terminations across their client sites.",
    problem:
      "As an IT service provider, Exmile needed a reliable cabling specialist who could execute neat, certified, on-spec installations on their behalf — without compromising the standard their own clients expect.",
    solution:
      "Siyakha came in as Exmile's hands-on cabling partner: surveying sites, running Cat6 / Cat6A backbones, building out comms rooms with labelled patch panels and managed switching, and handing over fully tested, documented infrastructure.",
    process: [
      "Joint site surveys and cabling-route designs",
      "Cat6 / Cat6A structured cabling on cable trays",
      "Comms-room buildouts: racks, patch panels, managed switching, UPS",
      "Labelled, dressed terminations on every panel",
      "VLAN-ready switch configuration and documentation",
      "Fluke certification and handover to the Exmile team",
    ],
    results: [
      "A repeatable cabling standard Exmile can resell with confidence",
      "Neat, labelled, fully certified comms rooms on every site",
      "Reliable backbone for Wi-Fi, CCTV and access-control roll-ons",
      "Long-term partnership delivering on Exmile's client commitments",
    ],
    services: [
      "Structured Cabling",
      "Comms-Room Buildouts",
      "Patch-Panel Terminations",
      "Managed Switching",
      "Fluke Certification",
    ],
  },
  {
    slug: "franchise-firewall-wifi-rollout",
    client: "National Franchise Group",
    title: "Firewalls & Guest Wi-Fi Rollout — Multi-Site Franchise Stores",
    industry: "Retail & Franchise",
    location: "Stores nationwide · South Africa",
    year: "2024–2025",
    hero: franchiseImg,
    summary:
      "Standardised firewall and access-point rollout across franchise stores nationwide — secure store networks plus a captive-portal guest Wi-Fi experience for customers.",
    problem:
      "Franchise stores were operating on inconsistent, often unsecured store networks with no proper guest Wi-Fi separation — exposing POS systems, frustrating staff and missing a customer-experience opportunity.",
    solution:
      "Siyakha designed a single repeatable store blueprint: a managed firewall, segmented store and guest VLANs, and ceiling-mounted Wi-Fi access points delivering branded captive-portal guest access for customers.",
    process: [
      "Standardised store network blueprint and bill of materials",
      "Firewall deployment with store / guest / POS VLAN segmentation",
      "Ceiling-mounted Wi-Fi access points per store layout",
      "Branded captive-portal guest Wi-Fi configuration",
      "Per-store commissioning, testing and documentation",
      "Centralised cloud management for the entire estate",
    ],
    results: [
      "Consistent, secure network in every store",
      "Branded guest Wi-Fi experience for customers",
      "POS and back-office traffic isolated from guest traffic",
      "Single dashboard view of every site for franchise IT",
    ],
    services: [
      "Firewall Deployment",
      "Wi-Fi Access Points",
      "Guest Captive Portal",
      "VLAN Segmentation",
      "Cloud Network Management",
    ],
  },
  {
    slug: "marist-brothers-linmeyer",
    client: "Marist Brothers Linmeyer",
    title: "22-Classroom Network Infrastructure",
    industry: "Schools & Education",
    location: "Linmeyer, Johannesburg",
    year: "2024",
    hero: maristImg,
    summary:
      "Deployment of structured classroom networking across 22 classrooms with centralised switching, improved internet performance and a foundation for digital learning.",
    problem:
      "Classrooms relied on patchy Wi-Fi and ageing point-to-point cabling. Teachers couldn't trust connectivity for digital lessons, and the school had no centralised view of network performance or capacity to scale.",
    solution:
      "Siyakha designed and deployed enterprise-grade structured cabling, terminated data points in every classroom and consolidated all switching into a single managed core — giving the school stable, fast, future-ready connectivity.",
    process: [
      "On-site survey and cable-route design across 22 classrooms",
      "Cat6 structured cabling installed with cable trays and labelling",
      "Wall-mounted data points and patch-panel terminations",
      "Managed switch installation and VLAN configuration",
      "End-to-end Fluke certification and performance testing",
      "Handover documentation and on-site training",
    ],
    results: [
      "Reliable connectivity in every classroom",
      "Network speeds dramatically improved school-wide",
      "Centralised switch management for IT staff",
      "Scalable foundation for CCTV, Wi-Fi and smart classrooms",
    ],
    services: [
      "Network Cabling",
      "Classroom Data Points",
      "Switch Installation",
      "Infrastructure Testing",
    ],
  },
];

export function getCaseStudy(slug: string) {
  return CASE_STUDIES.find((c) => c.slug === slug);
}