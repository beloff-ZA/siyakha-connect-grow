import { ExternalLink } from "lucide-react";

const PORTFOLIO_SITES = [
  { name: "Siyakha Technology", url: "https://www.siyakhatechnology.co.za", color: "from-blue-600 to-cyan-500" },
  { name: "Design Code Store", url: "https://www.designcode.store", color: "from-purple-600 to-pink-500" },
  { name: "Siyakha Group", url: "https://www.siyakha.com", color: "from-emerald-600 to-teal-500" },
  { name: "Zizwe DSD", url: "https://www.zizwedsd.co.za", color: "from-orange-500 to-amber-500" },
  { name: "Riviganis", url: "https://www.riviganis.co.za", color: "from-rose-600 to-red-500" },
  { name: "Orex", url: "https://www.orex.info", color: "from-indigo-600 to-violet-500" },
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center">
          {PORTFOLIO_SITES.map((site, i) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group perspective-[600px] w-full max-w-[140px]"
            >
              <div
                className="relative w-full aspect-square preserve-3d transition-transform duration-700 group-hover:pause"
                style={{
                  animation: `spin-cube 8s linear infinite`,
                  animationDelay: `${i * -1.3}s`,
                }}
              >
                {/* Front */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br ${site.color} flex flex-col items-center justify-center p-3 text-white shadow-lg backface-hidden`}
                  style={{ transform: "translateZ(70px)" }}
                >
                  <span className="text-xs sm:text-sm font-bold text-center leading-tight drop-shadow-md">
                    {site.name}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 mt-1.5 opacity-70" />
                </div>

                {/* Back */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br ${site.color} opacity-80 flex items-center justify-center p-3 text-white shadow-lg backface-hidden`}
                  style={{ transform: "rotateY(180deg) translateZ(70px)" }}
                >
                  <span className="text-[10px] sm:text-xs text-center break-all opacity-90 font-mono">
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
          0%   { transform: rotateY(0deg)   rotateX(15deg); }
          50%  { transform: rotateY(180deg) rotateX(-15deg); }
          100% { transform: rotateY(360deg) rotateX(15deg); }
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
