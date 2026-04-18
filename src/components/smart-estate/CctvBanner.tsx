import cctvImage from "@/assets/hikvision-ptz-cameras.png";

const CctvBanner = () => {
  return (
    <section className="relative bg-foreground border-t border-background/10 overflow-hidden">
      <div className="relative w-full h-[38vh] md:h-[52vh] lg:h-[58vh]">
        <img
          src={cctvImage}
          alt="Hikvision PTZ AI surveillance cameras for smart estates and command centres"
          className="absolute inset-0 w-full h-full object-cover object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-foreground/30" />

        <div className="relative z-10 h-full container mx-auto px-6 lg:px-10 flex items-center">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/70 mb-3">
              Surveillance · AI Optics · PTZ
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-background leading-[1.05]">
              AI <span className="italic font-extralight">surveillance</span>.
            </h2>
            <p className="mt-4 max-w-md text-sm md:text-base text-background/75 leading-relaxed">
              PTZ optics fused with AI classification — long-range zoom, thermal overlays
              and verified intrusion alerts dispatched to command centres in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CctvBanner;
