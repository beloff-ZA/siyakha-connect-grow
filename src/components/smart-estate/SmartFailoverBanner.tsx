import failoverImage from "@/assets/smart-failover-home.jpg";

const pillars = [
  { k: "Dual-WAN Router", v: "Two fibre lines bonded — sub-second cutover, zero dropped calls" },
  { k: "5G / LTE Backup", v: "Cellular failover kicks in the moment fibre drops" },
  { k: "Always-On VoIP", v: "Calls, video, smart locks and CCTV stay live through outages" },
  { k: "Remote Monitoring", v: "We see your line drop before you do — and act on it" },
];

const SmartFailoverBanner = () => {
  return (
    <section className="relative bg-background border-t border-foreground/10 overflow-hidden">
      <div className="relative w-full min-h-[78vh] md:min-h-[88vh]">
        <img
          src={failoverImage}
          alt="Premium home dual-WAN router with 5G LTE failover modem mounted on warm oak panel"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/55 to-background/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-background/30" />

        <div className="relative z-10 container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-7">
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-4">
                Home · Resilience · Smart Failover
              </p>
              <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-foreground leading-[1.05]">
                Your home should never go
                <br />
                <span className="italic font-extralight">offline</span>.
              </h2>
              <p className="mt-6 max-w-xl text-base md:text-lg text-foreground/80 leading-relaxed">
                Smart failover bonds your fibre with 5G/LTE backup behind a single intelligent gateway —
                so when one line drops, the other takes over in under a second. Your work calls, smart locks,
                cameras, streaming and VoIP keep running, uninterrupted.
              </p>
              <div className="mt-10 flex flex-wrap gap-2">
                {["Dual Fibre", "5G Backup", "VoIP Continuity", "Smart Home", "24/7 Monitoring"].map((c) => (
                  <span
                    key={c}
                    className="text-[10px] uppercase tracking-[0.22em] text-foreground/70 border border-foreground/20 px-3 py-1.5"
                  >
                    {c}
                  </span>
                ))}
              </div>
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
                One home · Two networks · Zero downtime
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartFailoverBanner;
