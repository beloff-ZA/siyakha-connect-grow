import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Globe2, Code2, Layout, Server, ShieldCheck, Smartphone, Search, Zap } from "lucide-react";

const CANONICAL_DOMAIN = "https://siyakhatechnology.co.za";

type Country = {
  slug: string;
  name: string;
  capital: string;
  flag: string;
  blurb: string;
  focus: string[];
};

const countries: Country[] = [
  {
    slug: "angola",
    name: "Angola",
    capital: "Luanda",
    flag: "🇦🇴",
    blurb:
      "Bilingual Portuguese & English web platforms for Luanda's energy, logistics and hospitality sectors. Hosted on resilient regional infrastructure with offline-capable PWAs for low-bandwidth environments.",
    focus: ["Corporate websites", "E-commerce (kwanza & USD)", "Logistics dashboards", "Bilingual PT/EN"],
  },
  {
    slug: "zambia",
    name: "Zambia",
    capital: "Lusaka",
    flag: "🇿🇲",
    blurb:
      "Web design and SaaS builds for Lusaka and the Copperbelt — mining suppliers, fintech, agritech and tourism. Mobile-money ready (Airtel, MTN, Zamtel) with locally tuned SEO.",
    focus: ["Mining supplier portals", "Mobile-money checkout", "Tourism & lodge sites", "SEO for Lusaka"],
  },
  {
    slug: "mozambique",
    name: "Mozambique",
    capital: "Maputo",
    flag: "🇲🇿",
    blurb:
      "Portuguese-first websites and booking systems for Maputo, Beira and Pemba — hospitality, gas, agribusiness. Lightweight builds optimised for 3G coverage and high-DPI mobile.",
    focus: ["Hospitality booking", "Portuguese SEO", "Gas & agri portals", "Mobile-first design"],
  },
  {
    slug: "namibia",
    name: "Namibia",
    capital: "Windhoek",
    flag: "🇳🇦",
    blurb:
      "Polished corporate sites and tourism platforms for Windhoek, Walvis Bay and Swakopmund — tour operators, mining services, conservation. Multi-currency NAD/ZAR/USD checkout.",
    focus: ["Tourism operators", "Mining services", "Conservation NGOs", "NAD/ZAR/USD"],
  },
  {
    slug: "botswana",
    name: "Botswana",
    capital: "Gaborone",
    flag: "🇧🇼",
    blurb:
      "Web platforms for Gaborone, Francistown and Maun — financial services, safari operators, government suppliers. Built on enterprise stacks with strict data-residency awareness.",
    focus: ["Financial services", "Safari & lodge", "Gov supplier portals", "Compliance-ready"],
  },
  {
    slug: "tanzania",
    name: "Tanzania",
    capital: "Dar es Salaam",
    flag: "🇹🇿",
    blurb:
      "Swahili & English web platforms for Dar es Salaam, Arusha and Zanzibar — tourism, port logistics, fintech. M-Pesa Tanzania, Tigo Pesa and Airtel Money integrations standard.",
    focus: ["Swahili/English UX", "Tourism & safari", "Port & logistics", "Mobile-money APIs"],
  },
  {
    slug: "kenya",
    name: "Kenya",
    capital: "Nairobi",
    flag: "🇰🇪",
    blurb:
      "Nairobi-grade SaaS, marketplaces and corporate sites for fintech, agritech and B2B services. Native M-Pesa Daraja integration, Kenyan Shilling pricing and AWS Africa (Cape Town) hosting.",
    focus: ["M-Pesa Daraja", "SaaS & marketplaces", "Agritech platforms", "Nairobi SEO"],
  },
  {
    slug: "drc",
    name: "DRC (Congo)",
    capital: "Kinshasa",
    flag: "🇨🇩",
    blurb:
      "French-language web platforms for Kinshasa and Lubumbashi — mining, NGOs, telecoms. Lightweight, low-bandwidth builds with offline support and locally hosted assets.",
    focus: ["French-first UX", "Mining & NGO", "Low-bandwidth PWAs", "USD/CDF pricing"],
  },
];

const services = [
  {
    icon: Layout,
    title: "Web Design",
    body: "Editorial, brand-led design systems built around your business — typography, motion and identity that translates across desktop and mobile.",
  },
  {
    icon: Code2,
    title: "Web Development",
    body: "Modern React, Next.js and headless builds. Fast, accessible, indexable — and engineered to scale with your traffic across borders.",
  },
  {
    icon: Server,
    title: "Web Apps & SaaS",
    body: "Custom dashboards, booking systems, marketplaces and internal tools. Lovable-grade rapid prototyping through to production-grade SaaS.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First & PWA",
    body: "Progressive Web Apps that work offline, install to home screen and load instantly on the dominant 3G/4G mobile traffic across the region.",
  },
  {
    icon: Search,
    title: "Local SEO",
    body: "Country-specific SEO — language, geo-schema, Google Business profiles and locally relevant backlinks for Luanda, Lusaka, Nairobi and beyond.",
  },
  {
    icon: ShieldCheck,
    title: "Hosting & Security",
    body: "Resilient hosting on AWS Africa (Cape Town), Cloudflare edge and managed CDNs. SSL, WAF, daily backups and 24/7 uptime monitoring as standard.",
  },
];

const RegionalServices = () => {
  useEffect(() => {
    const title = "Web Development & Design Across Africa — Luanda, Lusaka, Nairobi, Maputo | Siyakha Interlink";
    const description =
      "Web design, web development and SaaS for Angola, Zambia, Mozambique, Namibia, Botswana, Tanzania, Kenya and DRC. Bilingual PT/EN/FR/SW builds with mobile-money integrations.";
    document.title = title;
    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(key, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    ensureMeta("name", "description", description);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${CANONICAL_DOMAIN}/regional-services`);
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${CANONICAL_DOMAIN}/regional-services`);
  }, []);

  const breadcrumbJson = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_DOMAIN}/` },
        { "@type": "ListItem", position: 2, name: "Regional Services", item: `${CANONICAL_DOMAIN}/regional-services` },
      ],
    }),
    []
  );

  const serviceJson = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Web Design & Web Development",
      provider: { "@type": "Organization", name: "Siyakha Interlink", url: CANONICAL_DOMAIN },
      areaServed: countries.map((c) => ({ "@type": "Country", name: c.name })),
      description:
        "Web design, web development, SaaS and mobile-first PWA builds across Angola, Zambia, Mozambique, Namibia, Botswana, Tanzania, Kenya and DRC.",
    }),
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Header />

      {/* Hero */}
      <section className="relative border-b border-border py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="max-w-4xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6 flex items-center gap-3">
              <Globe2 className="w-4 h-4" /> Regional Services · Africa
            </p>
            <h1 className="font-display font-light text-4xl md:text-7xl leading-[1.05] tracking-[-0.02em] text-foreground">
              Web design & development
              <br />
              <span className="italic text-foreground/70">across the African continent.</span>
            </h1>
            <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Low-cost, high-impact web platforms, SaaS products and mobile-first applications — built for the
              languages, payment rails and bandwidth realities of Luanda, Lusaka, Maputo, Windhoek, Gaborone,
              Dar es Salaam, Nairobi, Kinshasa and beyond.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="mailto:nikita@siyakhatechnology.co.za?subject=Regional%20Web%20Project%20Enquiry"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[11px] uppercase tracking-[0.22em] hover:bg-foreground/85 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" /> Brief us on your project
              </a>
              <Link
                to="/"
                className="inline-flex items-center gap-2 border border-foreground/20 px-6 py-3 text-[11px] uppercase tracking-[0.22em] hover:border-foreground transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services we offer */}
      <section className="py-20 md:py-28 border-b border-border">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="max-w-3xl mb-14">
            <p className="overline">What we deliver</p>
            <h2 className="mt-4 font-display font-light text-3xl md:text-5xl leading-tight tracking-[-0.02em]">
              Six disciplines. One regional partner.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="bg-background p-8 md:p-10 hover:bg-foreground/[0.03] transition-colors">
                  <Icon className="w-7 h-7 text-foreground mb-6" strokeWidth={1.25} />
                  <h3 className="font-display text-xl md:text-2xl text-foreground tracking-tight mb-3">{s.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Country grid */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="max-w-3xl mb-14">
            <p className="overline">Where we operate</p>
            <h2 className="mt-4 font-display font-light text-3xl md:text-5xl leading-tight tracking-[-0.02em]">
              Eight countries. Local nuance, global craft.
            </h2>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">
              Click into any country below to see the languages, payment integrations and sectors we focus on.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-foreground/10 border border-foreground/10">
            {countries.map((c) => (
              <article
                key={c.slug}
                id={c.slug}
                className="bg-background p-8 md:p-10 group hover:bg-foreground/[0.03] transition-colors"
              >
                <div className="flex items-start justify-between gap-6 mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                      {c.capital}
                    </p>
                    <h3 className="font-display text-2xl md:text-3xl text-foreground tracking-tight">
                      {c.name}
                    </h3>
                  </div>
                  <span className="text-4xl md:text-5xl leading-none" aria-hidden="true">
                    {c.flag}
                  </span>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">{c.blurb}</p>
                <ul className="flex flex-wrap gap-2 mb-6">
                  {c.focus.map((f) => (
                    <li
                      key={f}
                      className="text-[10px] uppercase tracking-[0.18em] border border-foreground/15 px-3 py-1.5 text-foreground/70"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:nikita@siyakhatechnology.co.za?subject=${encodeURIComponent(
                    `Web project enquiry — ${c.name}`
                  )}`}
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground border-b border-foreground/40 hover:border-foreground transition-colors pb-1"
                >
                  Enquire — {c.capital} →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 border-t border-border bg-foreground text-background">
        <div className="container mx-auto px-6 lg:px-10 text-center max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-background/60 mb-6">Get started</p>
          <h2 className="font-display font-light text-3xl md:text-5xl leading-tight tracking-[-0.02em]">
            Ready to launch in{" "}
            <span className="italic">Luanda, Lusaka or Nairobi?</span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-background/70 leading-relaxed">
            Tell us your market, your timeline and your budget. We'll come back with a fixed scope, a fixed price
            and a launch date — usually within 48 hours.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:nikita@siyakhatechnology.co.za?subject=Regional%20Web%20Project%20Enquiry"
              className="inline-flex items-center gap-2 bg-background text-foreground px-6 py-3 text-[11px] uppercase tracking-[0.22em] hover:bg-background/90 transition-colors"
            >
              Email the team
            </a>
            <a
              href="tel:+27815012993"
              className="inline-flex items-center gap-2 border border-background/30 px-6 py-3 text-[11px] uppercase tracking-[0.22em] hover:border-background transition-colors"
            >
              Call 081 501 2993
            </a>
          </div>
        </div>
      </section>

      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJson) }} />
    </div>
  );
};

export default RegionalServices;