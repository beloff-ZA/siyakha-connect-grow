const VisionStatement = () => {
  return (
    <section className="py-32 md:py-44 bg-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="overline mb-10">The Siyakha Vision</p>

          <h2 className="font-display font-extralight text-3xl md:text-5xl lg:text-6xl leading-[1.1] tracking-[-0.02em] text-foreground">
            We take an address
            <span className="block italic text-accent mt-2">and make it intelligent.</span>
          </h2>

          <div className="hairline mx-auto my-12 w-24" />

          <p className="font-display font-light text-xl md:text-2xl lg:text-3xl leading-[1.4] tracking-[-0.01em] text-foreground/80">
            We make it <span className="italic">see</span>, <span className="italic">feel</span> and <span className="italic">flow</span> different.
          </p>

          <p className="mt-10 font-display text-lg md:text-xl text-muted-foreground leading-relaxed">
            Siyakha is a vision. <span className="text-foreground">Siyakha is a feeling.</span>
          </p>

          <p className="mt-6 font-display text-base md:text-lg text-muted-foreground/80" dir="rtl" lang="ar">
            نأخذ عنواناً ونمنحه ذكاءً — يرى، يشعر، ويتدفق بشكل مختلف. سياخا رؤية، سياخا إحساس.
          </p>
        </div>
      </div>
    </section>
  );
};

export default VisionStatement;
