import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Wifi } from "lucide-react";
import heroAsset from "@/assets/brand-wifi-konka.png.asset.json";

const BrandWifiHero = () => (
  <section className="relative bg-background border-b border-foreground/10 overflow-hidden group">
    <div className="relative w-full overflow-hidden min-h-[520px] md:min-h-[640px] lg:min-h-[720px]">
      <img
        src={heroAsset.url}
        alt="Branded public Wi-Fi at Konka venue and in a taxi, with a branded Konka captive portal on a phone"
        className="absolute inset-0 w-full h-full object-cover block grayscale contrast-[1.05] transition-all duration-[1200ms] ease-out group-hover:grayscale-0 group-hover:scale-[1.04] group-hover:contrast-100"
        loading="eager"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-700" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent transition-opacity duration-700" />

      <Link
        to="/"
        className="absolute top-6 left-6 md:top-10 md:left-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/70 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-14">
        <div className="max-w-5xl">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <Wifi className="w-6 h-6 text-white" strokeWidth={1.25} />
            <span className="text-[11px] uppercase tracking-[0.28em] text-white/80 font-medium">
              Your Brand Wi-Fi · Public Connectivity
            </span>
          </div>

          <h1 className="font-display font-light text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] text-white leading-[1.02]">
            Your brand Wi-Fi.
            <br />
            <span className="italic font-extralight">Free for the community</span>.
          </h1>

          <p className="mt-6 md:mt-8 text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
            Sponsored public Wi-Fi for transport hubs, public spaces, venues and events. Communities
            get connectivity at no cost — brands get a connection consumers physically touch, every
            single session.
          </p>

          <div className="mt-8 md:mt-10 flex flex-wrap gap-4">
            <Link
              to="/?type=commercial#qualify"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-white/90 transition-colors"
            >
              Sign up your brand <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default BrandWifiHero;
