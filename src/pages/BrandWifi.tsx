import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import WhySiyakhaBand from "@/components/site/WhySiyakhaBand";
import BrandWifiHero from "@/components/site/BrandWifiHero";
import { Bus, Music4, Building2, Eye, Users, BarChart3, Handshake } from "lucide-react";

const WHERE = [
  { icon: Bus, title: "Public transport", body: "Taxi ranks, bus routes, stations and commuter hubs — free connectivity where communities wait, travel and spend the most time." },
  { icon: Building2, title: "Public spaces", body: "Malls, clinics, libraries, parks and municipal precincts — sponsored access points that give the community connectivity at no cost." },
  { icon: Music4, title: "Venues & nightlife", body: "Piloted in SMME pubs and scaled to large venue clubs of the Konka calibre — high-density Wi-Fi built for crowds." },
  { icon: Users, title: "Events & activations", body: "Event Wi-Fi with branded splash pages, guest capture and live dwell reporting for the duration of the activation." },
];

const VALUE = [
  { icon: Eye, title: "Brand visibility that gets touched", body: "Every connection starts on your branded splash page — a screen the consumer actively taps, not an ad they scroll past." },
  { icon: Handshake, title: "Community goodwill", body: "Free, reliable connectivity funded by the brand. The sponsor becomes the reason the community is online." },
  { icon: BarChart3, title: "Measurable engagement", body: "Sessions, unique users, repeat visits, dwell time and location — real performance data behind the sponsorship." },
  { icon: Wifi, title: "Carrier-grade delivery", body: "Enterprise access points, managed backhaul, content filtering and remote monitoring — engineered and supported by Siyakha." },
];

const STEPS = [
  { n: "01", t: "Site survey", b: "We map coverage, density and backhaul at the transport hub, venue or public space." },
  { n: "02", t: "Brand the portal", b: "Splash page, captive portal journey, offers and data-capture designed around the sponsor." },
  { n: "03", t: "Deploy", b: "Enterprise APs, switching, power and connectivity installed and commissioned by our field engineers." },
  { n: "04", t: "Report", b: "Ongoing monitoring plus monthly engagement reporting the brand can take to market." },
];

const BrandWifi = () => (
  <div className="min-h-screen bg-background">
    <SiteSEO
      title="Your Brand Wi-Fi — Sponsored Public & Event Connectivity"
      description="Branded public Wi-Fi for transport hubs, public spaces, venues and events — free community connectivity funded by brands, with measurable engagement and enterprise delivery."
      path="/brand-wifi"
    />
    <Header />

    <section className="bg-background border-b border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-24 md:py-32">
        <Link to="/" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60 hover:text-foreground mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Wifi className="w-6 h-6 text-foreground" strokeWidth={1.25} />
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60">Your Brand Wi-Fi · Public Connectivity</p>
          </div>
          <h1 className="font-display font-light text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] text-foreground leading-[1.02]">
            Your brand Wi-Fi.
            <br />
            <span className="italic font-extralight">Free for the community</span>.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-foreground/75 leading-relaxed max-w-2xl">
            Sponsored public Wi-Fi for transport hubs, public spaces, venues and events. Communities
            get connectivity at no cost — brands get a connection consumers physically touch, every
            single session.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/?type=commercial#qualify" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/90">
              Sponsor a network <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/projects" className="inline-flex items-center gap-2 border border-foreground/25 px-6 py-3 text-[12px] uppercase tracking-[0.24em] text-foreground hover:bg-foreground/[0.04]">
              See our deployments
            </Link>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-background border-b border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="max-w-3xl mb-14">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">Where it lives</p>
          <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
            Connectivity where the <span className="italic">community already is</span>.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/15 border border-foreground/15">
          {WHERE.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-background p-7 md:p-9">
              <Icon className="w-8 h-8 text-foreground mb-6" strokeWidth={1.25} />
              <div className="font-display text-xl md:text-2xl text-foreground mb-3 tracking-tight">{title}</div>
              <p className="text-[13px] text-foreground/70 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-foreground text-background">
      <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="max-w-3xl mb-14">
          <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">Why brands sponsor it</p>
          <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
            A connection people <span className="italic font-extralight">choose</span> to make.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-background/15 border border-background/15">
          {VALUE.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-foreground p-6 md:p-8">
              <Icon className="w-7 h-7 text-background mb-6" strokeWidth={1.25} />
              <div className="font-display text-xl text-background mb-3 tracking-tight">{title}</div>
              <p className="text-[13px] text-background/70 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-background border-b border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="max-w-3xl mb-14">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">Proven in the field</p>
          <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
            Piloted in SMME pubs.
            <br />
            Built to scale to <span className="italic">large venues</span>.
          </h2>
          <p className="mt-6 text-base text-foreground/70 leading-relaxed">
            We started where the density is hardest to serve — small township pubs and community
            venues — then engineered the same architecture for large-format clubs of the Konka
            calibre, festival grounds and commuter hubs. Same portal, same reporting, more people.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-foreground/15 border border-foreground/15">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-background p-6 md:p-8">
              <div className="text-[11px] tracking-[0.24em] text-foreground/40 mb-4">{s.n}</div>
              <div className="font-display text-lg text-foreground mb-3 tracking-tight">{s.t}</div>
              <p className="text-[13px] text-foreground/70 leading-relaxed">{s.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <WhySiyakhaBand />
    <Footer />
  </div>
);

export default BrandWifi;
