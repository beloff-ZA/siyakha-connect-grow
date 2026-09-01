import {
  Stethoscope,
  Scale,
  GraduationCap,
  BedDouble,
  UtensilsCrossed,
  Building2,
  type LucideIcon,
} from "lucide-react";

export interface Industry {
  slug: string;
  label: string
  icon: LucideIcon;
  teaser: string;
  intro: string;
  /** Concrete problems Siyakha solves for this buyer. */
  problems: string[];
  /** What we typically deliver. */
  delivers: string[];
  leadService: string;
  /** Preselected enquiry location, when the audience is region-specific. */
  leadLocation?: string;
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "medical-practices",
    label: "Doctors & Medical Practices",
    icon: Stethoscope,
    teaser:
      "Practice software that stays up, patient data backed up, reception phones answered and consulting rooms connected.",
    intro:
      "Practices lose consulting time whenever the practice management system, printer or internet fails. We take ownership of the whole stack so reception and clinicians can work.",
    problems: [
      "Practice management software freezing or losing connection mid-consult",
      "Patient records with no tested backup or recovery plan",
      "Reception overwhelmed by phone calls and missed appointment requests",
      "Wi-Fi that does not reach consulting rooms or the waiting area",
      "No visibility over who accessed the practice network or premises",
    ],
    delivers: [
      "Managed IT with a named response contact",
      "Backups with restore testing",
      "Cabling and Wi-Fi covering reception, rooms and waiting areas",
      "AI voice agent for call answering and appointment booking",
      "CCTV and access control for the practice",
    ],
    leadService: "Managed IT Services",
  },
  {
    slug: "professional-firms",
    label: "Lawyers & Professional Firms",
    icon: Scale,
    teaser:
      "Secure email, document control, reliable backups and IT support that understands billable time.",
    intro:
      "For attorneys, accountants and consultancies, downtime is billable time lost and email security is a client-trust issue. We keep the firm working and the data controlled.",
    problems: [
      "Email compromise and invoice fraud attempts on client correspondence",
      "Document storage spread across laptops, drives and personal accounts",
      "No reliable backup of matter files",
      "Slow IT response during court or deadline pressure",
      "Boardroom and meeting-room technology that fails in front of clients",
    ],
    delivers: [
      "Microsoft 365 with hardened email security",
      "Managed backups and file access control",
      "Monthly managed IT with agreed response times",
      "Office cabling, Wi-Fi and boardroom connectivity",
      "Workflow and document automation for repetitive admin",
    ],
    leadService: "Managed IT Services",
  },
  {
    slug: "schools",
    label: "Schools",
    icon: GraduationCap,
    teaser:
      "Campus Wi-Fi, classroom technology, safeguarding cameras and ICT budgeted to a school cycle.",
    intro:
      "Schools need technology that survives daily use by hundreds of learners, and procurement that fits a school budget cycle rather than a corporate one.",
    problems: [
      "Wi-Fi that collapses when a full class connects at once",
      "Computer labs and classroom devices with no support plan",
      "Safeguarding gaps at gates, corridors and perimeters",
      "Admin office systems and reports failing at term-end",
      "Cabling added ad hoc over the years with no documentation",
    ],
    delivers: [
      "Campus-wide Wi-Fi designed for classroom density",
      "Structured cabling, racks and documented networks",
      "CCTV and access control for learner safety",
      "Managed IT for admin offices and labs",
      "Phased rollouts aligned to school budget cycles",
    ],
    leadService: "School ICT & Wi-Fi",
  },
  {
    slug: "student-accommodation",
    label: "Student Accommodation",
    icon: BedDouble,
    teaser:
      "High-density resident Wi-Fi, fibre risers, access control and cameras across every block.",
    intro:
      "Residents judge accommodation on connectivity and safety. We build the fibre, Wi-Fi and security layer that keeps buildings full and complaints low.",
    problems: [
      "Resident Wi-Fi complaints and evening congestion",
      "Fibre and riser infrastructure that was never designed for the building",
      "Uncontrolled access at entrances and lifts",
      "Cameras installed but no usable footage when incidents happen",
      "Multiple vendors with nobody accountable for the whole building",
    ],
    delivers: [
      "Fibre backbone, risers and per-block distribution",
      "High-density Wi-Fi for rooms and common areas",
      "Access control at entrances and floors",
      "CCTV with retention planned for the site",
      "One accountable partner across the whole property",
    ],
    leadService: "Student Accommodation Connectivity",
  },
  {
    slug: "restaurants",
    label: "Restaurants & Hospitality",
    icon: UtensilsCrossed,
    teaser:
      "POS uptime, guest Wi-Fi, card connectivity, cameras over tills and support during service.",
    intro:
      "In hospitality, a network fault during service costs turnover immediately. We build connectivity and security that holds up on a full Friday night.",
    problems: [
      "Point-of-sale and card machines dropping offline mid-service",
      "Guest Wi-Fi competing with the till network",
      "No camera coverage over tills, stock or delivery areas",
      "No internet failover when the line goes down",
      "Support that is unreachable outside office hours",
    ],
    delivers: [
      "Separated POS, staff and guest networks",
      "Branded guest Wi-Fi with a landing page",
      "Internet failover and multi-site links",
      "CCTV over tills, stores and back-of-house",
      "Ongoing support arrangements suited to service hours",
    ],
    leadService: "Restaurant Technology",
  },
  {
    slug: "offices",
    label: "Offices & Owner-Led Businesses",
    icon: Building2,
    teaser:
      "New office fit-outs, moves, Microsoft 365, monthly support and automation for lean teams.",
    intro:
      "Owner-led businesses do not have an IT department. We become it — from the office move and cabling through to monthly support and the automation that removes admin.",
    problems: [
      "Office moves and fit-outs with no plan for cabling or connectivity",
      "Nobody responsible for laptops, email, licences or backups",
      "Growth outpacing a network that was set up for five people",
      "Repetitive admin consuming owner and staff time",
      "Enquiries and calls being missed during busy periods",
    ],
    delivers: [
      "Office cabling, Wi-Fi and comms rack setup",
      "Microsoft 365, email and device management",
      "Monthly managed IT with field support",
      "Website, hosting and business email on your domain",
      "AI enquiry handling and workflow automation",
    ],
    leadService: "Managed IT Services",
  },
];

export const getIndustry = (slug: string): Industry | undefined =>
  INDUSTRIES.find((i) => i.slug === slug);
