import evImage from "@/assets/ev-charging-installation.jpg";
import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";

const pillars = [
  { k: "Home Wallbox · 7-22kW", v: "AC chargers for private residences and estates — single or three-phase" },
  { k: "DC Fast Charging · 60-180kW", v: "High-speed commercial chargers for fleets, malls, hotels and forecourts" },
  { k: "Solar + Battery Tied", v: "Charge from your solar surplus, store in batteries, top up from the grid only when needed" },
  { k: "Load Management & Billing", v: "Smart load balancing, RFID/app access, kWh metering and tenant/visitor billing" },
];

const EvChargingBanner = () => {
  return (
    <section className="relative bg-background border-t border-foreground/10 overflow-hidden">
      <div className="relative w-full min-h-[78vh] md:min-h-[88vh]">
        <img
          src={evImage}
          alt="Wall-mounted EV charger powering a sleek electric vehicle inside a luxury private residence garage"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/55 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-background/30" />

        <div className="relative z-10 container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-7">
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-4 inline-flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" strokeWidth={1.5} />
                EV Charging · Installations · Southern Africa
              </p>
              <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-foreground leading-[1.05]">
                Future-proof your driveway,
                <br />
                <span className="italic font-extralight">forecourt</span> and fleet.
              </h2>
              <p className="mt-6 max-w-xl text-base md:text-lg text-foreground/80 leading-relaxed">
                Certified EV charging installations for homes, estates, hotels, malls and commercial fleets.
                We design, install and commission AC wallboxes and DC fast chargers — backed by smart load
                management, solar integration and tenant/visitor billing.
              </p>
              <div className="mt-10 flex flex-wrap gap-2">
                {["Home Wallbox", "DC Fast Charging", "Solar Integration", "Fleet & Forecourt", "Smart Billing", "Compliance Certified"].map((c) => (
                  <span
                    key={c}
                    className="text-[10px] uppercase tracking-[0.22em] text-foreground/70 border border-foreground/20 px-3 py-1.5"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <Link
                to="/contact"
                className="mt-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground border-b border-foreground/40 hover:border-foreground pb-1"
              >
                Request an EV charging quote
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </div>

            <div className="lg:col-span-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-foreground/15 border border-foreground/15">
                {pillars.map((p) => (
                  <div key={p.k} className="bg-background/60 backdrop-blur-sm p-6">
                    <div className="font-display text-lg md:text-xl text-foreground mb-2">{p.k}</div>
                    <div className="text-xs md:text-[13px] text-foreground/70 leading-relaxed">{p.v}</div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-foreground/55">
                Home · Hotel · Mall · Fleet · Forecourt
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EvChargingBanner;