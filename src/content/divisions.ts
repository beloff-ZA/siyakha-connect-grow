import { Headphones, Network, ShieldCheck, Globe, Bot, type LucideIcon } from "lucide-react";

export interface Division {
  slug: string;
  /** Short nav/card label. */
  label: string;
  /** Full public name. */
  title: string;
  icon: LucideIcon;
  teaser: string;
  intro: string;
  /** Concrete deliverables. */
  offers: string[];
  /** Problems this division solves, in the buyer's words. */
  outcomes: string[];
  /** Service value used to preselect the enquiry form. */
  leadService: string;
  ctaLabel: string;
  /** Optional related existing page. */
  related?: { to: string; label: string }[];
  /** Shown on the Security division only. */
  capabilityNote?: string;
}

export const DIVISIONS: Division[] = [
  {
    slug: "managed-it",
    label: "Managed IT",
    title: "Managed IT",
    icon: Headphones,
    teaser:
      "Monthly IT support with remote helpdesk, Microsoft 365, backups, cybersecurity and engineers who come to site.",
    intro:
      "A fixed monthly IT service for growing businesses and professional practices — so someone is accountable for your computers, email, backups and security every day, not only when something breaks.",
    offers: [
      "Monthly support contracts with agreed response times",
      "Remote IT helpdesk for staff issues",
      "Microsoft 365 setup, licensing, mailboxes and migration",
      "Backups and recovery testing for business data",
      "Cybersecurity: endpoint protection, patching, email security",
      "Field support engineers on site in Johannesburg and Durban",
    ],
    outcomes: [
      "Staff stop losing hours to IT problems nobody owns",
      "Email, files and backups are handled by one accountable team",
      "Security and patching happen on a schedule, not after an incident",
    ],
    leadService: "Managed IT Services",
    ctaLabel: "Get IT help",
    related: [{ to: "/managed-it", label: "Managed IT service detail" }],
  },
  {
    slug: "projects",
    label: "Projects",
    title: "Technology Projects",
    icon: Network,
    teaser:
      "Structured cabling, business Wi-Fi, fibre, racks, SD-WAN and smart-hands engineers — designed, installed and documented.",
    intro:
      "Project delivery for new offices, refurbishments, schools, student accommodation and multi-site properties — cabling, networks and connectivity installed properly and handed over with documentation.",
    offers: [
      "Structured cabling and data points",
      "Business and campus Wi-Fi design and installation",
      "Fibre links, last-mile and building risers",
      "Comms racks, patching, labelling and power",
      "SD-WAN, failover and multi-site networking",
      "Smart-hands and field engineers for vendors and MSPs",
    ],
    outcomes: [
      "A network that is designed once instead of patched forever",
      "Wi-Fi that actually works in every room, not just near the router",
      "A documented installation you can hand to any future engineer",
    ],
    leadService: "Office Networking & Structured Cabling",
    ctaLabel: "Request a site assessment",
    related: [
      { to: "/cloud-networking", label: "Networking & connectivity" },
      { to: "/projects", label: "See our projects" },
      { to: "/partner-engineers", label: "Smart-hands engineers" },
    ],
  },
  {
    slug: "security",
    label: "Security",
    title: "Commercial Security",
    icon: ShieldCheck,
    teaser:
      "Commercial CCTV, access control, alarms and monitoring — delivered by our Siyakha Interlink infrastructure and security capability.",
    intro:
      "Commercial security for businesses, schools, accommodation and multi-site properties — cameras, access control and alarms specified for the site, installed by our own engineers and integrated with the network we build.",
    offers: [
      "Commercial CCTV with recording and retention planning",
      "Access control for gates, doors and staff areas",
      "Alarms, detection and intercom integration",
      "Monitoring and remote viewing setup",
      "Camera and network health checks on existing sites",
    ],
    outcomes: [
      "Footage that exists and is usable when you actually need it",
      "Controlled access instead of uncontrolled keys",
      "Security and network handled by the same accountable team",
    ],
    leadService: "Commercial CCTV & Access Control",
    ctaLabel: "Request a security assessment",
    capabilityNote:
      "Siyakha Interlink is our specialist infrastructure and security capability — the team that designs perimeter, surveillance and command-centre infrastructure on larger sites.",
    related: [{ to: "/security-surveillance", label: "Security & surveillance detail" }],
  },
  {
    slug: "digital",
    label: "Digital",
    title: "Digital Services",
    icon: Globe,
    teaser:
      "Websites, hosting, domains, business email, SEO and ongoing maintenance for owner-led businesses.",
    intro:
      "The digital front door for your business — a website that loads fast and converts, hosting and domains that are properly managed, business email that is not a free address, and maintenance so it stays current.",
    offers: [
      "Business websites and landing pages",
      "Hosting, domains and DNS management",
      "Business email setup on your own domain",
      "SEO foundations and local search visibility",
      "Ongoing maintenance, updates and content changes",
    ],
    outcomes: [
      "Customers find you and can contact you in one step",
      "Your domain, email and hosting stop being scattered across vendors",
      "Someone maintains the site instead of leaving it to age",
    ],
    leadService: "Websites, Hosting & Domains",
    ctaLabel: "Get a website quote",
    related: [{ to: "/regional-services", label: "Web design & development" }],
  },
  {
    slug: "ai-solutions",
    label: "AI & Process",
    title: "AI & Process Solutions",
    icon: Bot,
    teaser:
      "Voice agents, enquiry handling, appointment booking, CRM follow-up and workflow or document automation.",
    intro:
      "Practical automation for businesses that are losing enquiries and time — an AI agent that answers and logs calls, handles enquiries, books appointments and follows up, plus workflow and document automation behind it.",
    offers: [
      "AI voice agents for calls and after-hours enquiries",
      "Enquiry handling and qualification",
      "Appointment booking and reminders",
      "CRM follow-up automation",
      "Workflow automation between the systems you already use",
      "Document processing and data capture",
    ],
    outcomes: [
      "Missed calls stop becoming lost revenue",
      "Enquiries get answered and logged the same day",
      "Admin work that repeats every week runs itself",
    ],
    leadService: "Business Process & AI Solutions",
    ctaLabel: "Explore AI solutions",
    related: [{ to: "/capabilities/ai-agents", label: "AI agents for business" }],
  },
];

export const getDivision = (slug: string): Division | undefined =>
  DIVISIONS.find((d) => d.slug === slug);
