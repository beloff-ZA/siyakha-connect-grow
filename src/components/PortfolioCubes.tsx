import { ExternalLink } from "lucide-react";

const PORTFOLIO_SITES = [
  {
    name: "Siyakha Technology",
    url: "https://www.siyakhatechnology.co.za",
    screenshot: "/portfolio/siyakha-technology.png",
    color: "from-blue-600 to-cyan-500",
  },
  {
    name: "Siyakha Group",
    url: "https://www.siyakha.com",
    screenshot: "/portfolio/siyakha-group.png",
    color: "from-emerald-600 to-teal-500",
  },
  {
    name: "Zizwe DSD",
    url: "https://www.zizwedsd.co.za",
    screenshot: "/portfolio/zizwe-dsd.png",
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "Riviganis",
    url: "https://www.riviganis.co.za",
    screenshot: "/portfolio/riviganis.png",
    color: "from-rose-600 to-red-500",
  },
  {
    name: "Orex",
    url: "https://orex.info",
    screenshot: "/portfolio/orex.png",
    color: "from-amber-600 to-yellow-500",
  },
];

const PortfolioCubes = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-3">
          Our Portfolio
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
          Websites we've built and manage — yours could be next.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center max-w-4xl mx-auto">
          {PORTFOLIO_SITES.map((site, i) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group perspective-[600px] w-full max-w-[200px]"
            >
              <div
                className="relative w-full aspect-[4/3] preserve-3d transition-transform duration-700"
                style={{
                  animation: `spin-cube 10s linear infinite`,
                  animationDelay: `${i * -2.5}s`,
                }}
              >
                {/* Front — screenshot */}
                <div
                  className="absolute inset-0 rounded-xl overflow-hidden shadow-lg backface-hidden border border-border"
                  style={{ transform: "translateZ(70px)" }}
                >
                  <img
                    src={site.screenshot}
                    alt={`${site.name} website screenshot`}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-end justify-between">
                    <span className="text-xs sm:text-sm font-bold text-white drop-shadow-md leading-tight">
                      {site.name}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/80 shrink-0" />
                  </div>
                </div>

                {/* Back — gradient with URL */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br ${site.color} flex flex-col items-center justify-center p-4 text-white shadow-lg backface-hidden`}
                  style={{ transform: "rotateY(180deg) translateZ(70px)" }}
                >
                  <span className="text-sm font-bold text-center mb-1">{site.name}</span>
                  <span className="text-[10px] sm:text-xs text-center break-all opacity-80 font-mono">
                    {site.url.replace("https://www.", "")}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin-cube {
          0%   { transform: rotateY(0deg)   rotateX(12deg); }
          50%  { transform: rotateY(180deg) rotateX(-12deg); }
          100% { transform: rotateY(360deg) rotateX(12deg); }
        }
        .perspective-\\[600px\\] { perspective: 600px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .group:hover .preserve-3d { animation-play-state: paused !important; }
      `}</style>
    </section>
  );
};

export default PortfolioCubes;
