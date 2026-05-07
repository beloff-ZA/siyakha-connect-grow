import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const TIERS = [
  { name: "Essential", tag: "Small offices", points: ["Remote support", "Endpoint monitoring", "Monthly reporting"] },
  { name: "Professional", tag: "Growing businesses", points: ["Remote & onsite support", "Microsoft 365 admin", "Priority SLA"] },
  { name: "Enterprise", tag: "Multi-site operators", points: ["Dedicated IT management", "Advanced security", "Strategic IT planning"] },
];

const ManagedItPlansPreview = () => (
  <section className="bg-background border-t border-foreground/10">
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="max-w-3xl mb-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
          Managed IT Plans
        </p>
        <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
          Predictable IT support
          <br />
          for <span className="italic font-extralight">growing businesses</span>.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
        {TIERS.map((t) => (
          <div key={t.name} className="bg-background p-7 md:p-9 flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/55">{t.tag}</p>
            <h3 className="font-display text-2xl md:text-3xl font-light text-foreground mt-3 tracking-tight">
              {t.name} Support
            </h3>
            <ul className="mt-6 space-y-3 flex-1">
              {t.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[13px] text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" strokeWidth={1.5} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Link
          to="/managed-it"
          className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/90 transition-colors"
        >
          Explore Managed IT Plans <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>
);

export default ManagedItPlansPreview;