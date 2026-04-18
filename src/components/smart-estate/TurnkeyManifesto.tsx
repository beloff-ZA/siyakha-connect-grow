const capabilities = [
  { k: "Turnkey ICT", v: "End-to-end deployment for any space — design, supply, install, operate." },
  { k: "Holistic Solutions", v: "Networks, hardware, security and software delivered as one programme." },
  { k: "IT Hardware", v: "Procurement, staging and rollout of enterprise-grade equipment at scale." },
  { k: "Remote Engineers", v: "On-demand specialist engineers embedded into your projects, anywhere." },
  { k: "Schools & Campuses", v: "Digitalised classrooms, campus Wi-Fi, smartboards and learning platforms." },
  { k: "Business & Commercial", v: "Offices, retail and corporate HQs — productive, secure and connected." },
  { k: "Mining & Industrial", v: "Hardened technical support for mines and remote operational sites." },
  { k: "Global Connectivity", v: "We connect buildings across continents — one architecture, every site." },
];

const sectors = ["Schools", "Businesses", "Mines", "Hospitals", "Hospitality", "Retail", "Estates"];


const TurnkeyManifesto = () => {
  return (
    <section className="py-24 md:py-32 bg-foreground text-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-6">
              Interlink × Siyakha
            </p>
            <h2 className="font-display font-light text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-[-0.02em]">
              We digitalise schools, businesses
              <span className="italic font-extralight"> & every space in between.</span>
            </h2>
            <p className="mt-5 font-display text-lg md:text-xl text-background/70" dir="rtl" lang="ar">
              نُرقمن المدارس والشركات وكل مساحة بينهما.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {sectors.map((s) => (
                <span
                  key={s}
                  className="text-[10px] uppercase tracking-[0.22em] text-background/70 border border-background/20 px-3 py-1.5"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <p className="text-base md:text-lg leading-relaxed text-background/80 font-light">
              We deliver holistic ICT across schools, businesses, mines and entire estates — turnkey IT hardware, structured networks, security architecture and remote engineering crews mobilised on demand. Classrooms going digital, mines needing technical support, operators scaling across borders: <span className="text-background">Siyakha has the team.</span>
            </p>
            <p className="text-base md:text-lg leading-relaxed text-background/70 font-light">
              We connect buildings globally. We are the future of IT — and we are building the next great ICT company in the world.
            </p>

            <div className="grid sm:grid-cols-2 gap-px bg-background/10 border border-background/10">
              {capabilities.map((c) => (
                <div key={c.k} className="bg-foreground p-6 md:p-7">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-background/50 mb-2">
                    {c.k}
                  </p>
                  <p className="text-sm text-background/85 leading-relaxed">
                    {c.v}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4 text-[11px] uppercase tracking-[0.28em] text-background/60">
              <span>Interlink</span>
              <span className="h-px w-8 bg-background/30" aria-hidden="true" />
              <span>Siyakha</span>
              <span className="h-px w-8 bg-background/30" aria-hidden="true" />
              <span dir="rtl" lang="ar" className="tracking-normal text-sm">انترلينك · سياخا</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TurnkeyManifesto;
