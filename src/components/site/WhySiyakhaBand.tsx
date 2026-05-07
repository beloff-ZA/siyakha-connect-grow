import { Zap, Layers, Building2, CheckCircle2, Wrench, Sparkles } from "lucide-react";

const PILLARS = [
  { icon: Zap, title: "Fast Response Times", body: "Rapid support and proactive monitoring keep your downtime to a minimum." },
  { icon: Layers, title: "End-to-End Solutions", body: "One partner for networking, cloud, CCTV, access control and ongoing support." },
  { icon: Building2, title: "Scalable Infrastructure", body: "Built to grow as your business and sites multiply — never re-architected from scratch." },
  { icon: CheckCircle2, title: "Industry Experience", body: "Schools, security, commercial and industrial environments — we've delivered across all of them." },
  { icon: Wrench, title: "Professional Installations", body: "Clean, structured, enterprise-grade deployments you'll be proud to show off." },
  { icon: Sparkles, title: "Future-Ready Technology", body: "AI-powered systems and modern cloud infrastructure that won't be obsolete in two years." },
];

const WhySiyakhaBand = () => (
  <section className="bg-background border-t border-foreground/10">
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
);

export default WhySiyakhaBand;