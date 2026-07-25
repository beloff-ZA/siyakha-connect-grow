// TODO: replace placeholder figures with real, verified numbers
const STATS = [
  { value: "40+", label: "Sites secured" },
  { value: "120 km", label: "Perimeter covered" },
  { value: "12 yrs", label: "Operating" },
  { value: "7", label: "Countries active" },
];

const ProofStrip = () => (
  <section className="bg-background border-y border-foreground/10">
    <div className="container mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-foreground/10">
        {STATS.map((s, i) => (
          <div key={s.label} className={`py-8 md:py-10 ${i > 0 ? "pl-6 md:pl-10" : ""} pr-4`}>
            <div className="font-display font-light text-3xl md:text-5xl tracking-tight text-foreground">
              {s.value}
            </div>
            <div className="mt-2 text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <p className="pb-4 text-[10px] uppercase tracking-[0.24em] text-foreground/40">
        Indicative — figures pending verification
      </p>
    </div>
  </section>
);

export default ProofStrip;