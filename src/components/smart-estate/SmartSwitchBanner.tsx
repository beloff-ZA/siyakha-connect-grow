import switchImage from "@/assets/mikrotik-smart-switch.png";

const SmartSwitchBanner = () => {
  return (
    <section className="relative bg-foreground border-t border-background/10">
      <div className="w-full">
        <img
          src={switchImage}
          alt="MikroTik 48-port managed smart switch with SFP+ fibre uplinks"
          className="w-screen h-auto object-cover block"
          loading="lazy"
        />
      </div>

      <div className="container mx-auto px-6 lg:px-10 py-10 md:py-16">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-3">
              Infrastructure · Switching · Core
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-background leading-[1.05]">
              Smart <span className="italic font-extralight">switching</span>.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm md:text-base text-background/70 leading-relaxed">
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
