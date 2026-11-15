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
import franchiseCabinetCleanup1 from "@/assets/case-franchise-cabinet-cleanup-1.jpg";
import franchiseCabinetCleanup2 from "@/assets/case-franchise-cabinet-cleanup-2.jpg";
import franchiseCabinetCleanup3 from "@/assets/case-franchise-cabinet-cleanup-3.jpg";
import kwamashuTrainingImg from "@/assets/case-kwamashu-training-room.jpg";
import jhbComputerLabImg from "@/assets/case-jhb-computer-lab.jpg";
import capitalAirHero from "@/assets/capital-air-exterior-hero.jpg.asset.json";
import capitalAirClose from "@/assets/capital-air-exterior-close.jpg.asset.json";
import capitalAirWide from "@/assets/capital-air-exterior-wide.jpg.asset.json";
import capitalAirInterior from "@/assets/capital-air-interior-wide.jpg.asset.json";
import capitalAirCabinet from "@/assets/capital-air-cabinet-painted-wall.png.asset.json";
import sunInternationalHero from "@/assets/sun-international-head-office.jpg.asset.json";
import hikvisionLogo from "@/assets/hikvision-official-logo.svg.asset.json";
import paradoxLogo from "@/assets/paradox-official-logo.png.asset.json";
import tigerBrandsHero from "@/assets/tiger-brands-boardroom.jpg.asset.json";
import tigerBrandsDetail from "@/assets/tiger-brands-screen-privacy.jpg.asset.json";
import stJosephHero from "@/assets/st-joseph-outdoor-installation.webp.asset.json";
import nominationHero from "@/assets/nomination-italy-waterfront-storefront.webp.asset.json";
import nominationLogo from "@/assets/nomination-official-logo.svg.asset.json";
import catch22Hero from "@/assets/catch-22-exterior.webp.asset.json";
import sapathHero from "@/assets/sapath-site-interior.webp.asset.json";
import campuskeyCable from "@/assets/campuskey-cable-management.webp.asset.json";
import campuskeyHero from "@/assets/campuskey-building-exterior.webp.asset.json";
import campuskeyCommonArea from "@/assets/campuskey-common-area.webp.asset.json";
import impalaHero from "@/assets/impala-rollout-privacy.webp.asset.json";
import forumHero from "@/assets/angolan-mining-forum-event.webp.asset.json";
import tctsHero from "@/assets/tcts-autobody-premises.webp.asset.json";
import afroMuseHero from "@/assets/afro-muse-in-progress-interior.webp.asset.json";

export interface CaseStudy {
  slug: string;
  client: string;
  title: string;
  industry: string;
  location: string;
  year?: string;
  status?: "Project in progress";
  hero: string;
  typeCover?: { subtitle: string; caption: string };
  heroPhoto?: { alt: string; caption: string; width: number; height: number; portrait: boolean; preserveFullScene?: boolean };
  summary: string;
  problem: string;
  solution: string;
  process: string[];
  results: string[];
  services: string[];
  equipment?: { name: string; logo: string; width: number; height: number; source: string }[];
  clientIdentity?: { logo: string; width: number; height: number; source: string };
  quote?: { text: string; author: string };
  gallery?: { src: string; caption: string; alt?: string; width?: number; height?: number; enhanced?: boolean }[];
  /** Fact-only entries: replaces problem/solution/process/results sections. */
  factual?: { overview: string; scope: string[]; scopeLabel?: string; galleryLabel?: string; scopeMetric?: { value: number | string; label: string } };
  sequence?: {
    title: string;
    caption?: string;
    items: { src: string; caption: string }[];
  };
  beforeAfter?: {
    title: string;
    caption: string;
    before: { src: string; alt: string };
    after: { src: string; alt: string };
  };
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "tcts-autobody-randburg",
    client: "TCTS Autobody",
    title: "TCTS Autobody: Connected Business Systems",
    industry: "Automotive",
    location: "Randburg",
    hero: tctsHero.url,
    heroPhoto: {
      alt: "Privacy-edited photograph of the TCTS Autobody premises with identifying details obscured",
      caption: "TCTS Autobody premises · identifying details obscured for privacy",
      width: 1086,
      height: 1448,
      portrait: true,
    },
    summary: "Siyakha Technology Solutions worked on VoIP, a website, telephony, Microsoft packages and a support console to manage them for TCTS Autobody in Randburg.",
    problem: "", solution: "", process: [], results: [],
    services: ["VoIP", "Website", "Telephony", "Microsoft packages", "Support console to manage them"],
    factual: {
      overview: "Siyakha Technology Solutions worked on VoIP, a website, telephony, Microsoft packages and a support console to manage them for TCTS Autobody in Randburg.",
      scope: ["VoIP", "Website", "Telephony", "Microsoft packages", "Support console to manage them"],
      scopeLabel: "Project scope",
    },
  },
  {
    slug: "afro-muse-hair-and-beauty",
    client: "Afro Muse Hair and Beauty",
    title: "Afro Muse Hair and Beauty: Salon Technology",
    industry: "Beauty & Wellness",
    location: "",
    status: "Project in progress",
    hero: afroMuseHero.url,
    heroPhoto: {
      alt: "Original contextual photograph of the empty Afro Muse Hair and Beauty salon interior during works",
      caption: "Afro Muse Hair and Beauty interior · project in progress",
      width: 1280,
      height: 960,
      portrait: false,
      preserveFullScene: true,
    },
    summary: "Siyakha Technology Solutions is working on a salon technology project for Afro Muse Hair and Beauty, covering guest Wi-Fi, CCTV, a website and custom booking system, switches, NVRs, a commercial display and fibre management.",
    problem: "", solution: "", process: [], results: [],
    services: ["Guest Wi-Fi", "CCTV", "Website and custom booking system", "Switches", "NVRs", "Commercial display", "Fibre management"],
    factual: {
      overview: "Siyakha Technology Solutions is working on a salon technology project for Afro Muse Hair and Beauty, covering guest Wi-Fi, CCTV, a website and custom booking system, switches, NVRs, a commercial display and fibre management.",
      scope: ["Guest Wi-Fi", "CCTV", "Website and custom booking system", "Switches", "NVRs", "Commercial display", "Fibre management"],
      scopeLabel: "Project scope · in progress",
    },
  },
  {
    slug: "angolan-mining-business-forum",
    client: "Angolan Mining Business Forum",
    title: "Angolan Mining Business Forum: Digital Event Systems",
    industry: "Events & Conferences",
    location: "",
    hero: forumHero.url,
    heroPhoto: {
      alt: "Wide event-context photograph with conference seating and Angolan Mining Business Forum signage",
      caption: "Angolan Mining Business Forum · event context",
      width: 1560,
      height: 878,
      portrait: false,
      preserveFullScene: true,
    },
    summary: "Siyakha Technology Solutions worked on the formulation of digital systems and software tools to assist event management for the Angolan Mining Business Forum.",
    problem: "",
    solution: "",
    process: [],
    results: [],
    services: ["Digital systems formulation", "Event-management software tools"],
    factual: {
      overview: "Siyakha Technology Solutions worked on the formulation of digital systems and software tools to assist event management for the Angolan Mining Business Forum.",
      scope: ["Digital systems formulation", "Event-management software tools"],
    },
  },
  {
    slug: "impala-platinum-laptop-rollout",
    client: "Impala Platinum",
    title: "Impala Platinum: Laptop Rollout Support",
    industry: "Mining",
    location: "North West, South Africa",
    hero: impalaHero.url,
    heroPhoto: {
      alt: "Privacy-edited on-site photograph from the Impala Platinum rollout support project, with faces, whiteboard and paperwork blurred",
      caption: "On-site rollout support · faces and operational information blurred for privacy",
      width: 1448,
      height: 1086,
      portrait: false,
      preserveFullScene: true,
    },
    summary: "Siyakha Technology Solutions deployed resources to assist with laptop allocation for an Impala Platinum mine rollout project involving more than 1,000 machines in North West.",
    problem: "",
    solution: "",
    process: [],
    results: [],
    services: ["On-site rollout resources", "Laptop allocation assistance"],
    factual: {
      overview: "Siyakha Technology Solutions deployed resources to assist with laptop allocation for an Impala Platinum mine rollout project involving more than 1,000 machines in North West.",
      scope: ["On-site rollout resources", "Laptop allocation assistance"],
      scopeMetric: { value: "1,000+", label: "Machines in the wider rollout project" },
    },
  },
  {
    slug: "campuskey-port-elizabeth",
    client: "CampusKey",
    title: "CampusKey: CAT6 Recabling & Data-Point Cleanup",
    industry: "Student Accommodation",
    location: "Port Elizabeth",
    hero: campuskeyHero.url,
    heroPhoto: {
      alt: "Exterior of the CampusKey student accommodation building in Port Elizabeth",
      caption: "CampusKey student accommodation, Port Elizabeth",
      width: 659,
      height: 878,
      portrait: true,
    },
    summary: "Working on behalf of Exmile, CampusKey’s connectivity partner, Siyakha Technology Solutions recabled the data environment and carried out major data-point cleanup and CAT6 cabling at CampusKey student accommodation in Port Elizabeth.",
    problem: "",
    solution: "",
    process: [],
    results: [],
    services: ["Data environment recabling", "Major data-point cleanup", "CAT6 cabling"],
    factual: {
      overview: "Working on behalf of Exmile, CampusKey’s connectivity partner, Siyakha Technology Solutions recabled the data environment and carried out major data-point cleanup and CAT6 cabling at CampusKey student accommodation in Port Elizabeth.",
      scope: ["Data environment recabling", "Major data-point cleanup", "CAT6 cabling"],
      galleryLabel: "Site photographs",
    },
    gallery: [
      {
        src: campuskeyCommonArea.url,
        caption: "Communal area at the CampusKey site",
        alt: "Empty communal seating area at the CampusKey site",
        width: 1170,
        height: 878,
      },
      {
        src: campuskeyCable.url,
        caption: "Cable management from the CampusKey project",
        alt: "Cable runs secured along a cable tray at the CampusKey project, with no people or readable network labels",
        width: 659,
        height: 878,
      },
    ],
  },
  {
    slug: "sapath-network-infrastructure",
    client: "SAPath",
    title: "SAPath: Network Infrastructure & Field Support",
    industry: "Healthcare",
    location: "Cape Town",
    hero: sapathHero.url,
    heroPhoto: {
      alt: "Architectural crop of ceiling panels and lighting inside the SAPath project site",
      caption: "Site interior from the SAPath project",
      width: 659,
      height: 494,
      portrait: false,
    },
    summary: "Siyakha Technology Solutions assisted SAPath laboratory in Cape Town with a network infrastructure upgrade, recabling, data points and onsite field support.",
    problem: "",
    solution: "",
    process: [],
    results: [],
    services: ["Network infrastructure upgrade", "Recabling", "Data points", "Onsite field support"],
    factual: {
      overview: "Siyakha Technology Solutions assisted SAPath laboratory in Cape Town with a network infrastructure upgrade, recabling, data points and onsite field support.",
      scope: ["Network infrastructure upgrade", "Recabling", "Data points", "Onsite field support"],
    },
  },
  {
    slug: "catch-22-connectivity",
    client: "Catch 22",
    title: "Catch 22: Connectivity & Guest Wi-Fi Testing",
    industry: "Hospitality",
    location: "Corner Beach Boulevard and Porterfield Road, Table View, Cape Town",
    hero: catch22Hero.url,
    heroPhoto: {
      alt: "Contextual exterior photograph showing Catch 22 restaurant signage in Table View, Cape Town",
      caption: "Catch 22 restaurant exterior · Table View, Cape Town",
      width: 1170,
      height: 878,
      portrait: false,
    },
    summary: "Siyakha Technology Solutions assisted Catch 22 with a connectivity solution and testing Wi-Fi solutions for guests.",
    problem: "",
    solution: "",
    process: [],
    results: [],
    services: ["Connectivity solution assistance", "Guest Wi-Fi solution testing"],
    factual: {
      overview: "Siyakha Technology Solutions assisted Catch 22 with a connectivity solution and testing Wi-Fi solutions for guests.",
      scope: ["Connectivity solution assistance", "Guest Wi-Fi solution testing"],
    },
  },
  {
    slug: "nomination-italy-waterfront",
    client: "Nomination Italy",
    title: "Nomination Italy: Field Support, Connectivity & VoIP",
    industry: "Retail & Franchise",
    location: "V&A Waterfront, Cape Town",
    hero: nominationHero.url,
    heroPhoto: {
      alt: "Nomination Italy storefront at the V&A Waterfront, Cape Town, with genuine Nomination Italy signage and jewellery displays",
      caption: "Nomination Italy storefront · V&A Waterfront, Cape Town",
      width: 494,
      height: 878,
      portrait: true,
    },
    clientIdentity: {
      logo: nominationLogo.url,
      width: 546,
      height: 175.5,
      source: "https://www.nomination.com/static/version1794394945/frontend/Nomination/default/it_IT/images/logo.svg",
    },
    summary: "Siyakha Technology Solutions was appointed to provide on-ground field support, connectivity and VoIP setup for the Nomination Italy project at the V&A Waterfront, Cape Town.",
    problem: "",
    solution: "",
    process: [],
    results: [],
    services: ["On-ground field support", "Connectivity setup", "VoIP setup"],
    factual: {
      overview: "Siyakha Technology Solutions was appointed to provide on-ground field support, connectivity and VoIP setup for the Nomination Italy project at the V&A Waterfront, Cape Town.",
      scope: ["On-ground field support", "Connectivity setup", "VoIP setup"],
    },
  },
  {
    slug: "st-josephs-marist-cape-town",
    client: "St Joseph’s Marist Brothers",
    title: "St Joseph’s Marist Brothers: Fibre-Integrated CCTV",
    industry: "Schools & Education",
    location: "Cape Town",
    hero: stJosephHero.url,
    heroPhoto: {
      alt: "Outdoor CCTV installation at St Joseph’s Marist Brothers, Cape Town, with a camera pole and mountain backdrop; no people visible",
      caption: "Outdoor CCTV installation at St Joseph’s Marist Brothers, Cape Town",
      width: 494,
      height: 878,
      portrait: true,
    },
    summary: "Siyakha Technology Solutions completed a turnkey CCTV rollout involving multiple cameras with fibre integration for St Joseph’s Marist Brothers in Cape Town.",
    problem: "",
    solution: "",
    process: [],
    results: [],
    services: ["CCTV rollout", "Fibre integration", "Turnkey delivery"],
    factual: {
      overview: "At St Joseph’s Marist Brothers in Cape Town, Siyakha Technology Solutions completed a fibre-integrated turnkey CCTV rollout involving multiple cameras. The complete turnkey delivery brought the CCTV rollout and fibre integration together as one project.",
      scope: ["CCTV rollout", "Fibre integration", "Turnkey delivery"],
    },
  },
  {
    slug: "tiger-brands-boardroom-technology",
    client: "Tiger Brands",
    title: "Tiger Brands: Smart Board, TV & Paradox Installation",
    industry: "Commercial & Corporate Offices",
    location: "",
    hero: tigerBrandsHero.url,
    heroPhoto: {
      alt: "Tiger Brands boardroom with conference table, seating and a display; Tiger Brands signage appears in the room",
      caption: "Tiger Brands boardroom",
      width: 1086,
      height: 1448,
      portrait: true,
    },
    summary: "Appointed by Design Code Interior Designers, Siyakha Technology Solutions delivered smart board installation, TVs and a Paradox system for the Tiger Brands project.",
    problem: "",
    solution: "",
    process: [],
    results: [],
    services: ["Smart Board Installation", "TV Installation", "Paradox System"],
    equipment: [
      { name: "Paradox", logo: paradoxLogo.url, width: 2560, height: 291, source: "https://www.paradox.com/web/" },
    ],
    factual: {
      overview: "Appointed by Design Code Interior Designers, Siyakha Technology Solutions delivered smart board installation, TVs and a Paradox system for the Tiger Brands project.",
      scope: ["Smart board installation", "TVs", "Paradox system"],
      galleryLabel: "Installation detail",
    },
    gallery: [
      { src: tigerBrandsDetail.url, caption: "Smart board installation · site clutter removed; display blurred for privacy", alt: "Tiger Brands wall-mounted smart board with display content blurred for privacy and temporary site clutter removed; unfinished ceiling remains visible", width: 941, height: 1672, enhanced: true },
    ],
  },
  {
    slug: "sun-international-head-office",
    client: "Sun International Head Office",
    title: "Sun International Head Office: Building-Wide Network Cabling",
    industry: "Commercial & Corporate Offices",
    location: "",
    hero: sunInternationalHero.url,
    heroPhoto: {
      alt: "Sun International head office exterior with the office building and entrance landscaping",
      caption: "Sun International head office exterior",
      width: 1152,
      height: 1536,
      portrait: true,
    },
    summary: "Team-delivered work at Sun International head office: 980 total network points, building-wide cabling and rerouting, plus CCTV points, data points, screens, boardrooms and Wi-Fi access points.",
    problem: "",
    solution: "",
    process: [],
    results: [],
    services: ["Network Cabling", "Cable Rerouting", "CCTV Points", "Data Points", "Screens", "Boardrooms", "Wi-Fi Access Points"],
    factual: {
      overview: "The Siyakha Technology Solutions team delivered complete building-wide network cabling and rerouting of all cabling at Sun International head office. The project includes 980 network points in total, alongside team-delivered work on CCTV points, data points, screens, boardrooms and Wi-Fi access points.",
      scope: ["980 network points in total", "Building-wide network cabling", "Rerouting of all cabling", "CCTV points", "Data points", "Screens", "Boardrooms", "Wi-Fi access points"],
      scopeMetric: { value: 980, label: "Total network points · installation scope" },
    },
  },
  {
    slug: "capital-air-randburg",
    client: "Capital Air",
    title: "Capital Air: CCTV & Alarm Installation",
    industry: "Commercial Security",
    location: "Randburg, Johannesburg",
    year: "2026",
    hero: capitalAirHero.url,
    summary:
      "A brand-new security installation for Capital Air in Randburg, delivered by Siyakha Technology Solutions: 32 Hikvision PT CCTV cameras and a Paradox alarm system.",
    problem: "",
    solution: "",
    process: [],
    results: [],
    services: ["CCTV Installation", "Alarm Installation"],
    equipment: [
      { name: "Hikvision", logo: hikvisionLogo.url, width: 8082, height: 1024, source: "https://www.hikvision.com/en/" },
      { name: "Paradox", logo: paradoxLogo.url, width: 2560, height: 291, source: "https://www.paradox.com/web/" },
    ],
    factual: {
      overview:
        "Siyakha Technology Solutions has carried out a brand-new security installation for Capital Air in Randburg.",
      scope: ["32 Hikvision PT CCTV cameras", "Paradox alarm system"],
      galleryLabel: "On-site photographs",
    },
    gallery: [
      { src: capitalAirClose.url, caption: "Building exterior", alt: "Close view of the Capital Air building exterior in Randburg", width: 1152, height: 1536 },
      { src: capitalAirWide.url, caption: "Wider exterior view", alt: "Wider view of the Capital Air building exterior and driveway", width: 1152, height: 1536 },
      { src: capitalAirInterior.url, caption: "Selected installation view", alt: "Interior of the Capital Air warehouse space", width: 1152, height: 1536 },
      { src: capitalAirCabinet.url, caption: "Installation cabinet · wall finish illustrated", alt: "Capital Air installation cabinet with illustrated wall finish", width: 1086, height: 1448, enhanced: true },
    ],
  },
  {
    slug: "kwamashu-training-facility",
    client: "Kwamashu Training Facility",
    title: "Training Room Build-Out — Workstations, Cabling & Network",
    industry: "Training & Skills Development",
    location: "Kwamashu, KwaZulu-Natal",
    year: "2016",
    hero: kwamashuTrainingImg,
    summary:
      "End-to-end training-room setup for a skills facility in Kwamashu — desktop workstations, webcams, headsets, structured cabling and a clean U-shaped lab layout ready for learners on day one.",
    problem:
      "The facility needed a fully working training room — workstations, peripherals, networking and cabling — delivered as one turnkey build, not a stack of separate vendors.",
    solution:
      "Siyakha designed the U-shaped lab, ran structured cabling under the bench, deployed and configured every workstation with webcams and peripherals, and handed over a fully tested training room ready for class.",
    process: [
      "Lab layout and cable-route design",
      "Structured cabling under the workstation bench",
      "Workstation deployment — towers, monitors, keyboards, mice",
      "Webcam and headset setup for online training",
      "Network switch configuration and internet uplink",
      "Final testing and handover to facility staff",
    ],
    results: [
      "A fully working training room delivered turnkey",
      "Consistent learner experience across every seat",
      "Reliable connectivity for online and instructor-led sessions",
      "One partner accountable for the full build",
    ],
    services: [
      "Workstation Deployment",
      "Structured Cabling",
      "Network Switching",
      "Peripheral Setup",
      "Training-Room Fit-Out",
    ],
  },
  {
    slug: "johannesburg-school-computer-lab",
    client: "Johannesburg School Computer Lab",
    title: "School Computer Lab — Workstations, Cabling & Classroom Network",
    industry: "Schools & Education",
    location: "Johannesburg",
    year: "2024",
    hero: jhbComputerLabImg,
    summary:
      "Computer lab setup for a Johannesburg school — desktop workstations along the bench, structured cabling, network switching and a layout ready for full classes of learners.",
    problem:
      "The school needed a proper computer lab — workstations, cabling and a stable network — built as one project so teachers could run classes the following term.",
    solution:
      "Siyakha installed the workstations, ran structured cabling along the bench, terminated data points at every seat and configured the classroom switch — leaving a clean, learner-ready lab.",
    process: [
      "Lab layout planning around bench and seating",
      "Structured cabling and data points at every workstation",
      "Desktop workstation deployment and imaging",
      "Classroom switch configuration and uplink to school network",
      "Cable management and labelling",
      "Final testing and teacher handover",
    ],
    results: [
      "A full computer lab ready for classes",
      "Reliable wired connectivity at every seat",
      "Neat cabling that's easy to maintain",
      "Foundation for future Wi-Fi and CCTV roll-ons",
    ],
    services: [
      "Computer Lab Build-Out",
      "Workstation Deployment",
      "Structured Cabling",
      "Classroom Networking",
      "Switch Configuration",
    ],
  },
  {
    slug: "northern-johannesburg-restaurant-av-wifi",
    client: "Restaurant Solutions",
    title: "Complete Technology Solutions for Restaurants",
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
    title: "Retail & Store Signage, Connectivity & CCTV — Turnkey Technology",
    industry: "Retail & Franchise",
    location: "Stores nationwide · South Africa",
    year: "2024–2025",
    hero: franchiseImg,
    summary:
      "Making sure your clients' hardware stays connected. Complete turnkey technology — from signage installs to network support, as well as CCTV installation — for franchise and retail stores. Including a comms cabinet rebuild for Coricraft, shown before and after.",
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
    sequence: {
      title: "Coricraft cabinet cleanup — full sequence",
      caption:
        "Three stages of the rebuild: strip-out, re-rack and final dress. Every patch labelled, every cable accounted for.",
      items: [
        { src: franchiseCabinetCleanup1, caption: "Cabinet stripped — old gear removed, ready for rebuild" },
        { src: franchiseCabinetCleanup2, caption: "Active equipment re-racked, patch leads being dressed" },
        { src: franchiseCabinetCleanup3, caption: "Final rebuild — labelled, dressed and serviceable" },
      ],
    },
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

export const LATEST_PROJECT_SLUGS = [
  "tcts-autobody-randburg",
  "afro-muse-hair-and-beauty",
  "angolan-mining-business-forum",
  "impala-platinum-laptop-rollout",
  "campuskey-port-elizabeth",
  "sapath-network-infrastructure",
  "catch-22-connectivity",
  "nomination-italy-waterfront",
  "st-josephs-marist-cape-town",
  "tiger-brands-boardroom-technology",
  "sun-international-head-office",
  "capital-air-randburg",
] as const;