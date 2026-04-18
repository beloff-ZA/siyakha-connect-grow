import { Recycle, Truck, PlaneTakeoff, Eye, Radar, Flame, Wifi, ScanLine } from "lucide-react";
import borderRadarConcept from "@/assets/border-radar-detection.jpg";

const cities = [
  {
    icon: ScanLine,
    title: "Digital Border Radar & Human Detection",
    arabic: "رادار الحدود الرقمي وكشف التواجد البشري",
    body: "Long-range perimeter radar fused with thermal optics and AI human-detection — kilometre-scale border surveillance that distinguishes people from wildlife, vehicles and weather in real time.",
  },
  {
    icon: Wifi,
    title: "Public Area WiFi Solutions",
    arabic: "حلول الواي فاي للأماكن العامة",
    body: "Carrier-grade public WiFi for airports, malls, hotels and city precincts — captive portals, multilingual onboarding and seamless roaming for international guests and visitors.",
  },
  {
    icon: Recycle,
    title: "Smart Waste Management",
    arabic: "إدارة النفايات الذكية",
    body: "Sensor-equipped bins and route optimisation that cut collection costs and keep precincts pristine.",
  },
  {
    icon: Truck,
    title: "Fleet Digitalisation",
    arabic: "رقمنة الأسطول",
    body: "Live telemetry, driver behaviour analytics and predictive maintenance for entire municipal and private fleets.",
  },
  {
    icon: PlaneTakeoff,
    title: "Airport Movement Tracking",
    arabic: "تتبع حركة المطارات",
    body: "Computer-vision people flow analytics across terminals — dwell time, queue density and passenger journey insight.",
  },
  {
    icon: Eye,
    title: "AI Risk-Detection CCTV",
    arabic: "كاميرات كشف المخاطر بالذكاء الاصطناعي",
    body: "Behaviour-aware surveillance that flags weapons, intrusions and crowd anomalies before incidents escalate.",
  },
  {
    icon: Radar,
    title: "Airspace Camera Systems",
    arabic: "أنظمة كاميرات المجال الجوي",
    body: "Drone, perimeter and airspace monitoring with AI-driven object recognition for sensitive sites.",
  },
  {
    icon: Flame,
    title: "Heat, Smoke & Fire Detection",
    arabic: "كشف الحرارة والدخان والحريق",
    body: "Thermal imaging and early-warning fire analytics that protect tenants, assets and infrastructure 24/7.",
  },
];

// Decorative Islamic geometric star (8-point) — pure SVG, monochrome
const ArabesqueStar = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="0.6">
    <circle cx="50" cy="50" r="48" />
    <path d="M50 2 L61 39 L98 50 L61 61 L50 98 L39 61 L2 50 L39 39 Z" />
    <path d="M14.6 14.6 L50 39 L85.4 14.6 L61 50 L85.4 85.4 L50 61 L14.6 85.4 L39 50 Z" />
    <circle cx="50" cy="50" r="12" />
  </svg>
);

const SmartCitiesSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-background border-t border-foreground/10 overflow-hidden">
      {/* Decorative arabesque motifs */}
      <ArabesqueStar className="absolute -top-20 -right-20 w-[420px] h-[420px] text-foreground/[0.06] pointer-events-none" />
      <ArabesqueStar className="absolute -bottom-32 -left-24 w-[360px] h-[360px] text-foreground/[0.04] pointer-events-none" />

      <div className="relative container mx-auto px-6 lg:px-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <ArabesqueStar className="w-6 h-6 text-accent" />
            <p className="overline">Smart · Efficient · Cities</p>
            <span className="text-[11px] tracking-[0.18em] text-muted-foreground" dir="rtl" lang="ar">
              مدن ذكية · فعّالة
            </span>
          </div>

          <h2 className="font-display font-light text-4xl md:text-6xl leading-[1.05] tracking-[-0.02em] text-foreground">
            The intelligent
            <span className="italic text-accent"> city layer</span>
            <br />
            we engineer underneath it all.
          </h2>

          <p
            className="mt-4 font-display font-extralight text-2xl md:text-3xl text-accent/90 leading-snug"
            dir="rtl"
            lang="ar"
          >
            البنية الذكية التي نهندسها لمدن الغد
          </p>

          <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            From waste management and fleet digitalisation to airport movement analytics and
            AI-powered risk detection — Siyakha Interlink delivers the connective intelligence
            that makes cities run cleaner, safer and more efficiently across the GCC and EMEA.
          </p>
        </div>

        {/* Ornamental divider */}
        <div className="mt-14 flex items-center gap-4">
          <div className="flex-1 h-px bg-foreground/15" />
          <ArabesqueStar className="w-8 h-8 text-foreground/40" />
          <div className="flex-1 h-px bg-foreground/15" />
        </div>

        {/* Featured: Digital Border Radar — full width */}
        <div className="mt-12">
          <div className="relative w-full overflow-hidden bg-background border border-foreground/10 group">
            <img
              src={borderRadarConcept}
              alt="Digital border radar and AI human detection visualisation across desert terrain"
              width={1920}
              height={760}
              loading="lazy"
              className="w-full h-auto object-cover aspect-[16/7] md:aspect-[21/8]"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-md border border-foreground/15 text-[10px] uppercase tracking-[0.22em] text-foreground">
              <ScanLine className="w-3 h-3 text-accent" strokeWidth={1.5} />
              Featured Capability
            </div>
          </div>

          <div className="bg-background border-x border-b border-foreground/10 p-8 md:p-12 lg:p-14 grid lg:grid-cols-12 gap-8 lg:gap-12 relative">
            <ArabesqueStar className="absolute top-4 right-4 w-5 h-5 text-foreground/15" />

            <div className="lg:col-span-5">
              <p className="overline mb-4">Intruder Detection · Built, Not Watched</p>
              <h3 className="font-display font-light text-3xl md:text-4xl lg:text-5xl text-foreground tracking-tight leading-[1.05] mb-4">
                Know the intruder is on route —
                <span className="italic text-accent"> from up to 5km away.</span>
              </h3>
              <p
                className="text-base md:text-lg text-accent/90 mb-3"
                dir="rtl"
                lang="ar"
              >
                اعرف بوجود المتسلل قبل وصوله — من مسافة تصل إلى 5 كيلومترات.
              </p>
              <p className="text-sm text-muted-foreground/80 italic">
                This is not monitoring. This is a building solution that sees, knows and finds
                the issue — before it reaches the fence.
              </p>
              <p
                className="text-sm text-muted-foreground/70 italic mt-2"
                dir="rtl"
                lang="ar"
              >
                ليست مجرد مراقبة — بل منظومة متكاملة ترى وتعرف وتحدد التهديد قبل وصوله.
              </p>
            </div>

            <div className="lg:col-span-7 lg:pt-2">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                A complete intruder detection system for farms, estates, logistics yards, mines
                and critical perimeters. Long-range radar fused with thermal optics and AI
                identifies people, vehicles and drones up to 5km out — and routes verified
                threats to your response team in seconds.
              </p>
              <p
                className="text-sm md:text-base text-muted-foreground/90 leading-relaxed mb-6"
                dir="rtl"
                lang="ar"
              >
                نظام متكامل لكشف المتسللين للمزارع والعقارات والمواقع الحيوية. رادار بعيد المدى
                مدمج مع كاميرات حرارية وذكاء اصطناعي يكشف الأشخاص والمركبات والطائرات المسيّرة
                على بُعد 5 كيلومترات — مع تنبيهات لحظية لفريق الاستجابة.
              </p>
              <p className="overline mb-3 text-foreground/70">Also used for · أيضاً</p>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm md:text-base text-muted-foreground">
                {[
                  "5km early-warning radar — detect before the fence line",
                  "Farms, estates, mines, logistics & critical perimeters",
                  "Consumer movement analytics — radar-based footfall, dwell & flow volumes",
                  "AI classification — person · vehicle · drone · livestock",
                  "Verified alerts to command, on-site security & response units",
                  "Build · See · Know · Find — not just record",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="mt-[9px] w-1 h-1 bg-accent rounded-full shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10 mt-12">
          {cities.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="relative bg-background p-8 md:p-10 group hover:bg-foreground/[0.03] transition-colors"
              >
                {/* Corner arabesque ornament */}
                <ArabesqueStar className="absolute top-4 right-4 w-5 h-5 text-foreground/15 group-hover:text-accent/40 transition-colors" />

                <Icon className="h-7 w-7 text-accent mb-6" strokeWidth={1.25} />
                <h3 className="font-display text-xl md:text-2xl text-foreground tracking-tight mb-1">
                  {c.title}
                </h3>
                <p
                  className="text-xs tracking-wide text-muted-foreground/80 mb-4"
                  dir="rtl"
                  lang="ar"
                >
                  {c.arabic}
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {c.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>Dubai · Riyadh · Doha</span>
          <span className="opacity-30">·</span>
          <span>Johannesburg · London</span>
          <span className="opacity-30">·</span>
          <span dir="rtl" lang="ar" className="tracking-normal text-sm">الشرق الأوسط وأفريقيا</span>
        </div>
      </div>
    </section>
  );
};

export default SmartCitiesSection;
