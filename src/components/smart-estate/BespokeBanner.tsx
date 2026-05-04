import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Video,
  Network,
  Wifi,
  Cable,
  Sun,
  Home,
  Phone,
  ShieldCheck,
  Server,
  Plane,
  Globe,
  MonitorSmartphone,
  Building2,
  Tractor,
  Hotel,
  Droplets,
  Cloud,
  Brain,
  Bot,
  Lock,
  Cpu,
  Zap,
  Satellite,
} from "lucide-react";

const SERVICES = [
  { icon: Video, label: "AI CCTV & Surveillance" },
  { icon: Cable, label: "Fibre & Cabling" },
  { icon: Wifi, label: "Enterprise Wi-Fi" },
  { icon: Network, label: "Networking · L2/L3" },
  { icon: Phone, label: "VoIP & Intercoms" },
  { icon: Sun, label: "Solar & Off-Grid" },
  { icon: Home, label: "Smart Home" },
  { icon: ShieldCheck, label: "Access Control" },
  { icon: Server, label: "Servers & Racks" },
  { icon: Plane, label: "Drone Surveillance" },
  { icon: Globe, label: "Global Connectivity" },
  { icon: MonitorSmartphone, label: "Web & SaaS" },
  { icon: Building2, label: "Smart Estates" },
  { icon: Hotel, label: "Hotel & Hospitality" },
  { icon: Tractor, label: "Farm Solutions" },
  { icon: Droplets, label: "Smart Water" },
];

const GLOBAL_SERVICES = [
  { icon: Cloud, label: "Cloud Infrastructure" },
  { icon: Brain, label: "AI & Machine Learning" },
  { icon: Lock, label: "Cybersecurity" },
  { icon: Bot, label: "Automation & RPA" },
  { icon: Cpu, label: "IoT & Edge Compute" },
  { icon: Satellite, label: "Satellite & Starlink" },
  { icon: Zap, label: "EV Charging" },
];

const BespokeBanner = () => {
  const { t } = useTranslation();
  return (
    <section className="relative py-20 md:py-28 bg-background border-y border-foreground/10 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="overline mb-6">{t("bespoke.overline")}</p>
          <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.02em] text-foreground">
            {t("bespoke.headlineL1")}
            <span className="italic text-accent"> {t("bespoke.headlineL2Italic")}</span>{t("bespoke.headlineL2End")}
            <br className="hidden md:block" />
            {t("bespoke.headlineL3")}
          </h2>
          <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("bespoke.body")}
          </p>
        </div>

        {/* Service icon grid — clients pick what they need */}
        <div className="mt-16 md:mt-20 max-w-6xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground text-center mb-8">
            Select what you need · We deliver end-to-end
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-px bg-foreground/10 border border-foreground/10">
            {SERVICES.map(({ icon: Icon, label }) => (
              <Link
                key={label}
                to="/contact"
                aria-label={label}
                className="group bg-background hover:bg-foreground hover:text-background transition-colors p-5 md:p-6 flex flex-col items-center justify-center gap-3 min-h-[120px] text-center"
              >
                <Icon className="h-7 w-7 md:h-8 md:w-8 text-foreground group-hover:text-background transition-colors" strokeWidth={1.25} />
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] leading-snug text-foreground/80 group-hover:text-background transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground text-center mt-12 mb-8">
            Globally demanded services · Available on request
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-px bg-foreground/10 border border-foreground/10">
            {GLOBAL_SERVICES.map(({ icon: Icon, label }) => (
              <Link
                key={label}
                to="/contact"
                aria-label={label}
                className="group bg-background hover:bg-foreground hover:text-background transition-colors p-5 md:p-6 flex flex-col items-center justify-center gap-3 min-h-[120px] text-center"
              >
                <Icon className="h-7 w-7 md:h-8 md:w-8 text-foreground group-hover:text-background transition-colors" strokeWidth={1.25} />
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] leading-snug text-foreground/80 group-hover:text-background transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BespokeBanner;
