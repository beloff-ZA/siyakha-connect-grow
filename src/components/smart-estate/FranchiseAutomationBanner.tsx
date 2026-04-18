import franchiseImage from "@/assets/franchise-automation.jpg";

const pillars = [
  { k: "Self-Order Kiosks", v: "Touch ordering, upsell prompts & contactless payment at the front" },
  { k: "Kitchen Display", v: "Tickets routed live from POS & kiosks to KDS — no paper, no delay" },
  { k: "Multi-Site POS", v: "Cloud POS unifying menus, pricing & stock across every franchise" },
  { k: "Drive-Thru & QR", v: "Menu boards, QR table-ordering and loyalty integrated end-to-end" },
  { k: "CCTV + AI", v: "Queue analytics, dwell time, theft & safety monitoring in one feed" },
  { k: "Failover Network", v: "Dual fibre + 5G keeps payments and orders live during any outage" },
];

const FranchiseAutomationBanner = () => {
  return (
    <section className="relative bg-foreground border-t border-background/10 overflow-hidden">
      <div className="relative w-full min-h-[80vh] md:min-h-[92vh]">
        <img
          src={franchiseImage}
          alt="Modern franchise restaurant with self-order kiosks, digital menu boards and contactless payment terminal"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-foreground/90 via-foreground/55 to-foreground/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-transparent to-foreground/30" />

        <div className="relative z-10 container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-background/70 mb-4">
                Franchises · Automation · Multi-Site
              </p>
              <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-background leading-[1.05]">
                Engineered for the
                <br />
                <span className="italic font-extralight">franchise economy</span>.
              </h2>
              <p className="mt-6 max-w-xl text-base md:text-lg text-background/80 leading-relaxed">
                One technology stack across every store — kiosks, POS, kitchen displays, CCTV, payments
                and a resilient network — rolled out site by site, managed centrally, with 24/7 support
                from our command centre.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["QSR", "Coffee Chains", "Casual Dining", "Drive-Thru", "Cloud Kitchens"].map((c) => (
                  <span
                    key={c}
                    className="text-[10px] uppercase tracking-[0.22em] text-background/70 border border-background/20 px-3 py-1.5"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-background/15 border border-background/15">
                {pillars.map((p) => (
                  <div key={p.k} className="bg-foreground/40 backdrop-blur-sm p-6">
                    <div className="font-display text-base md:text-lg text-background mb-2">{p.k}</div>
                    <div className="text-xs md:text-[13px] text-background/70 leading-relaxed">{p.v}</div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-background/55">
                One brand · Every store · One operating standard
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FranchiseAutomationBanner;
