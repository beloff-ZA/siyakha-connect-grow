import wifiImage from "@/assets/cisco-access-point.jpg";

const EnterpriseWifiBanner = () => {
  return (
    <section className="relative bg-background border-t border-border">
      <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
        <img
          src={wifiImage}
          alt="Cisco enterprise wireless access point delivering high-density WiFi coverage"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-6 lg:px-10 pb-10 md:pb-16">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-3">
              Wireless · Enterprise · Coverage
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-foreground leading-[1.05]">
              Enterprise <span className="italic font-extralight">wireless</span>.
            </h2>
            <p className="mt-3 max-w-xl text-sm md:text-base text-foreground/75 leading-relaxed">
              Carrier-grade access points engineered for high-density estates, public area WiFi and
              mission-critical command operations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseWifiBanner;
