import switchImage from "@/assets/hpe-aruba-cx-6300-switch.png";

const SmartSwitchBanner = () => {
  return (
    <section className="relative bg-foreground border-t border-background/10 overflow-hidden">
      <div className="relative w-full min-h-[58vh] md:min-h-[68vh] lg:min-h-[74vh]">
        <img
          src={switchImage}
          alt="HPE Aruba Networking CX 6300 switch series stack — high-capacity managed core switching"
          className="absolute inset-0 w-full h-full object-contain object-right opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/30" />

        <div className="relative z-10 container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <p className="text-[11px] uppercase tracking-[0.28em] text-background/70 mb-3">
                Infrastructure · Switching · Core
              </p>
              <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-background leading-[1.05]">
                Smart <span className="italic font-extralight">switching</span>.
              </h2>
              <p className="mt-5 max-w-xl text-sm md:text-base text-background/80 leading-relaxed">
                Carrier-grade managed switches powering the network core — gigabit, 10G and 25G
                uplinks, SFP+/SFP28 fibre handoffs and stacked architectures engineered for
                estates, command centres, hospitality and data rooms.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-px bg-background/15 border border-background/15 max-w-xl">
                <div className="bg-foreground/40 backdrop-blur-sm p-5">
                  <div className="font-display text-2xl md:text-3xl text-background tracking-tight">1,760<span className="text-base text-background/60 ml-1">Gbps</span></div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-background/60 mt-2">Switching capacity</div>
                </div>
                <div className="bg-foreground/40 backdrop-blur-sm p-5">
                  <div className="font-display text-2xl md:text-3xl text-background tracking-tight">1,310<span className="text-base text-background/60 ml-1">Mpps</span></div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-background/60 mt-2">Forwarding throughput</div>
                </div>
                <div className="bg-foreground/40 backdrop-blur-sm p-5">
                  <div className="font-display text-2xl md:text-3xl text-background tracking-tight">400<span className="text-base text-background/60 ml-1">Gbps</span></div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-background/60 mt-2">Stacking bandwidth</div>
                </div>
              </div>

              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-background/55">
                Nonblocking performance · Stack-ready · Fibre-native
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartSwitchBanner;
