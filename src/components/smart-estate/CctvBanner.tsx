import cctvVideo from "@/assets/ai-surveillance-cameras.mp4.asset.json";

const CctvBanner = () => {
  return (
    <section className="relative bg-foreground border-t border-background/10 overflow-hidden">
      <div className="relative w-full min-h-[60vh] md:min-h-[75vh] lg:min-h-[80vh]">
        <video
          src={cctvVideo.url}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-label="AI surveillance PTZ cameras in motion"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/40 to-foreground/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-foreground/20" />

        <div className="relative z-10 h-full container mx-auto px-6 lg:px-10 py-16 md:py-24 flex items-center min-h-[60vh] md:min-h-[75vh] lg:min-h-[80vh]">
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
