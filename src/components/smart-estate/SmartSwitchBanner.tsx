import switchImage from "@/assets/mikrotik-smart-switch.png";

const SmartSwitchBanner = () => {
  return (
    <section className="relative bg-foreground border-t border-background/10">
      <div className="relative w-full min-h-[60vh] md:min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground via-foreground to-background/5" />

        <div className="relative container mx-auto px-6 lg:px-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">
                Infrastructure · Switching · Core
              </p>
              <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-background leading-[1.05]">
                Smart <span className="italic font-extralight">switching</span>.
              </h2>
              <p className="mt-5 max-w-md text-sm md:text-base text-background/70 leading-relaxed">
                Carrier-grade managed switches powering the network core — gigabit, 10G uplinks
                and SFP+ fibre handoffs engineered for estates, command centres and data rooms.
              </p>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <img
                src={switchImage}
                alt="MikroTik 48-port managed smart switch with SFP+ fibre uplinks"
                className="w-full h-auto object-contain drop-shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartSwitchBanner;
