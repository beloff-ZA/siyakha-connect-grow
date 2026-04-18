import qsfpImage from "@/assets/qsfp-building-links.jpg";

const QsfpBanner = () => {
  return (
    <section className="relative bg-background border-t border-border">
      <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
        <img
          src={qsfpImage}
          alt="QSFP optical transceivers building high-speed fibre links inside a network switch"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-6 lg:px-10 pb-10 md:pb-16">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-3">
              Infrastructure · Fibre · Backbone
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-foreground leading-[1.05]">
              QSFP <span className="italic font-extralight">building links</span>.
            </h2>
            <p className="mt-3 max-w-xl text-sm md:text-base text-foreground/75 leading-relaxed">
              High-speed optical transceivers powering the fibre backbone between buildings,
              data centres and command operations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QsfpBanner;
