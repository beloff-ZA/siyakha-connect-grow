import switchImage from "@/assets/hpe-aruba-switch-stack.webp";

const SmartSwitchBanner = () => {
  return (
    <section className="relative bg-foreground border-t border-background/10 overflow-hidden">
      <div className="relative w-full min-h-[58vh] md:min-h-[68vh] lg:min-h-[74vh]">
        {/* Full-width white plate so the switch image (white background) blends edge-to-edge */}
        <div className="absolute inset-0 bg-background" />
        <img
          src={switchImage}
          alt="HPE Aruba Networking CX 6300 switch series stack — high-capacity managed core switching"
          className="absolute inset-y-0 right-0 h-full w-full md:w-[70%] lg:w-[60%] object-contain object-right"
          loading="lazy"
        />
        {/* Left-side dark wash for text legibility, fading into the white plate */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/85 via-40% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />

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
