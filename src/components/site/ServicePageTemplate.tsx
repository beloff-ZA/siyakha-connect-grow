import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "./SiteSEO";
import LeadMagnetDialog, { LeadMagnetKind } from "@/components/leads/LeadMagnetDialog";
import WhySiyakhaBand from "./WhySiyakhaBand";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { LucideIcon, ArrowLeft } from "lucide-react";

export interface ServiceCapability {
  icon: LucideIcon;
  title: string;
  body: string;
}

interface Props {
  seoTitle: string;
  seoDescription: string;
  path: string;
  serviceType: string;
  overline: string;
  headlineLead: string;
  headlineItalic: string;
  body: string;
  primaryCtaKind: LeadMagnetKind;
  primaryCtaLabel: string;
  capabilities: ServiceCapability[];
  capabilitiesOverline: string;
  capabilitiesHeading: ReactNode;
  whatsappMessage: string;
  finalCtaHeadlineLead: string;
  finalCtaHeadlineItalic: string;
  finalCtaBody: string;
  finalCtaKind: LeadMagnetKind;
  finalCtaLabel: string;
  extraSection?: ReactNode;
}

const ServicePageTemplate = ({
  seoTitle,
  seoDescription,
  path,
  serviceType,
  overline,
  headlineLead,
  headlineItalic,
  body,
  primaryCtaKind,
  primaryCtaLabel,
  capabilities,
  capabilitiesOverline,
  capabilitiesHeading,
  whatsappMessage,
  finalCtaHeadlineLead,
  finalCtaHeadlineItalic,
  finalCtaBody,
  finalCtaKind,
  finalCtaLabel,
  extraSection,
}: Props) => {
  const whatsappUrl = buildWhatsAppUrl("+27815012993", whatsappMessage);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType,
    provider: {
      "@type": "Organization",
      name: "Siyakha Technology",
      telephone: "+27 81 501 2993",
      email: "nikita@siyakhatechnology.co.za",
      url: "https://siyakhatechnology.co.za",
    },
    areaServed: { "@type": "Country", name: "South Africa" },
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteSEO title={seoTitle} description={seoDescription} path={path} jsonLd={jsonLd} />
      <Header />

      <section className="bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-24 md:py-32">
          <div className="max-w-4xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60 hover:text-foreground mb-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back home
            </Link>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-5">{overline}</p>
            <h1 className="font-display font-light text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] text-foreground leading-[1.02]">
              {headlineLead}
              <br />
              <span className="italic font-extralight">{headlineItalic}</span>.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-foreground/75 leading-relaxed max-w-2xl">{body}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <LeadMagnetDialog
                kind={primaryCtaKind}
                context={`${serviceType} hero`}
                trigger={
                  <button className="bg-foreground text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/90 transition-colors">
                    {primaryCtaLabel}
                  </button>
                }
              />
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-foreground/30 text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/[0.04] transition-colors"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
              {capabilitiesOverline}
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
              {capabilitiesHeading}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
            {capabilities.map(({ icon: Icon, title, body: cb }) => (
              <div key={title} className="bg-background p-6 md:p-8 hover:bg-foreground/[0.03] transition-colors">
                <Icon className="w-8 h-8 text-foreground mb-6" strokeWidth={1.25} />
                <div className="font-display text-lg md:text-xl text-foreground mb-3 tracking-tight">{title}</div>
                <p className="text-[13px] text-foreground/70 leading-relaxed">{cb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {extraSection}

      <WhySiyakhaBand />

      <section className="bg-foreground text-background">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">
              Free Assessment · No Obligation
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
              {finalCtaHeadlineLead}
              <br />
              <span className="italic font-extralight">{finalCtaHeadlineItalic}</span>.
            </h2>
            <p className="mt-6 text-base md:text-lg text-background/75 leading-relaxed max-w-2xl">{finalCtaBody}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <LeadMagnetDialog
                kind={finalCtaKind}
                context={`${serviceType} final CTA`}
                trigger={
                  <button className="bg-background text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/90 transition-colors">
                    {finalCtaLabel}
                  </button>
                }
              />
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-background/40 text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/10 transition-colors"
              >
                WhatsApp 081 501 2993
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicePageTemplate;