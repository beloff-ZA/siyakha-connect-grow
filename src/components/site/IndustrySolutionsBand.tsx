import { Link } from "react-router-dom";
import { GraduationCap, Briefcase, Shield, BedDouble, Wrench, ArrowRight } from "lucide-react";

const INDUSTRIES = [
  {
    icon: GraduationCap,
    title: "Schools & Education",
    body: "Reliable classroom networking, Wi-Fi, surveillance, learner management and on-site IT support.",
    cta: "Explore School Solutions",
    to: "/schools",
  },
  {
    icon: Briefcase,
    title: "Business & Corporate",
    body: "Managed IT, cybersecurity, cloud, backup and network infrastructure for growing teams.",
    cta: "Business IT Solutions",
    to: "/managed-it",
  },
  {
    icon: Shield,
    title: "Security & Surveillance",
    body: "AI-powered CCTV, access control, remote monitoring and perimeter security solutions.",
    cta: "Security Solutions",
    to: "/security-surveillance",
  },
  {
    icon: BedDouble,
    title: "Student Accommodation",
    body: "High-density Wi-Fi, access control, CCTV and smart-building infrastructure.",
    cta: "Accommodation Solutions",
    to: "/contact",
  },
  {
    icon: Wrench,
    title: "Panel Beating & Automotive",
    body: "Cloud systems, workstations, VoIP and operations support for busy workshops.",
    cta: "Automotive Solutions",
    to: "/contact",
  },
];

const IndustrySolutionsBand = () => (
  <section className="bg-background border-t border-foreground/10">
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="max-w-3xl mb-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
          Industry Solutions
        </p>
        <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
          Technology solutions
          <br />
          built for <span className="italic font-extralight">your industry</span>.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
        {INDUSTRIES.map(({ icon: Icon, title, body, cta, to }) => (
          <Link
            key={title}
            to={to}
            className="group bg-background p-7 md:p-9 hover:bg-foreground/[0.04] transition-colors flex flex-col"
          >
            <Icon className="w-8 h-8 text-foreground mb-6" strokeWidth={1.25} />
            <div className="font-display text-xl md:text-2xl text-foreground mb-3 tracking-tight">{title}</div>
            <p className="text-[13px] text-foreground/70 leading-relaxed flex-1">{body}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground border-b border-foreground/30 group-hover:border-foreground pb-1 self-start">
              {cta}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default IndustrySolutionsBand;