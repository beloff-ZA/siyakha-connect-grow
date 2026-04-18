import mineDroneImage from "@/assets/mine-drone-monitoring.jpg";

const pillars = [
  { k: "Autonomous Drones", v: "Scheduled BVLOS flights — pit, stockpile, perimeter & haul road sweeps" },
  { k: "Live Video & Thermal", v: "4K + thermal feeds streamed to command centre over private LTE/5G" },
  { k: "Stockpile Volumetrics", v: "Photogrammetry turning each flight into volume, tonnage & change reports" },
  { k: "Perimeter & Safety", v: "Intruder, vehicle and PPE detection with instant alerts to control room" },
  { k: "Haul Road Analytics", v: "Truck movement, dwell, congestion & wear flagged in real time" },
  { k: "Single Pane of Glass", v: "All drone, CCTV, radar & sensor data unified in one operations dashboard" },
];

const MineDroneBanner = () => {
  return (
    <section className="relative bg-foreground border-t border-background/10 overflow-hidden">
      <div className="relative w-full min-h-[80vh] md:min-h-[92vh]">
        <img
          src={mineDroneImage}
          alt="Industrial inspection drone hovering over an open-pit mine at golden hour with haul trucks and excavators below"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/55 to-foreground/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-transparent to-foreground/30" />

        <div className="relative z-10 container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-background/70 mb-4">
                Mining · Drone Monitoring · Operations
              </p>
              <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-background leading-[1.05]">
                See every metre of
                <br />
                your <span className="italic font-extralight">mine</span>, in real time.
              </h2>
              <p className="mt-6 max-w-xl text-base md:text-lg text-background/80 leading-relaxed">
                If you need eyes across an entire mining operation — pit, stockpile, perimeter and haul roads —
                we deploy autonomous drone fleets, private wireless networks and an integrated control room
                that turns every flight into live data, safety alerts and decision-grade reports.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Open-Pit", "Underground Surface", "Tailings Dams", "Coal", "Iron Ore", "Copper", "Gold"].map((c) => (
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
                One mine · One network · One operating picture
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MineDroneBanner;
