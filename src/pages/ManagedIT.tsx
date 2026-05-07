import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import LeadMagnetDialog from "@/components/leads/LeadMagnetDialog";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  HeadphonesIcon,
  Activity,
  ShieldCheck,
  Cloud,
  HardDrive,
  Network,
  FileSignature,
  Zap,
  CheckCircle2,
  Building2,
  Layers,
  Sparkles,
  Wrench,
  ArrowLeft,
} from "lucide-react";

const CAPABILITIES = [
  { icon: HeadphonesIcon, title: "Outsourced IT Department", body: "We become your full IT department — from helpdesk and procurement to strategy and vendor management." },
  { icon: Activity, title: "Remote Monitoring", body: "24/7 proactive monitoring of servers, networks, endpoints and security devices — issues fixed before you notice." },
  { icon: ShieldCheck, title: "Cybersecurity", body: "Endpoint protection, EDR, email security, patching and user awareness — layered defence as standard." },
  { icon: Cloud, title: "Microsoft 365", body: "Tenant setup, licensing, mailbox migrations, SharePoint, Teams, Intune and security baseline configuration." },
  { icon: HardDrive, title: "Backup & Recovery", body: "Encrypted on-site and cloud backups with tested restore plans — your data survives anything." },
  { icon: Network, title: "Network Management", body: "Switching, routing, Wi-Fi, firewalls and VPNs — engineered, monitored and documented end-to-end." },
  { icon: FileSignature, title: "SLA Support", body: "Defined response and resolution times, monthly reporting, and a single accountable point of contact." },
];

const PILLARS = [
  { icon: Zap, title: "Fast Response Times", body: "Rapid support and proactive monitoring keep your downtime to a minimum." },
  { icon: Layers, title: "End-to-End Solutions", body: "One partner for networking, cloud, CCTV, access control and ongoing support." },
  { icon: Building2, title: "Scalable Infrastructure", body: "Built to grow as your business and sites multiply — never re-architected from scratch." },
  { icon: CheckCircle2, title: "Industry Experience", body: "Schools, security, commercial and industrial environments — we've delivered across all of them." },
  { icon: Wrench, title: "Professional Installations", body: "Clean, structured, enterprise-grade deployments you'll be proud to show off." },
  { icon: Sparkles, title: "Future-Ready Technology", body: "AI-powered systems and modern cloud infrastructure that won't be obsolete in two years." },
];

const PLANS: { name: string; tag: string; ideal: string; features: string[] }[] = [
  {
    name: "Essential Support",
    tag: "Small offices",
    ideal: "Ideal for teams of 1–15 needing reliable day-to-day IT cover.",
    features: [
      "Remote support during business hours",
      "Antivirus & endpoint monitoring",
      "Basic network support",
      "Monthly health reporting",
      "Single point of contact",
    ],
  },
  {
    name: "Professional Support",
    tag: "Growing businesses",
    ideal: "For 15–80 staff teams scaling fast and needing onsite cover.",
    features: [
      "Remote & onsite support",
      "Backup monitoring & restore drills",
      "Microsoft 365 administration",
      "Firewall & Wi-Fi management",
      "Priority response SLA",
    ],
  },
  {
    name: "Enterprise Support",
    tag: "Multi-site operators",
    ideal: "For multi-site businesses, schools and campuses needing managed IT at scale.",
    features: [
      "Dedicated IT account management",
      "Infrastructure & uptime monitoring",
      "Advanced security & compliance",
      "CCTV & access-control integration",
      "Strategic IT roadmap & budgeting",
    ],
  },
];

const WHATSAPP_URL = buildWhatsAppUrl(
  "+27815012993",
  "Hi Siyakha, I'd like to book a Free IT Assessment for managed IT services."
);

const ManagedIT = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Managed IT Services",
    provider: {
      "@type": "Organization",
      name: "Siyakha Technology",
      telephone: "+27 81 501 2993",
      email: "nikita@siyakhatechnology.co.za",
      url: "https://siyakhatechnology.co.za",
    },
    areaServed: { "@type": "Country", name: "South Africa" },
    offers: PLANS.map((p) => ({
      "@type": "Offer",
      name: p.name,
      description: p.ideal,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteSEO
        title="Managed IT Services in South Africa | Siyakha Technology"
        description="Outsource your IT department to Siyakha Technology — remote monitoring, cybersecurity, Microsoft 365, backups, network management and SLA-backed support across South Africa."
        path="/managed-it"
        jsonLd={jsonLd}
      />
      <Header />

      {/* HERO */}
      <section className="relative bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-24 md:py-32">
          <div className="max-w-4xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60 hover:text-foreground mb-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back home
            </Link>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-5">
              Managed IT · Outsourced IT Department · South Africa
            </p>
            <h1 className="font-display font-light text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] text-foreground leading-[1.02]">
              Managed IT Services
              <br />
              for <span className="italic font-extralight">modern businesses</span>.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-foreground/75 leading-relaxed max-w-2xl">
              Stop firefighting IT. Siyakha Technology becomes your outsourced IT department —
              proactively monitoring, securing and supporting every device, network and cloud
              service your business depends on.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <LeadMagnetDialog
                kind="Free IT Infrastructure Review"
                context="Managed IT page hero"
                trigger={
                  <button className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/90 transition-colors">
                    Book a Free IT Assessment
                  </button>
                }
              />
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-foreground/30 text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/[0.04] transition-colors"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="relative bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
              What's included
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
              Everything an in-house IT team would do —
              <br />
              <span className="italic font-extralight">delivered as a service</span>.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
            {CAPABILITIES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-background p-6 md:p-8 hover:bg-foreground/[0.03] transition-colors">
                <Icon className="w-8 h-8 text-foreground mb-6" strokeWidth={1.25} />
                <div className="font-display text-lg md:text-xl text-foreground mb-3 tracking-tight">{title}</div>
                <p className="text-[13px] text-foreground/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="relative bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
              Managed IT Plans · Predictable Support
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
              Predictable IT support
              <br />
              for <span className="italic font-extralight">growing businesses</span>.
            </h2>
            <p className="mt-6 text-base md:text-lg text-foreground/70 leading-relaxed max-w-2xl">
              Three tiers tailored to where your business is now — and built to scale as you grow.
              We'll size the right plan after a free site review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
            {PLANS.map((p) => (
              <div key={p.name} className="bg-background p-7 md:p-9 flex flex-col">
                <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/55">{p.tag}</p>
                <h3 className="font-display text-2xl md:text-3xl font-light text-foreground mt-3 tracking-tight">
                  {p.name}
                </h3>
                <p className="mt-3 text-sm text-foreground/65 leading-relaxed">{p.ideal}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[13px] text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <LeadMagnetDialog
                  kind="Managed IT Plan — Pricing Request"
                  context={`Plan interest: ${p.name}`}
                  trigger={
                    <button className="mt-8 w-full bg-foreground text-background py-3 text-[11px] uppercase tracking-[0.24em] hover:bg-foreground/90 transition-colors">
                      Request Pricing
                    </button>
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY SIYAKHA */}
      <section className="relative bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
              Why Siyakha
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
              Why businesses choose <span className="italic font-extralight">Siyakha</span>.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-background p-6 md:p-8">
                <Icon className="w-7 h-7 text-foreground mb-5" strokeWidth={1.25} />
                <div className="font-display text-lg text-foreground mb-2 tracking-tight">{title}</div>
                <p className="text-[13px] text-foreground/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative bg-foreground text-background">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">
              Free IT Assessment · No Obligation
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
              Let's review your IT —
              <br />
              and show you what's <span className="italic font-extralight">possible</span>.
            </h2>
            <p className="mt-6 text-base md:text-lg text-background/75 leading-relaxed max-w-2xl">
              Book a free IT infrastructure assessment. We'll audit your network, devices, security
              posture and backups — and give you a written plan with no obligation.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <LeadMagnetDialog
                kind="Free IT Infrastructure Review"
                context="Managed IT page final CTA"
                trigger={
                  <button className="inline-flex items-center gap-2 bg-background text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/90 transition-colors">
                    Book Free Assessment
                  </button>
                }
              />
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-background/40 text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/10 transition-colors"
              >
                WhatsApp 081 501 2993
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ManagedIT;