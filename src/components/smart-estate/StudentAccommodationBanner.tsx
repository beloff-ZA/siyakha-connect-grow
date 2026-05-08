import studentImage from "@/assets/student-accommodation-cabling.png";

const pillars = [
  { k: "High-Density WiFi", v: "WiFi 6/6E per room & lounge — built for 1,000+ concurrent devices" },
  { k: "Smart Access", v: "Mobile credentials, RFID & PIN — per-room, per-tenancy lifecycle" },
  { k: "Per-Room Fibre", v: "Structured cabling & fibre-to-the-room with managed VLANs" },
  { k: "Tenant Portal", v: "WiFi onboarding, helpdesk, parcel & maintenance in one app" },
];

const StudentAccommodationBanner = () => {
  return (
    <section className="relative bg-background border-t border-foreground/10 overflow-hidden">
      <div className="relative w-full min-h-[78vh] md:min-h-[88vh]">
        <img
          src={studentImage}
          alt="Siyakha engineer on-site at a student accommodation comms cabinet — structured cabling, fibre and networking install"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-background/90 via-background/55 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-background/30" />

        <div className="relative z-10 container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5 lg:order-1 order-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-foreground/15 border border-foreground/15">
                {pillars.map((p) => (
                  <div key={p.k} className="bg-background/60 backdrop-blur-sm p-6">
                    <div className="font-display text-lg md:text-xl text-foreground mb-2">{p.k}</div>
                    <div className="text-xs md:text-[13px] text-foreground/70 leading-relaxed">{p.v}</div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-foreground/55">
                PBSA · Co-living · University residences
              </p>
            </div>

            <div className="lg:col-span-7 lg:order-2 order-1 lg:text-right">
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-4">
                Student Accommodation · Connectivity · Access
              </p>
              <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-foreground leading-[1.05]">
                Equip your dream space
                <br />
                with <span className="italic font-extralight">technology</span>.
              </h2>
              <p className="mt-6 max-w-xl lg:ml-auto text-base md:text-lg text-foreground/80 leading-relaxed">
                Student accommodation cable installations done right — fibre teams, structured
                networking, WiFi 6E, smart access and CCTV. Our engineers deliver the digital
                backbone of modern residences, from first cable pull to final handover.
              </p>

              <div className="mt-10 flex flex-wrap gap-2 lg:justify-end">
                {["WiFi 6E", "Mobile Keys", "Fibre-to-Room", "Energy Sub-metering", "Tenant App"].map((c) => (
                  <span
                    key={c}
                    className="text-[10px] uppercase tracking-[0.22em] text-foreground/70 border border-foreground/20 px-3 py-1.5"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentAccommodationBanner;
