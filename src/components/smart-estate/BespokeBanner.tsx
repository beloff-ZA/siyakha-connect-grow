const BespokeBanner = () => {
  return (
    <section className="relative py-20 md:py-28 bg-background border-y border-foreground/10 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="overline mb-6">Bespoke · Future-Proof · Engineered</p>
          <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.02em] text-foreground">
            Bespoke designs deserve
            <span className="italic text-accent"> bespoke technology</span>,
            <br className="hidden md:block" />
            solutions and concepts.
          </h2>
          <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We future-proof your home with the latest technology — engineered around your
            architecture, your lifestyle and the decade ahead.
          </p>
          <p
            className="mt-6 font-display text-lg md:text-xl text-accent/90 leading-[1.9]"
            dir="rtl"
            lang="ar"
          >
            التصاميم الفريدة تستحق تكنولوجيا فريدة — نُجهّز منزلكم لمستقبل لا يتقادم.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BespokeBanner;
