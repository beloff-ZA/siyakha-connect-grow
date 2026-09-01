import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import LeadCtaRow from "@/components/site/LeadCtaRow";
import EnquiryForm from "@/components/site/EnquiryForm";
import StickyContactBar from "@/components/site/StickyContactBar";
import { getIndustry } from "@/content/industries";
import { buildServiceSchema } from "@/lib/seoSchema";
import { BRAND } from "@/lib/brand";

const IndustryPage = () => {
  const { slug = "" } = useParams();
  const industry = getIndustry(slug);
  if (!industry) return <Navigate to="/industries" replace />;

  const path = `/industries/${industry.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <SiteSEO
        title={`IT, Networks & Security for ${industry.label} — Johannesburg & Durban | ${BRAND.name}`}
        description={`${industry.intro} ${BRAND.name} serves Johannesburg, Sandton, Durban and KwaZulu-Natal.`.slice(0, 300)}
        path={path}
        jsonLd={buildServiceSchema({
          serviceType: `${industry.leadService} for ${industry.label}`,
          description: industry.intro,
          path,
        })}
      />
      <Header />

      <section className="bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="max-w-4xl">
            <Link
              to="/industries"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60 hover:text-foreground mb-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All industries
            </Link>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-5">
              Industry · Johannesburg &amp; Durban
            </p>
            <h1 className="font-display font-light text-4xl md:text-6xl tracking-[-0.02em] text-foreground leading-[1.04]">
              {industry.label}
            </h1>
            <p className="mt-8 text-lg md:text-xl text-foreground/75 leading-relaxed max-w-2xl">
              {industry.intro}
            </p>
            <div className="mt-10">
              <LeadCtaRow
                service={industry.leadService}
                location={industry.leadLocation}
                primaryLabel="Request an assessment"
                whatsappMessage={`Hi Siyakha, I'm enquiring about technology support for ${industry.label.toLowerCase()}.`}
                context={`${industry.slug} hero`}
              />
            </div>
            <p className="mt-5 text-[13px] text-foreground/60">{BRAND.ownerReplyLine}</p>
          </div>
        </div>
      </section>

      <section className="bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            <div>
              <h2 className="font-display font-light text-2xl md:text-3xl tracking-tight text-foreground mb-6">
                Problems we are asked to fix
              </h2>
              <ul className="space-y-4">
                {industry.problems.map((p) => (
                  <li
                    key={p}
                    className="border-l border-foreground/20 pl-4 text-sm text-foreground/75 leading-relaxed"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display font-light text-2xl md:text-3xl tracking-tight text-foreground mb-6">
                What we typically deliver
              </h2>
              <ul className="space-y-3">
                {industry.delivers.map((d) => (
                  <li key={d} className="flex gap-3 text-sm text-foreground/75 leading-relaxed">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground" strokeWidth={1.5} />
                    {d}
                  </li>
                ))}
              </ul>
              <Link
                to="/services"
                className="mt-8 inline-flex text-[11px] uppercase tracking-[0.22em] text-foreground/70 hover:text-foreground border-b border-foreground/25 pb-1"
              >
                See all five service divisions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="enquiry" className="bg-foreground text-background scroll-mt-24">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">Talk to us</p>
              <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
                Tell us what is
                <br />
                <span className="italic font-extralight">not working.</span>
              </h2>
              <p className="mt-8 text-background/70 leading-relaxed max-w-md">
                {BRAND.ownerReplyLine}
              </p>
            </div>
            <EnquiryForm defaultService={industry.leadService} />
          </div>
        </div>
      </section>

      <Footer />
      <StickyContactBar />
    </div>
  );
};

export default IndustryPage;
