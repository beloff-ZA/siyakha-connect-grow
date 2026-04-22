import { Code2, Rocket, LayoutDashboard, Workflow, Layers, Zap, GitBranch, Database } from "lucide-react";
import { Link } from "react-router-dom";

const stack = [
  { k: "React · Next.js", v: "Modern web frontends" },
  { k: "Node · Python", v: "APIs & services" },
  { k: "Supabase · Postgres", v: "Auth, data, realtime" },
  { k: "Lovable · No-code", v: "Rapid prototyping" },
  { k: "Flutter · React Native", v: "Mobile apps" },
  { k: "Stripe · Paddle", v: "Payments & billing" },
];

const useCases = [
  {
    icon: LayoutDashboard,
    title: "Internal Dashboards",
    body: "Custom admin panels and operations dashboards that replace spreadsheets and clunky legacy tools.",
  },
  {
    icon: Workflow,
    title: "Workflow & Task Apps",
    body: "Project management, approvals, scheduling and team workflows shaped around how you actually operate.",
  },
  {
    icon: Layers,
    title: "SaaS Products",
    body: "Multi-tenant SaaS platforms with auth, billing, role-based access and a clean path to scale.",
  },
  {
    icon: Zap,
    title: "Quick-Release MVPs",
    body: "Validate an idea in weeks, not months. Working product in front of real users, fast.",
  },
];

const WebAppsSaasBanner = () => {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <p className="overline mb-5">Web Apps & SaaS Development</p>
            <h2 className="font-display font-light text-3xl md:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.02em] text-foreground">
              Low-cost web apps,
              <span className="italic font-extralight text-accent"> shipped fast.</span>
            </h2>
            <p className="mt-5 font-display text-lg md:text-xl text-muted-foreground/80" dir="rtl" lang="ar">
              تطبيقات ويب ومنصات SaaS — منخفضة التكلفة وسريعة الإطلاق.
            </p>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              We build pragmatic web applications and SaaS platforms that reflect the solution your business actually needs in the market — workflow, task management, project management, internal tools and customer-facing products. Multiple stacks, multiple languages, one outcome: working software in your hands, quickly.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs uppercase tracking-[0.22em] hover:bg-foreground/90 transition-colors"
              >
                <Rocket className="h-3.5 w-3.5" strokeWidth={1.5} />
                Brief us on your app
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 text-xs uppercase tracking-[0.22em] text-foreground hover:bg-secondary/40 transition-colors"
              >
                <Code2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                Get a quote
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-px bg-border border border-border">
              {stack.map((s) => (
                <div key={s.k} className="bg-background p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/80 mb-1.5">{s.k}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 border-t border-l border-border">
              {useCases.map((u) => {
                const Icon = u.icon;
                return (
                  <article
                    key={u.title}
                    className="border-r border-b border-border p-7 md:p-8 group hover:bg-secondary/40 transition-colors"
                  >
                    <Icon className="h-7 w-7 text-foreground/70 group-hover:text-accent transition-colors mb-6" strokeWidth={1.25} />
                    <h3 className="font-display text-lg md:text-xl font-light tracking-[-0.01em] text-foreground">
                      {u.title}
                    </h3>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                      {u.body}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-px grid sm:grid-cols-3 border-l border-border">
              <div className="border-r border-b border-border p-6">
                <GitBranch className="h-5 w-5 text-foreground/70 mb-3" strokeWidth={1.25} />
                <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/80 mb-1">Iterative</p>
                <p className="text-xs text-muted-foreground leading-snug">Weekly releases, real user feedback</p>
              </div>
              <div className="border-r border-b border-border p-6">
                <Database className="h-5 w-5 text-foreground/70 mb-3" strokeWidth={1.25} />
                <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/80 mb-1">Owned</p>
                <p className="text-xs text-muted-foreground leading-snug">Your code, your data, your domain</p>
              </div>
              <div className="border-r border-b border-border p-6">
                <Zap className="h-5 w-5 text-foreground/70 mb-3" strokeWidth={1.25} />
                <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/80 mb-1">Fast</p>
                <p className="text-xs text-muted-foreground leading-snug">MVPs in weeks, not quarters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebAppsSaasBanner;