import maristImg from "@/assets/case-marist-network.jpg";

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