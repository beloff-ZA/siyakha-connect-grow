import { Award, UserCheck, MapPin, Layers, Wrench } from "lucide-react";
import { BRAND } from "@/lib/brand";

const POINTS = [
  {
    icon: Award,
    title: "Level 1 B-BBEE SMME",
    body: "Procurement-friendly for corporates, schools and public-sector buyers that need Level 1 spend.",
  },
  {
    icon: UserCheck,
    title: "Owner-led response",
    body: `${BRAND.ownerReplyLine} You deal with the person accountable for the work, not a call queue.`,
  },
  {
    icon: MapPin,
    title: "Johannesburg & Durban capacity",
    body: "Engineers who travel to site across Johannesburg and Sandton, and Durban and KwaZulu-Natal.",
  },
  {
    icon: Layers,
    title: "One accountable partner",
    body: "IT, networks, security, digital and automation under one scope — no vendor triangulation when something breaks.",
  },
  {
    icon: Wrench,
    title: "Real engineers, real delivery",
    body: "Our own installation and support engineers, with documented handover on every project.",
  },
];

/** Verified trust positioning only — no invented clients, ratings or statistics. */
const TrustBand = () => (
  <section className="bg-background border-b border-foreground/10">
    <div className="container mx-auto px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-3xl mb-12">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
          Why {BRAND.short}
        </p>
        <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
          A partner you can
          <br />
          <span className="italic font-extralight">actually hold accountable.</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
        {POINTS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-background p-6 md:p-8">
            <Icon className="w-7 h-7 text-foreground mb-5" strokeWidth={1.25} />
            <h3 className="font-display text-lg text-foreground mb-2 tracking-tight">{title}</h3>
            <p className="text-[13px] text-foreground/70 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBand;
