import { GraduationCap, Home, Wifi, Cpu, Cloud, Shield, Sparkles, Workflow } from "lucide-react";

const solutions = [
  {
    icon: GraduationCap,
    title: "Smart Schools",
    titleAr: "مدارس ذكية",
    body: "Connected classrooms, digital learning platforms, smartboards and campus-wide management.",
  },
  {
    icon: Home,
    title: "Smart Homes",
    titleAr: "منازل ذكية",
    body: "Automated lighting, climate, access and security — one app, one experience, every room.",
  },
  {
    icon: Wifi,
    title: "Wi-Fi 7",
    titleAr: "واي فاي 7",
    body: "Next-generation wireless backbones engineered for density, low latency and zero dead zones.",
  },
  {
    icon: Cpu,
    title: "Next-Gen Computing",
    titleAr: "حوسبة الجيل القادم",
    body: "Edge servers, GPU workstations and high-performance infrastructure for modern workloads.",
  },
  {
    icon: Cloud,
    title: "Cloud Solutions",
    titleAr: "حلول سحابية",
    body: "Cloud architecture, migration and managed services across AWS, Azure and Google Cloud.",
  },
  {
    icon: Shield,
    title: "Cyber Security",
    titleAr: "الأمن السيبراني",
    body: "Endpoint protection, network hardening, SOC monitoring and continuous threat response.",
  },
  {
    icon: Sparkles,
    title: "AI & Platforms",
    titleAr: "الذكاء الاصطناعي والمنصات",
    body: "Custom AI assistants, vision models and bespoke platforms built around your operation.",
  },
  {
    icon: Workflow,
    title: "Automations",
    titleAr: "الأتمتة",
    body: "Workflow automation that removes friction across teams, systems and customer journeys.",
  },
];

const NextGenSolutions = () => {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-16 md:mb-20">
          <p className="overline mb-5">Next-Generation Solutions</p>
          <h2 className="font-display font-light text-3xl md:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.02em] text-foreground">
            Smart schools, smart homes —
            <span className="italic font-extralight text-accent"> the full next-gen stack.</span>
          </h2>
          <p className="mt-5 font-display text-lg md:text-xl text-muted-foreground/80" dir="rtl" lang="ar">
            مدارس ذكية، منازل ذكية — الحلول التقنية للجيل القادم.
          </p>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-2xl">
            Wi-Fi 7, next-gen computing, cloud, cyber security, AI, custom platforms and end-to-end automation — engineered into one cohesive technology stack.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-border">
          {solutions.map((s) => {
            const Icon = s.icon;
            return (
              <article
                key={s.title}
                className="border-r border-b border-border p-7 md:p-8 group hover:bg-secondary/40 transition-colors"
              >
                <Icon
                  className="h-7 w-7 text-foreground/70 group-hover:text-accent transition-colors mb-6"
                  strokeWidth={1.25}
                />
                <h3 className="font-display text-lg md:text-xl font-light tracking-[-0.01em] text-foreground">
                  {s.title}
                </h3>
                <p className="mt-1 font-display text-sm text-muted-foreground/70" dir="rtl" lang="ar">
                  {s.titleAr}
                </p>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {s.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NextGenSolutions;
