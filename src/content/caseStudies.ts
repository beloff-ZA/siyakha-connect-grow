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
    slug: "taste-of-mozambique-restaurant-av-wifi",
    client: "A Taste of Mozambique +258",
    title: "AV, Wi-Fi, Telephony & CCTV for a Design Quarter Restaurant",
    industry: "Hospitality & Restaurants",
    location: "Design Quarter · Johannesburg",
    year: "2025",
    hero: franchiseImg,
    summary:
      "Full technology enhancement for A Taste of Mozambique +258 in the Design Quarter — AV system, business Wi-Fi, telephone solution and CCTV, all rolled out turnkey to elevate the guest experience and day-to-day operations.",
    problem:
      "The restaurant owner needed a single trusted partner to enhance the venue's technology — reliable Wi-Fi for staff and guests, a proper telephone setup for reservations, AV for ambience, and CCTV coverage for safety and oversight.",
    solution:
      "Siyakha designed and installed a complete in-venue technology stack: business-grade Wi-Fi with guest captive portal, AV with zoned audio for the dining area, a telephone solution for reservations and supplier calls, and CCTV coverage across the floor and back-of-house.",
    process: [
      "On-site walk-through and venue technology audit",
      "Cabling and containment for AV, Wi-Fi, voice and CCTV",
      "Wi-Fi access points with staff / guest VLAN separation",
      "AV system with zoned audio for the dining area",
      "Telephone solution for reservations and supplier calls",
      "CCTV cameras across floor, entrance and back-of-house with remote viewing",
      "Commissioning, staff walkthrough and handover documentation",
    ],
    results: [
      "Reliable connectivity for staff operations and guest Wi-Fi",
      "Crisp, zoned audio elevating the in-venue experience",
      "Professional telephone line for bookings and suppliers",
      "Full CCTV coverage with remote viewing for the owner",
    ],
    services: [
      "AV Installation",
      "Business Wi-Fi",
      "Telephone Solution",
      "CCTV & Surveillance",
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
      "Ceiling-mounted Grandstream Wi-Fi access points per store layout",
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
      "Grandstream Wi-Fi Access Points",
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