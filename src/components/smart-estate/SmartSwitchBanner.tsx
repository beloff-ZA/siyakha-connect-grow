import switchImage from "@/assets/mikrotik-smart-switch.png";

const SmartSwitchBanner = () => {
  return (
    <section className="relative bg-foreground border-t border-background/10 overflow-hidden">
      <div className="relative w-full h-[38vh] md:h-[52vh] lg:h-[58vh]">
        <img
          src={switchImage}
          alt="MikroTik 48-port managed smart switch with SFP+ fibre uplinks"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-foreground/30" />

        <div className="relative z-10 h-full container mx-auto px-6 lg:px-10 flex items-center">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/70 mb-3">
              Infrastructure · Switching · Core
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-background leading-[1.05]">
              Smart <span className="italic font-extralight">switching</span>.
            </h2>
            <p className="mt-4 max-w-md text-sm md:text-base text-background/75 leading-relaxed">
              Carrier-grade managed switches powering the network core — gigabit, 10G uplinks
              and SFP+ fibre handoffs engineered for estates, command centres and data rooms.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartSwitchBanner;
