// Simple stylised EMEA map with location pins. Coordinates are approximate
// pixel positions within the viewBox, tuned to give a recognisable EMEA layout.
const POINTS = [
  { name: "London", region: "UK", x: 340, y: 130, hq: false },
  { name: "Dubai", region: "GCC — UAE", x: 620, y: 300, hq: false },
  { name: "Riyadh", region: "GCC — Saudi Arabia", x: 585, y: 305, hq: false },
  { name: "Doha", region: "GCC — Qatar", x: 605, y: 300, hq: false },
  { name: "Johannesburg", region: "South Africa · HQ", x: 495, y: 545, hq: true },
];

const RegionsMap = () => (
  <section className="bg-background border-b border-foreground/10">
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="max-w-3xl mb-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
          Where we operate
        </p>
        <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
          EMEA — from Johannesburg,
          <br />
          <span className="italic font-extralight">across the GCC, into the UK.</span>
        </h2>
      </div>

      <div className="border border-foreground/15 bg-foreground/[0.02] p-4 md:p-10">
        <svg
          viewBox="0 0 900 700"
          className="w-full h-auto"
          role="img"
          aria-label="EMEA map with pins on London, Dubai, Riyadh, Doha and Johannesburg"
        >
          {/* Stylised EMEA landmass silhouettes — abstract, not geographically precise */}
          <g fill="none" stroke="hsl(var(--foreground) / 0.18)" strokeWidth="1">
            {/* Europe */}
            <path d="M270 90 Q 340 60 420 100 L 460 160 Q 430 210 380 210 L 300 200 Q 250 170 270 90 Z" />
            {/* North Africa / Middle East mass */}
            <path d="M280 220 L 500 210 Q 640 230 700 300 L 680 380 Q 560 400 460 380 L 320 360 Q 260 320 280 220 Z" />
            {/* Arabian Peninsula */}
            <path d="M530 300 Q 620 310 660 360 L 640 420 Q 580 430 540 410 Q 510 370 530 300 Z" />
            {/* Africa */}
            <path d="M360 380 Q 440 390 500 420 L 540 500 Q 530 590 470 640 Q 400 650 370 590 Q 340 500 360 380 Z" />
          </g>

          {/* Latitude grid hint */}
          <g stroke="hsl(var(--foreground) / 0.08)" strokeWidth="1" strokeDasharray="2 4">
            <line x1="60" y1="350" x2="840" y2="350" />
            <line x1="450" y1="40" x2="450" y2="660" />
          </g>

          {/* Pins */}
          {POINTS.map((p) => (
            <g key={p.name}>
              <circle
                cx={p.x}
                cy={p.y}
                r={p.hq ? 22 : 16}
                fill="hsl(var(--foreground) / 0.08)"
              >
                <animate attributeName="r" values={`${p.hq ? 18 : 12};${p.hq ? 28 : 22};${p.hq ? 18 : 12}`} dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={p.x} cy={p.y} r={p.hq ? 6 : 4} fill="hsl(var(--foreground))" />
              <text
                x={p.x + 14}
                y={p.y + 4}
                fontSize="14"
                fill="hsl(var(--foreground))"
                style={{ fontFamily: "inherit" }}
                className="font-display"
              >
                {p.name}
              </text>
              <text
                x={p.x + 14}
                y={p.y + 22}
                fontSize="9"
                letterSpacing="2"
                fill="hsl(var(--foreground) / 0.5)"
                style={{ fontFamily: "inherit", textTransform: "uppercase" }}
              >
                {p.region}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  </section>
);

export default RegionsMap;