import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

interface Feature {
  label: string;
  detail: string;
}

interface InteractiveSectorBannerProps {
  image: string;
  imageAlt: string;
  eyebrow: string;
  titleItalic: string;
  titleBold: string;
  tagline: string;
  features: Feature[];
  ctaLabel?: string;
  ctaHref?: string;
}

const InteractiveSectorBanner = ({
  image,
  imageAlt,
  eyebrow,
  titleItalic,
  titleBold,
  tagline,
  features,
  ctaLabel = "Speak with a specialist",
  ctaHref = "#contact",
}: InteractiveSectorBannerProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-background border-t border-foreground/10 overflow-hidden group"
    >
      <div className="relative w-full overflow-hidden min-h-[520px] md:min-h-[640px] lg:min-h-[720px]">
        {/* Background image — desaturated by default, returns to colour on hover */}
        <img
          src={image}
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover block grayscale contrast-[1.05] transition-all duration-[1200ms] ease-out group-hover:grayscale-0 group-hover:scale-[1.04] group-hover:contrast-100"
          loading="lazy"
        />

        {/* Layered gradients for legibility — strong bottom + subtle left vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-700" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent transition-opacity duration-700" />

        {/* Top-right CTA chip — fades in */}
        <a
          href={ctaHref}
          className={`absolute top-6 right-6 md:top-10 md:right-10 inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white/95 backdrop-blur-sm text-black text-[10px] md:text-[11px] uppercase tracking-[0.22em] border border-white/30 hover:bg-white hover:border-white transition-all duration-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
          style={{ transitionProperty: "opacity, transform, background-color, border-color", transitionDuration: "700ms" }}
        >
          <span>{ctaLabel}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>

        {/* Bottom interactive panel */}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-14">
          <div
            className={`max-w-5xl transition-all duration-1000 ease-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* Eyebrow + hairline */}
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.32em] text-white/90 font-medium">
                {eyebrow}
              </span>
              <span className="h-px flex-1 max-w-[120px] bg-white/50" />
            </div>

            {/* Title — rendered in DOM (sharper than baked-in image text) */}
            <div className="mb-5 md:mb-7">
              <p className="font-display italic font-light text-3xl md:text-5xl lg:text-6xl text-white leading-[0.95] drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                {titleItalic}
              </p>
              <p className="font-display font-bold uppercase text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] text-white leading-[0.95] mt-1 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                {titleBold}
              </p>
            </div>

            {/* Tagline */}
            <p className="text-sm md:text-base text-white/90 max-w-xl mb-5 md:mb-7 leading-relaxed">
              {tagline}
            </p>

            {/* Interactive feature pills */}
            <div className="flex flex-wrap gap-2 md:gap-2.5">
              {features.map((feature, idx) => (
                <button
                  key={feature.label}
                  type="button"
                  onMouseEnter={() => setActiveFeature(idx)}
                  onMouseLeave={() => setActiveFeature(null)}
                  onFocus={() => setActiveFeature(idx)}
                  onBlur={() => setActiveFeature(null)}
                  className={`px-3.5 py-2 md:px-4 md:py-2.5 text-[10px] md:text-[11px] uppercase tracking-[0.18em] border transition-all duration-300 ${
                    activeFeature === idx
                      ? "bg-white text-black border-white"
                      : "bg-black/30 backdrop-blur-sm text-white border-white/40 hover:border-white hover:bg-black/50"
                  } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                  style={{ transitionDelay: visible ? `${200 + idx * 80}ms` : "0ms" }}
                  aria-expanded={activeFeature === idx}
                >
                  {feature.label}
                </button>
              ))}
            </div>

            {/* Reveal panel for the active feature */}
            <div
              className={`mt-4 md:mt-6 overflow-hidden transition-all duration-500 ease-out ${
                activeFeature !== null ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-l-2 border-white pl-4 max-w-2xl">
                <p className="text-sm md:text-base text-white leading-relaxed">
                  {activeFeature !== null ? features[activeFeature].detail : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveSectorBanner;
