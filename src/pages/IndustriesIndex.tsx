import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import LeadCtaRow from "@/components/site/LeadCtaRow";
import StickyContactBar from "@/components/site/StickyContactBar";
import { INDUSTRIES } from "@/content/industries";
import { BRAND } from "@/lib/brand";

const IndustriesIndex = () => (
  <div className="min-h-screen bg-background">
    <SiteSEO
      title={`Industries We Serve — Practices, Firms, Schools, Accommodation, Hospitality | ${BRAND.name}`}
      description="Technology built around your industry: doctors and medical practices, law and professional firms, schools, student accommodation, restaurants and hospitality, offices and owner-led businesses in Johannesburg and Durban."
      path="/industries"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${BRAND.name} industries`,
        itemListElement: INDUSTRIES.map((i, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: i.label,
          url: `${BRAND.origin}/industries/${i.slug}`,
        })),
      }}
    />
    <Header />

    <section className="bg-background border-b border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-5">Industries</p>
          <h1 className="font-display font-light text-4xl md:text-6xl tracking-[-0.02em] text-foreground leading-[1.04]">
            Technology shaped by
            <br />
            <span className="italic font-extralight">how you actually work.</span>
          </h1>
          <p className="mt-8 text-lg text-foreground/75 leading-relaxed">
            A medical practice, a law firm, a school, a residence and a restaurant all break in different
            places. Pick your industry to see the problems we are asked to solve most often — and how we
            solve them.
          </p>
          <div className="mt-8">
            <LeadCtaRow context="industries index" />
          </div>
        </div>
      </div>
    </section>

    <section className="bg-background">
      <div className="container mx-auto px-6 lg:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/15 border border-foreground/15">
          {INDUSTRIES.map(({ slug, label, teaser, icon: Icon }) => (
            <Link
              key={slug}
              to={`/industries/${slug}`}
              className="group bg-background p-6 md:p-8 hover:bg-foreground/[0.04] transition-colors flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <Icon className="w-8 h-8 text-foreground" strokeWidth={1.25} />
                <ArrowUpRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground transition-colors" />
              </div>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-3 tracking-tight">
                {label}
              </h2>
              <p className="text-sm text-foreground/70 leading-relaxed">{teaser}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <Footer />
    <StickyContactBar />
  </div>
);

export default IndustriesIndex;
