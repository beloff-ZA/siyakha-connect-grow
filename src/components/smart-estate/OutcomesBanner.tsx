import {
  Wrench,
  Gauge,
  ShieldCheck,
  TimerReset,
  FileCheck2,
  MessagesSquare,
  Eye,
  HeartHandshake,
} from "lucide-react";

const OUTCOMES = [
  {
    icon: Wrench,
    title: "Fewer Breakdowns",
    body: "Engineered infrastructure, monitored 24/7 — issues are caught and resolved before they interrupt your operation.",
  },
  {
    icon: Gauge,
    title: "Faster Operations",
    body: "Networks, devices and people that move at the speed your business demands — no more waiting on slow systems.",
  },
  {
    icon: ShieldCheck,
    title: "Better Security",
    body: "AI surveillance, access control and hardened networks protecting your people, premises and data — end to end.",
  },
  {
    icon: TimerReset,
    title: "Lower Downtime",
    body: "Dual-WAN, 5G failover and remote engineers keep you online — even when one line, one device or one site fails.",
  },
  {
    icon: FileCheck2,
    title: "Compliance Ready",
    body: "POPIA, ICASA and industry standards built into how we design, deploy and document every site we touch.",
  },
  {
    icon: MessagesSquare,
    title: "Better Communication",
    body: "VoIP, intercoms, video and collaboration tools unified — so your teams, tenants and customers stay connected.",
  },
  {
    icon: Eye,
    title: "Total Visibility",
    body: "One command view across cameras, networks, sites and tickets — you see everything, everywhere, in real time.",
  },
  {
    icon: HeartHandshake,
    title: "Peace of Mind",
    body: "One accountable partner for build, design and technology — engineered with intention, delivered with faith.",
  },
];

const OutcomesBanner = () => {
  return (
    <section className="relative bg-background border-t border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="max-w-3xl mb-14 md:mb-20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
            Outcomes · What You Actually Get
          </p>
          <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-foreground leading-[1.05]">
            We don't sell hardware.
            <br />
            We sell <span className="italic font-extralight">results</span>.
          </h2>
          <p className="mt-6 text-base md:text-lg text-foreground/75 leading-relaxed max-w-2xl">
            Every cable pulled, camera mounted and switch configured exists for one reason —
            to deliver these eight outcomes inside your business, every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/15 border border-foreground/15">
          {OUTCOMES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="bg-background p-6 md:p-8 group hover:bg-foreground/[0.03] transition-colors"
            >
              <Icon className="w-8 h-8 text-foreground mb-6" strokeWidth={1.25} />
              <div className="font-display text-lg md:text-xl text-foreground mb-3 tracking-tight">
                {title}
              </div>
              <p className="text-[13px] text-foreground/70 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-[11px] uppercase tracking-[0.22em] text-foreground/55 text-center">
          Eight outcomes · One partner · Every site
        </p>
      </div>
    </section>
  );
};

export default OutcomesBanner;