import hotelImage from "@/assets/hotel-bedside-tech.jpg";

const pillars = [
  { k: "VoIP", v: "In-room IP phones · concierge · room service one-touch" },
  { k: "Bedside Console", v: "Lighting, blinds, climate & DND from one panel" },
  { k: "Cast & Stream", v: "Guest-device casting to in-room TVs over secure VLAN" },
  { k: "PMS Integration", v: "Check-in, billing & wake-up calls into Opera / Mews" },
];

const HotelBedsideBanner = () => {
  return (
    <section className="relative bg-foreground border-t border-background/10 overflow-hidden">
      <div className="relative w-full min-h-[78vh] md:min-h-[88vh]">
        <img
          src={hotelImage}
          alt="Luxury hotel bedside with smart room control panel and VoIP desk phone at night"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/55 to-foreground/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/30" />

        <div className="relative z-10 container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-7">
              <p className="text-[11px] uppercase tracking-[0.28em] text-background/70 mb-4">
                Hospitality · Bedside Technology · VoIP
              </p>
              <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-background leading-[1.05]">
                The bedside is the new
                <br />
                <span className="italic font-extralight">front desk</span>.
              </h2>
              <p className="mt-6 max-w-xl text-base md:text-lg text-background/80 leading-relaxed">
                We engineer the in-room technology layer for hotels, serviced apartments and resorts —
                VoIP IP phones at every bedside, smart room controls, casting and PMS integration,
                running over a single managed network designed for hospitality SLAs.
              </p>

              <div className="mt-10 flex flex-wrap gap-2">
                {["Dubai · DIFC", "Abu Dhabi", "Riyadh", "Doha", "Cape Town", "Zanzibar"].map((c) => (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-background/15 border border-background/15">
                {pillars.map((p) => (
                  <div key={p.k} className="bg-foreground/40 backdrop-blur-sm p-6">
                    <div className="font-display text-lg md:text-xl text-background mb-2">{p.k}</div>
                    <div className="text-xs md:text-[13px] text-background/70 leading-relaxed">{p.v}</div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-background/55">
                One network · One standard · Every key, every call, every comfort
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelBedsideBanner;
