const pillars = [
  {
    no: "01",
    label: "Build Technology",
    labelAr: "تقنية البناء",
    title: "Construction-grade infrastructure.",
    titleAr: "بنية تحتية بمعايير الإنشاء.",
    body: "Structured cabling, fibre backbones, racks, power and pathways — engineered into the build from day one, not retrofitted.",
    bodyAr: "كابلات منظمة، شبكات ألياف بصرية، خزائن، طاقة ومسارات — مدمجة في المبنى من اليوم الأول.",
  },
  {
    no: "02",
    label: "Building Maintenance Technology",
    labelAr: "تقنية صيانة المباني",
    title: "Lifecycle servicing, instrumented.",
    titleAr: "صيانة دورية مدعومة بالبيانات.",
    body: "Asset registers, sensor-driven maintenance schedules and digital handover packs that keep the building performing for decades.",
    bodyAr: "سجلات الأصول وجداول صيانة ذكية وحزم تسليم رقمية تحافظ على أداء المبنى لعقود.",
  },
  {
    no: "03",
    label: "AI Solutions — Checking & Monitoring",
    labelAr: "حلول الذكاء الاصطناعي — المراقبة والتحقق",
    title: "Eyes on every system, always.",
    titleAr: "رقابة دائمة على كل نظام.",
    body: "Computer-vision surveillance, anomaly detection and 24/7 health checks across access, network and building systems.",
    bodyAr: "مراقبة بالرؤية الحاسوبية، كشف الأعطال وفحوصات على مدار الساعة لأنظمة الدخول والشبكة والمبنى.",
  },
  {
    no: "04",
    label: "Efficiency Tech",
    labelAr: "تقنية الكفاءة",
    title: "Energy & operations, optimised.",
    titleAr: "طاقة وتشغيل بأعلى كفاءة.",
    body: "Sub-metering, occupancy analytics and automation that drive down running costs while lifting tenant experience.",
    bodyAr: "قياسات فرعية وتحليلات إشغال وأتمتة تخفض التكاليف وترفع تجربة المستخدم.",
  },
];

const TechPillarsGrid = () => {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-16 md:mb-20">
          <p className="overline mb-5">The Four Layers</p>
          <h2 className="font-display font-light text-3xl md:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.02em] text-foreground">
            Build. Maintain. <span className="italic font-extralight text-accent">Monitor.</span> Optimise.
          </h2>
          <p className="mt-3 font-display text-lg md:text-xl text-muted-foreground/80" dir="rtl" lang="ar">
            ابنِ. صُن. <span className="italic text-accent">راقب.</span> طوِّر.
          </p>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-2xl">
            Four interlinked technology layers — delivered as one integrated programme so every developer, operator and tenant gets a building that performs from handover onward.
          </p>
        </div>

        <div className="grid md:grid-cols-2 border-t border-l border-border">
          {pillars.map((p) => (
            <article
              key={p.no}
              className="border-r border-b border-border p-8 md:p-10 lg:p-12 group hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-baseline justify-between mb-8 gap-4">
                <span className="font-display text-4xl md:text-5xl font-extralight italic text-foreground/30 group-hover:text-accent transition-colors">
                  {p.no}
                </span>
                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {p.label}
                  </span>
                  <span className="block mt-1 text-xs text-muted-foreground/70" dir="rtl" lang="ar">
                    {p.labelAr}
                  </span>
                </div>
              </div>
              <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-light leading-tight tracking-[-0.01em] text-foreground mb-2">
                {p.title}
              </h3>
              <p className="font-display text-base md:text-lg font-light text-foreground/70 mb-4" dir="rtl" lang="ar">
                {p.titleAr}
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3">
                {p.body}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground/70 leading-relaxed" dir="rtl" lang="ar">
                {p.bodyAr}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechPillarsGrid;
