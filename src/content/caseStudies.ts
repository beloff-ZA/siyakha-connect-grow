import maristImg from "@/assets/case-marist-network.jpg";
import exmileImg from "@/assets/case-exmile-rack.jpg";
import franchiseImg from "@/assets/case-franchise-wifi.jpg";
import tasteMozImg from "@/assets/case-taste-mozambique.jpg";
import franchiseKfcImg from "@/assets/case-franchise-kfc.jpg";
import franchiseWifiPortalImg from "@/assets/case-franchise-wifi-portal.jpg";
import franchiseSignageImg from "@/assets/case-franchise-digital-signage.jpg";
import franchisePosImg from "@/assets/case-franchise-pos.jpg";
import franchiseCabinetBefore from "@/assets/case-franchise-cabinet-before.jpg";
import franchiseCabinetAfter from "@/assets/case-franchise-cabinet-after.jpg";

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
  gallery?: { src: string; caption: string }[];
  beforeAfter?: {
    title: string;
    caption: string;
    before: { src: string; alt: string };
    after: { src: string; alt: string };
  };
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "northern-johannesburg-restaurant-av-wifi",
    client: "Restaurant — Northern Johannesburg",
    title: "Data Points, Hikvision CCTV & AV Solution — Restaurant Fit-Out",
    industry: "Hospitality & Restaurants",
    location: "Northern Johannesburg",
    year: "2025",
    hero: tasteMozImg,
    summary:
      "End-to-end venue technology rollout for a restaurant in northern Johannesburg — enhancing the establishment's technology so they could open and trade. Full data-point installation, a Hikvision CCTV system and an AV solution with audio speakers integrated into the restaurant's existing amplifier.",
    problem:
      "The restaurant needed to enhance its technology end-to-end so it could open and trade — proper data points throughout the venue, a Hikvision CCTV system for safety and oversight, and an AV solution that worked with the existing amplifier already on site.",
    solution:
      "Siyakha installed all data points across the restaurant, deployed a full Hikvision CCTV system with coverage across the floor, entrance and back-of-house, and built out an AV solution — mounting audio speakers and integrating them cleanly into the existing amplifier for zoned in-venue sound.",
    process: [
      "On-site walk-through and venue technology audit",
      "Installation of all data points across the restaurant",
      "Cabling and containment for CCTV and AV runs",
      "Hikvision CCTV cameras across floor, entrance and back-of-house",
      "NVR setup with remote viewing for the owner",
      "AV speaker installation and integration with the existing amplifier",
      "Commissioning, staff walkthrough and handover documentation",
    ],
    results: [
      "All data points installed and ready for venue operations",
      "Full Hikvision CCTV coverage with remote viewing for the owner",
      "Crisp in-venue audio through speakers tied into the existing amp",
      "A single trusted partner for cabling, surveillance and AV",
    ],
    services: [
      "Data Point Installation",
      "Hikvision CCTV",
      "AV Installation",
      "Speaker & Amplifier Integration",
      "Structured Cabling",
    ],
  },
  {
    slug: "exmile-student-accommodation",
    client: "Student Accommodation Rollouts",
    title: "Structured Cabling for Student Accommodation Buildings",
    industry: "Student Accommodation",
    location: "Multiple sites · South Africa",
    year: "2024–2025",
    hero: exmileImg,
    summary:
      "We've set up student accommodation buildings with certified structured cabling, dressed comms-room buildouts and labelled patch-panel terminations — ready for Wi-Fi, CCTV and access control.",
    problem:
      "Student accommodation buildings needed a reliable cabling specialist to deliver neat, certified, on-spec installations across multiple sites — without compromising the standard residents and operators expect.",
    solution:
      "Siyakha surveyed each site, ran Cat6 / Cat6A backbones, built out comms rooms with labelled patch panels and managed switching, and handed over fully tested, documented infrastructure ready for resident services.",
    process: [
      "Joint site surveys and cabling-route designs",
      "Cat6 / Cat6A structured cabling on cable trays",
      "Comms-room buildouts: racks, patch panels, managed switching, UPS",
      "Labelled, dressed terminations on every panel",
      "VLAN-ready switch configuration and documentation",
      "Fluke certification and full handover documentation",
    ],
    results: [
      "A repeatable cabling standard across every building",
      "Neat, labelled, fully certified comms rooms on every site",
      "Reliable backbone for Wi-Fi, CCTV and access-control roll-ons",
      "Long-term partnership delivering on operator commitments",
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
    client: "Franchise & Retail Stores",
    title: "In-Store IT, Wi-Fi & Network Rebuilds — Franchise & Retail",
    industry: "Retail & Franchise",
    location: "Stores nationwide · South Africa",
    year: "2024–2025",
    hero: franchiseImg,
    summary:
      "In-store IT support for franchise and retail spaces — guest Wi-Fi solutions, desktop and printer support, network rebuilds and full re-cabling. Including a comms cabinet rebuild for Coricraft, shown before and after.",
    problem:
      "Franchise and retail stores were running on ageing, tangled comms cabinets, inconsistent Wi-Fi and unreliable desktop and printer setups — slowing staff down on the floor, frustrating customers and exposing POS systems.",
    solution:
      "Siyakha provides in-store resources for retail spaces — guest Wi-Fi solutions, desktop and printer support, network rebuilds and full re-cabling of comms cabinets. For Coricraft we stripped and rebuilt the comms cabinet end-to-end, taking it from a tangled legacy install to a clean, labelled, serviceable rack.",
    process: [
      "On-site assessment of cabinet, cabling, Wi-Fi and store IT",
      "Guest Wi-Fi solution with captive-portal sign-in",
      "Desktop, POS and printer support for store staff",
      "Network rebuilds — switches, patch panels and routing tidied",
      "Full re-cabling of comms cabinets and floor data points",
      "Coricraft cabinet rebuild — strip-out, re-rack, re-cable, label and test",
    ],
    results: [
      "Clean, serviceable comms cabinets in every store",
      "Reliable guest Wi-Fi for customers on the floor",
      "Faster, more dependable desktops, POS and printers",
      "A single in-store IT partner for franchise and retail estates",
    ],
    services: [
      "In-Store IT Support",
      "Guest Wi-Fi Solutions",
      "Desktop & Printer Support",
      "Network Rebuilds",
      "Comms-Cabinet Re-Cabling",
    ],
    beforeAfter: {
      title: "Coricraft comms cabinet — before & after",
      caption:
        "We stripped out the legacy cabinet, re-racked the active equipment and re-cabled every patch — taking it from a tangled mess to a clean, labelled, serviceable rack.",
      before: {
        src: franchiseCabinetBefore,
        alt: "Coricraft comms cabinet before — tangled cabling, unmanaged patch leads and stacked equipment",
      },
      after: {
        src: franchiseCabinetAfter,
        alt: "Coricraft comms cabinet after — re-racked equipment, dressed patch leads and labelled patch panels",
      },
    },
    gallery: [
      { src: franchiseKfcImg, caption: "On-site at a national franchise store" },
      { src: franchiseWifiPortalImg, caption: "Branded guest Wi-Fi captive portal" },
      { src: franchiseSignageImg, caption: "In-store digital signage and CCTV" },
      { src: franchisePosImg, caption: "POS, desktop and printer support" },
    ],
  },
  {
    slug: "marist-brothers-linmeyer",
    client: "Educational Facility Solutions",
    title: "Complete Technology Solutions for Primary & High Schools",
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