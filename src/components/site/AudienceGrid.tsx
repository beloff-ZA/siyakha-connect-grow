import { Link } from "react-router-dom";
import { Building2, Briefcase, GraduationCap, Shield, ArrowUpRight } from "lucide-react";

const AUDIENCES = [
  {
    to: "/who-we-serve/estates",
    icon: Building2,
    label: "Estates",
    pain: "Community safety, HOA buy-in, and one signal-of-truth across gates, cameras, fibre and comms — without five vendors blaming each other.",
    prominent: true,
  },
  {
    to: "/who-we-serve/commercial",
    icon: Briefcase,
    label: "Commercial",
    pain: "Uptime that tenants can feel, compliance you can produce on demand, and a network that scales with the lease.",
    prominent: true,
  },
  {
    to: "/who-we-serve/schools",
    icon: GraduationCap,
    label: "Schools",
    pain: "Child safety, structured access control, and technology procured to fit a school budget cycle — not a corporate one.",
    prominent: true,
  },
  {
    to: "/who-we-serve/government",
    icon: Shield,
    label: "Government & Border",
    pain: "Large-scale perimeter, radar-verified intrusion detection, and command-centre operations built to government procurement standards.",
    prominent: false,
  },
];

const AudienceGrid = () => (
  <section className="bg-background border-b border-foreground/10">
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="max-w-3xl mb-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
          Who we work with
        </p>
        <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
          Four buyers.
          <br />
          <span className="italic font-extralight">Four distinct problems.</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
        {AUDIENCES.filter((a) => a.prominent).map(({ to, icon: Icon, label, pain }) => (
          <Link
            key={to}
            to={to}
            className="group bg-background p-8 md:p-10 hover:bg-foreground/[0.04] transition-colors flex flex-col"
          >
            <Icon className="w-8 h-8 text-foreground mb-8" strokeWidth={1.25} />
            <div className="font-display text-2xl md:text-3xl text-foreground mb-4 tracking-tight">
              {label}
            </div>
            <p className="text-[13px] md:text-sm text-foreground/70 leading-relaxed flex-1">{pain}</p>
            <div className="mt-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 group-hover:text-foreground">
              How we serve {label.toLowerCase()} <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
      {AUDIENCES.filter((a) => !a.prominent).map(({ to, icon: Icon, label, pain }) => (
        <Link
          key={to}
          to={to}
          className="group mt-px flex flex-col md:flex-row md:items-center gap-6 bg-background border border-foreground/15 p-6 md:p-8 hover:bg-foreground/[0.04] transition-colors"
        >
          <div className="flex items-center gap-4 md:w-1/3">
            <Icon className="w-6 h-6 text-foreground" strokeWidth={1.25} />
            <div className="font-display text-xl text-foreground tracking-tight">{label}</div>
          </div>
          <p className="text-[13px] text-foreground/70 leading-relaxed flex-1">{pain}</p>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 group-hover:text-foreground">
            Specialist offering <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      ))}
    </div>
  </section>
);

export default AudienceGrid;