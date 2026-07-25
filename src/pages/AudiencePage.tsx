import { Link, useParams, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import WhySiyakhaBand from "@/components/site/WhySiyakhaBand";
import SchoolProductsBand from "@/components/site/SchoolProductsBand";
import { ArrowLeft, ArrowUpRight, Building2, Briefcase, GraduationCap, Shield } from "lucide-react";
import { CAPABILITIES } from "@/content/capabilities";
import { getCaseStudy } from "@/content/caseStudies";

type Slug = "estates" | "commercial" | "schools" | "government";

interface AudienceData {
  slug: Slug;
  label: string;
  icon: typeof Building2;
  hero: { lead: string; italic: string };
  intro: string;
  problems: { title: string; body: string }[];
  capabilitySlugs: string[];
  caseStudySlug?: string;
}

const AUDIENCE_DATA: Record<Slug, AudienceData> = {
  estates: {
    slug: "estates",
    label: "Estates",
    icon: Building2,
    hero: { lead: "Estates. One partner —", italic: "gate to fibre to command centre" },
    intro:
      "Residential estates and mixed-use developments deserve infrastructure that behaves like one system, not five contracts. We design, build and operate it end-to-end so the estate manager has one number to call — not five.",
    problems: [
      { title: "Community safety", body: "Verified alarms and command-centre dispatch — not just a wall of recorded footage nobody reviews." },
      { title: "HOA buy-in", body: "Clear scope, clean installations, and reporting that reads well in an AGM." },
      { title: "One accountable partner", body: "No vendor triangulation when a camera goes dark or a link drops at 2am." },
    ],
    capabilitySlugs: ["smart-estates", "ai-surveillance", "fibre-connectivity", "command-centre"],
    caseStudySlug: "exmile-student-accommodation",
  },
  commercial: {
    slug: "commercial",
    label: "Commercial",
    icon: Briefcase,
    hero: { lead: "Commercial. Uptime tenants", italic: "can feel" },
    intro:
      "Office parks, franchise groups, industrial sites and retail — infrastructure engineered for lease-length reliability, tenant experience, and compliance evidence you can hand to insurers on demand.",
    problems: [
      { title: "Uptime that scales with the lease", body: "Networks and security systems designed to grow with the tenant mix — not re-architected each renewal." },
      { title: "Tenant experience", body: "Guest WiFi, access control and comms that make the building feel modern, not bolted-on." },
      { title: "Compliance you can produce", body: "Audit-ready logs, footage, and reporting when insurers or regulators come knocking." },
    ],
    capabilitySlugs: ["ai-surveillance", "fibre-connectivity", "command-centre", "smart-estates"],
    caseStudySlug: "franchise-firewall-wifi-rollout",
  },
  schools: {
    slug: "schools",
    label: "Schools",
    icon: GraduationCap,
    hero: { lead: "Schools. Child safety —", italic: "and a budget cycle that works" },
    intro:
      "Primary through high school infrastructure — access control, monitored CCTV, structured cabling and computer-room fit-outs, procured to fit a school's approval and budget cycle rather than a corporate one.",
    problems: [
      { title: "Child safety first", body: "Access control at every gate, monitored perimeter, and verified alarms — not just cameras on a wall." },
      { title: "School budget cycles", body: "Phased rollouts and financing shaped around governing-body approval, not enterprise procurement." },
      { title: "Classroom-to-cabinet", body: "Computer rooms, WiFi, structured cabling and CCTV as one project — clean handover, staff trained." },
    ],
    capabilitySlugs: ["ai-surveillance", "fibre-connectivity", "smart-estates"],
    caseStudySlug: "marist-brothers-linmeyer",
  },
  government: {
    slug: "government",
    label: "Government & Border",
    icon: Shield,
    hero: { lead: "Government & Border.", italic: "Perimeter, verified in seconds" },
    intro:
      "Large-scale perimeter and border intrusion detection — radar plus thermal PTZ plus AI classification, dispatched through 24/7 command-centre operations. Built to government procurement and reporting standards.",
    problems: [
      { title: "5km radar-verified detection", body: "Long-range ground surveillance radar fused with thermal PTZ optics — a target is classified before an alarm is raised." },
      { title: "Procurement discipline", body: "Tender-ready scope, phased delivery, and formal reporting the way government agencies expect it." },
      { title: "24/7 command operations", body: "Verified alarms dispatched to on-site response or your existing operations centre." },
    ],
    capabilitySlugs: ["border-radar", "ai-surveillance", "command-centre", "fibre-connectivity"],
  },
};

const AudiencePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? AUDIENCE_DATA[slug as Slug] : undefined;
  if (!data) return <Navigate to="/" replace />;
  const Icon = data.icon;
  const caseStudy = data.caseStudySlug ? getCaseStudy(data.caseStudySlug) : undefined;
  const capabilities = CAPABILITIES.filter((c) => data.capabilitySlugs.includes(c.slug));

  return (
    <div className="min-h-screen bg-background">
      <SiteSEO
        title={`${data.label} — Siyakha Interlink`}
        description={data.intro}
        path={`/who-we-serve/${data.slug}`}
      />
      <Header />

      <section className="bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-24 md:py-32">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60 hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Icon className="w-6 h-6 text-foreground" strokeWidth={1.25} />
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60">
                Who we serve · {data.label}
              </p>
            </div>
            <h1 className="font-display font-light text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] text-foreground leading-[1.02]">
              {data.hero.lead}
              <br />
              <span className="italic font-extralight">{data.hero.italic}</span>.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-foreground/75 leading-relaxed max-w-2xl">
              {data.intro}
            </p>
            <div className="mt-10">
              <Link
                to={`/?type=${data.slug}#qualify`}
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/90"
              >
                Talk to us — {data.label.toLowerCase()} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
              What you're solving
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
              The specific problems for <span className="italic">{data.label.toLowerCase()}</span>.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
            {data.problems.map((p) => (
              <div key={p.title} className="bg-background p-6 md:p-8">
                <div className="font-display text-lg md:text-xl text-foreground mb-3 tracking-tight">
                  {p.title}
                </div>
                <p className="text-[13px] text-foreground/70 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground text-background">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">
              Capabilities we bring
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
              What we build for {data.label.toLowerCase()}.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-background/15 border border-background/15">
            {capabilities.map(({ slug: s, label, teaser, icon: CIcon }) => (
              <Link
                key={s}
                to={`/capabilities/${s}`}
                className="group bg-foreground p-6 md:p-8 hover:bg-background/[0.06] transition-colors flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <CIcon className="w-7 h-7 text-background" strokeWidth={1.25} />
                  <ArrowUpRight className="h-4 w-4 text-background/40 group-hover:text-background transition-colors" />
                </div>
                <div className="font-display text-xl text-background mb-3 tracking-tight">{label}</div>
                <p className="text-[13px] text-background/70 leading-relaxed">{teaser}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {caseStudy && (
        <section className="bg-background border-b border-foreground/10">
          <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-8">
              Relevant case study
            </p>
            <Link
              to={`/case-studies/${caseStudy.slug}`}
              className="group grid md:grid-cols-2 gap-8 md:gap-12 items-center border border-foreground/15 p-6 md:p-10 hover:bg-foreground/[0.03] transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden bg-foreground/5">
                <img
                  src={caseStudy.hero}
                  alt={caseStudy.title}
                  className="w-full h-full object-cover grayscale group-hover:scale-[1.03] transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/50 mb-3">
                  {caseStudy.industry} · {caseStudy.location}
                </p>
                <div className="font-display text-2xl md:text-3xl text-foreground tracking-tight leading-snug mb-4">
                  {caseStudy.title}
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">{caseStudy.summary}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 group-hover:text-foreground">
                  Read the case study <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      <WhySiyakhaBand />
      <Footer />
    </div>
  );
};

export default AudiencePage;