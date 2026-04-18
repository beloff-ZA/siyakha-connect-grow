import smartHomeImage from "@/assets/smart-home-uae-2026.jpg";

const pillars = [
  { k: "Lighting & Climate", v: "Scene-based lighting, automated curtains and AI climate control tuned to your routines." },
  { k: "Security & Access", v: "Smart locks, video intercoms, AI cameras and biometric entry — managed from one app." },
  { k: "Entertainment & Audio", v: "Multi-room audio, hidden speakers and cinema-grade AV integrated into the architecture." },
  { k: "Energy & Wellness", v: "Solar tie-ins, smart metering, air-quality sensors and circadian lighting for healthier living." },
];

const SmartHomeUaeBanner = () => {
  return (
    <section className="relative bg-foreground border-t border-background/10 overflow-hidden">
      <div className="relative w-full">
        <img
          src={smartHomeImage}
          alt="Luxury Dubai smart home interior with integrated lighting, climate and security control panels overlooking the city skyline"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/70 to-foreground/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/40" />

        <div className="relative z-10 container mx-auto px-6 lg:px-10 py-20 md:py-28 lg:py-36">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-7">
              <p className="text-[11px] uppercase tracking-[0.28em] text-background/70 mb-5">
                Smart Home UAE · 2026 Focus
              </p>
              <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-background leading-[1.05]">
                The UAE is going
                <span className="italic font-extralight"> fully smart</span>.
                <br />We bring your home with it.
              </h2>
              <p className="mt-6 max-w-xl text-sm md:text-base text-background/80 leading-relaxed">
                In 2026, every major UAE development — from Dubai South to Yas Island, Saadiyat to MBR City —
                is being built around smart-home standards. Lighting, climate, security, entertainment and
                energy are no longer add-ons. They are the baseline.
              </p>
              <p className="mt-4 max-w-xl text-sm md:text-base text-background/70 leading-relaxed">
                Siyakha Interlink retrofits existing villas, apartments and townhouses — and delivers
                turnkey smart-home packages for new owners — so your property meets the
                <span className="text-background"> 2026 UAE smart living standard</span> without the construction overhead.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {["Dubai", "Abu Dhabi", "Sharjah", "RAK", "Ajman"].map((c) => (
                  <span
                    key={c}
                    className="text-[10px] uppercase tracking-[0.22em] text-background/70 border border-background/20 px-3 py-1.5"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="grid sm:grid-cols-2 gap-px bg-background/10 border border-background/10 backdrop-blur-sm">
                {pillars.map((p) => (
                  <div key={p.k} className="bg-foreground/85 p-5 md:p-6">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-background/60 mb-2">
                      {p.k}
                    </p>
                    <p className="text-xs md:text-sm text-background/85 leading-relaxed">
                      {p.v}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.28em] text-background/60">
                <span>Retrofit</span>
                <span className="h-px w-6 bg-background/30" aria-hidden="true" />
                <span>New Build</span>
                <span className="h-px w-6 bg-background/30" aria-hidden="true" />
                <span>Concierge</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartHomeUaeBanner;
