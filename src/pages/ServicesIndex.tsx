import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import LeadCtaRow from "@/components/site/LeadCtaRow";
import StickyContactBar from "@/components/site/StickyContactBar";
import { DIVISIONS } from "@/content/divisions";
import { BRAND } from "@/lib/brand";

const ServicesIndex = () => (
  <div className="min-h-screen bg-background">
    <SiteSEO
      title={`Services — Managed IT, Projects, Security, Digital & AI | ${BRAND.name}`}
      description="Managed IT support, network and cabling projects, commercial CCTV and access control, websites and hosting, plus AI and process automation for businesses in Johannesburg, Sandton, Durban and KZN."
      path="/services"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${BRAND.name} services`,
        itemListElement: DIVISIONS.map((d, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: d.title,
          url: `${BRAND.origin}/services/${d.slug}`,
        })),
      }}
    />
    <Header />

    <section className="bg-background border-b border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-5">
            Services · Johannesburg &amp; Durban
          </p>
          <h1 className="font-display font-light text-4xl md:text-6xl tracking-[-0.02em] text-foreground leading-[1.04]">
            Five divisions.
            <br />
            <span className="italic font-extralight">One accountable team.</span>
          </h1>
          <p className="mt-8 text-lg text-foreground/75 leading-relaxed">
            {BRAND.name} covers the technology a growing business actually needs — day-to-day IT support,
            installation projects, commercial security, your digital presence, and the automation that
            removes repetitive work.
          </p>
          <div className="mt-8">
            <LeadCtaRow context="services index" />
          </div>
          <p className="mt-5 text-[13px] text-foreground/60">{BRAND.ownerReplyLine}</p>
        </div>
      </div>
    </section>

    <section className="bg-background">
      <div className="container mx-auto px-6 lg:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/15 border border-foreground/15">
          {DIVISIONS.map(({ slug, title, teaser, offers, icon: Icon }) => (
            <Link
              key={slug}
              to={`/services/${slug}`}
              className="group bg-background p-6 md:p-8 hover:bg-foreground/[0.04] transition-colors flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <Icon className="w-8 h-8 text-foreground" strokeWidth={1.25} />
                <ArrowUpRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground transition-colors" />
              </div>
              <h2 className="font-display text-2xl text-foreground mb-3 tracking-tight">{title}</h2>
              <p className="text-sm text-foreground/70 leading-relaxed">{teaser}</p>
              <ul className="mt-5 space-y-1.5">
                {offers.slice(0, 4).map((o) => (
                  <li key={o} className="text-[13px] text-foreground/60 leading-relaxed">
                    — {o}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <Footer />
    <StickyContactBar />
  </div>
);

export default ServicesIndex;
