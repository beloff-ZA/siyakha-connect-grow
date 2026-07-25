import { Link, useParams, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import WhySiyakhaBand from "@/components/site/WhySiyakhaBand";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getCapability } from "@/content/capabilities";
import { getCaseStudy } from "@/content/caseStudies";

const CapabilityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const cap = slug ? getCapability(slug) : undefined;
  if (!cap) return <Navigate to="/" replace />;
  const Icon = cap.icon;
  const caseStudy = cap.caseStudySlug ? getCaseStudy(cap.caseStudySlug) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <SiteSEO
        title={`${cap.label} — Siyakha Interlink`}
        description={cap.what}
        path={`/capabilities/${cap.slug}`}
      />
      <Header />

      <section className="bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-24 md:py-32">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60 hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Icon className="w-6 h-6 text-foreground" strokeWidth={1.25} />
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60">Capability</p>
            </div>
            <h1 className="font-display font-light text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] text-foreground leading-[1.02]">
              {cap.label}.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-foreground/75 leading-relaxed max-w-2xl">
              {cap.what}
            </p>
            <div className="mt-10">
              <Link
                to="/#qualify"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/90"
              >
                Talk to us about {cap.label.toLowerCase()} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6">
              How it works
            </p>
            <ul className="space-y-4">
              {cap.how.map((h, i) => (
                <li key={h} className="flex gap-4 text-foreground/85">
                  <span className="font-display text-foreground/40 text-sm pt-1">0{i + 1}</span>
                  <span className="text-sm md:text-base leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6">
              Who it's for
            </p>
            <p className="text-base md:text-lg text-foreground/85 leading-relaxed">{cap.who}</p>
          </div>
        </div>
      </section>

      {caseStudy && (
        <section className="bg-foreground text-background">
          <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-8">
              Relevant case study
            </p>
            <Link
              to={`/case-studies/${caseStudy.slug}`}
              className="group grid md:grid-cols-2 gap-8 md:gap-12 items-center border border-background/25 p-6 md:p-10 hover:bg-background/[0.05] transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden bg-background/5">
                <img
                  src={caseStudy.hero}
                  alt={caseStudy.title}
                  className="w-full h-full object-cover grayscale group-hover:scale-[1.03] transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-background/50 mb-3">
                  {caseStudy.industry} · {caseStudy.location}
                </p>
                <div className="font-display text-2xl md:text-3xl text-background tracking-tight leading-snug mb-4">
                  {caseStudy.title}
                </div>
                <p className="text-sm text-background/70 leading-relaxed">{caseStudy.summary}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-background/70 group-hover:text-background">
                  Read the case study <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      <WhySiyakhaBand />
      <Footer />
    </div>
  );
};

export default CapabilityPage;