const brands = [
  { name: "Dell", src: "/brands/dell.svg" },
  { name: "HP", src: "/brands/hp.svg" },
  { name: "Cisco", src: "/brands/cisco.svg" },
  { name: "Grandstream", src: "/brands/grandstream-partner.png" },
  { name: "TP-Link", src: "/brands/tplink.png" },
  { name: "Hikvision", src: "/brands/hikvision.png" },
  { name: "Microsoft", src: "/brands/microsoft.svg" },
  { name: "Adobe", src: "/brands/adobe.svg" },
];

const BrandsWeTrust = () => {
  return (
    <section className="py-20 md:py-28 bg-background border-t border-border/40">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="overline mb-5">Brands We Trust</p>
          <h2 className="font-display font-light text-3xl md:text-5xl leading-[1.05] tracking-[-0.02em] text-foreground">
            Install &amp; supply<span className="italic text-accent"> partners</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Enterprise-grade hardware and software we engineer, deploy and support across every client deployment.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-px bg-border/40 border border-border/40 rounded-sm overflow-hidden">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="bg-background flex items-center justify-center px-6 py-10 transition-all duration-300 hover:bg-muted/30 group"
            >
              <img
                src={brand.src}
                alt={`${brand.name} logo`}
                loading="lazy"
                className="max-h-10 md:max-h-12 w-auto object-contain grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsWeTrust;
