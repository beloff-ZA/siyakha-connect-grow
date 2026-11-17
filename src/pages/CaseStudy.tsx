import { useParams, Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import LeadMagnetDialog from "@/components/leads/LeadMagnetDialog";
import { getCaseStudy } from "@/content/caseStudies";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import ProjectTypeCover from "@/components/site/ProjectTypeCover";
import ProjectServices from "@/components/site/ProjectServices";
import ShareCaseStudy from "@/components/site/ShareCaseStudy";

const CaseStudy = () => {
  const { slug = "" } = useParams();
  const study = getCaseStudy(slug);
  if (!study) return <Navigate to="/" replace />;
  const isRetailPartnerSupport = study.slug === "franchise-firewall-wifi-rollout";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${study.client} — ${study.title}`,
    ...(study.hero ? { image: study.hero } : {}),
    ...(study.year ? { datePublished: study.year } : {}),
    author: { "@type": "Organization", name: "Siyakha Technology" },
    publisher: { "@type": "Organization", name: "Siyakha Technology" },
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteSEO
        title={`${study.client} — ${study.title} | Siyakha Technology`}
        description={study.summary}
        path={`/case-studies/${study.slug}`}
        jsonLd={jsonLd}
      />
      <Header />

      <section className="bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-16 md:py-24">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60 hover:text-foreground mb-10"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-5">
            {["Case Study", study.industry, study.location, study.year].filter(Boolean).join(" · ")}
          </p>
          {study.clientIdentity && (
            <img
              src={study.clientIdentity.logo}
              alt={`${study.client} logo`}
              width={study.clientIdentity.width}
              height={study.clientIdentity.height}
              className="block w-44 h-auto object-contain mb-8"
              decoding="async"
            />
          )}
          <h1 className="font-display font-light text-4xl md:text-6xl tracking-[-0.02em] text-foreground leading-[1.05] max-w-4xl">
            {study.client}
          </h1>
          <p className="mt-4 font-display text-xl md:text-2xl font-extralight italic text-foreground/85 max-w-3xl">
            {study.title}
          </p>
          {study.status && <p className="mt-6 border-l-2 border-foreground pl-4 text-sm font-semibold text-foreground">{study.status}</p>}
          <p className="mt-8 text-base md:text-lg text-foreground/75 leading-relaxed max-w-2xl">
            {study.summary}
          </p>
          <ShareCaseStudy study={study} variant="full" className="mt-10" />
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto px-6 lg:px-10 py-16">
          <figure className={study.heroPhoto?.portrait ? "max-w-2xl mx-auto" : ""}>
          <div className={study.heroPhoto?.preserveFullScene ? "border border-foreground/15" : study.heroPhoto?.portrait ? "aspect-[3/4] overflow-hidden border border-foreground/15" : "aspect-[16/9] overflow-hidden border border-foreground/15"}>
            {study.typeCover ? <ProjectTypeCover client={study.client} subtitle={study.typeCover.subtitle} /> : <img
              src={study.hero}
              alt={study.heroPhoto?.alt ?? `${study.client} — ${study.title}`}
              width={study.heroPhoto?.width ?? 1920}
              height={study.heroPhoto?.height ?? 1080}
              className={study.heroPhoto?.preserveFullScene ? "block w-full h-auto object-contain" : study.heroPhoto?.portrait ? "w-full h-full object-contain" : "w-full h-full object-cover grayscale"}
            />}
          </div>
          {study.heroPhoto?.caption && <figcaption className="mt-3 text-sm text-foreground/60">{study.heroPhoto.caption}</figcaption>}
          {study.typeCover && <figcaption className="mt-3 text-sm text-foreground/60">{study.typeCover.caption}</figcaption>}
          </figure>
        </div>
      </section>

      {study.beforeAfter && (
        <section className="bg-background border-t border-foreground/10">
          <div className="container mx-auto px-6 lg:px-10 py-20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
              Before & After
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05] max-w-3xl">
              {study.beforeAfter.title}
            </h2>
            <p className="mt-6 max-w-2xl text-base md:text-lg text-foreground/75 leading-relaxed">
              {study.beforeAfter.caption}
            </p>
            <div className="mt-12 grid md:grid-cols-2 gap-px bg-foreground/15 border border-foreground/15">
              <figure className="bg-background">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={study.beforeAfter.before.src}
                    alt={study.beforeAfter.before.alt}
                    className="w-full h-full object-cover grayscale"
                    loading="lazy"
                  />
                </div>
                <figcaption className="px-5 py-4 text-[11px] uppercase tracking-[0.24em] text-foreground/70">
                  Before
                </figcaption>
              </figure>
              <figure className="bg-background">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={study.beforeAfter.after.src}
                    alt={study.beforeAfter.after.alt}
                    className="w-full h-full object-cover grayscale"
                    loading="lazy"
                  />
                </div>
                <figcaption className="px-5 py-4 text-[11px] uppercase tracking-[0.24em] text-foreground/70">
                  After
                </figcaption>
              </figure>
            </div>
          </div>
        </section>
      )}

      {study.gallery && study.gallery.length > 0 && (
        <section className="bg-background border-t border-foreground/10">
          <div className="container mx-auto px-6 lg:px-10 py-16">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-8">
              {study.factual?.galleryLabel ?? "On-Site Gallery"}
            </p>
            {study.gallery.some((g) => !g.enhanced) && <div className={`grid sm:grid-cols-2 ${study.gallery.filter((g) => !g.enhanced).length === 2 ? "lg:grid-cols-2" : study.factual ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-px bg-foreground/15 border border-foreground/15`}>
              {study.gallery.filter((g) => !g.enhanced).map((g) => (
                <figure key={g.src} className="bg-background">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={g.src}
                      alt={g.alt ?? g.caption}
                      width={g.width}
                      height={g.height}
                      className="w-full h-full object-cover grayscale"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <figcaption className="px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-foreground/70">
                    {g.caption}
                  </figcaption>
                </figure>
              ))}
            </div>}
            {study.gallery.filter((g) => g.enhanced).map((g) => (
              <figure key={g.src} className="mt-12 border border-foreground/15 bg-background">
                <div className="p-4 flex justify-center">
                  <img
                    src={g.src}
                    alt={g.alt ?? g.caption}
                    width={g.width}
                    height={g.height}
                    className="block w-auto max-w-full h-auto max-h-[85vh] object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className="px-4 pb-4 text-[11px] uppercase tracking-[0.22em] text-foreground/70">
                  {g.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {study.sequence && study.sequence.items.length > 0 && (
        <section className="bg-background border-t border-foreground/10">
          <div className="container mx-auto px-6 lg:px-10 py-20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
              Cleanup Sequence
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05] max-w-3xl">
              {study.sequence.title}
            </h2>
            {study.sequence.caption && (
              <p className="mt-6 max-w-2xl text-base md:text-lg text-foreground/75 leading-relaxed">
                {study.sequence.caption}
              </p>
            )}
            <div className="mt-12 grid sm:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
              {study.sequence.items.map((g, i) => (
                <figure key={g.src} className="bg-background">
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img
                      src={g.src}
                      alt={g.caption}
                      className="w-full h-full object-cover grayscale"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 bg-background/90 text-foreground text-[10px] uppercase tracking-[0.24em] px-2 py-1">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <figcaption className="px-4 py-4 text-[11px] uppercase tracking-[0.22em] text-foreground/70">
                    {g.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {study.factual ? (
        <section className="bg-background border-t border-foreground/10">
          <div className="container mx-auto px-6 lg:px-10 py-20">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">Project overview</p>
                {study.factual.scopeMetric && (
                  <div className="mb-8">
                    <p className="font-display text-6xl md:text-7xl font-light text-foreground">{study.factual.scopeMetric.value}</p>
                    <p className="mt-2 text-sm text-foreground/60">{study.factual.scopeMetric.label}</p>
                  </div>
                )}
                <p className="text-base md:text-lg text-foreground/80 leading-relaxed">{study.factual.overview}</p>
                <ProjectServices services={study.services} className="mt-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6">{study.factual.scopeLabel ?? "Installation scope"}</p>
                <ul className="space-y-4">
                  {study.factual.scope.map((r) => (
                    <li key={r} className="flex items-start gap-3 text-foreground/85 text-base md:text-lg">
                      {study.status ? <Circle className="w-5 h-5 mt-1 flex-shrink-0" strokeWidth={1.5} /> : <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" strokeWidth={1.5} />}
                      {r}
                    </li>
                  ))}
                </ul>
                {study.equipment && (
                  <div className="mt-10 border-t border-foreground/10 pt-6">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-5">Equipment used</p>
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                      {study.equipment.map((equipment) => (
                        <img
                          key={equipment.name}
                          src={equipment.logo}
                          alt={`${equipment.name} logo`}
                          width={equipment.width}
                          height={equipment.height}
                          className="block w-36 h-10 object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
      <section className="bg-background border-t border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">The Problem</p>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed">{study.problem}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">The Solution</p>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed">{study.solution}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background border-t border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6">Installation Process</p>
              <ol className="space-y-4">
                {study.process.map((p, i) => (
                  <li key={p} className="flex gap-4 text-foreground/80">
                    <span className="font-display text-2xl font-extralight text-foreground/40 w-8 flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="pt-1.5">{p}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6">Results Delivered</p>
              <ul className="space-y-4">
                {study.results.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-foreground/85 text-base md:text-lg">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" strokeWidth={1.5} />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="mt-10 text-[11px] uppercase tracking-[0.24em] text-foreground/55 mb-3">
                Services Included
              </p>
              <ProjectServices services={study.services} />
            </div>
          </div>
        </div>
      </section>

        </>
      )}

      <section className="bg-foreground text-background">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-24">
          <div className="max-w-3xl">
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
              {isRetailPartnerSupport ? (
                <>Need on-site support for <span className="italic font-extralight">your retail project</span>?</>
              ) : study.factual ? (
                <>Planning a project for <span className="italic font-extralight">your site</span>?</>
              ) : (
                <>Want results like this for <span className="italic font-extralight">your site</span>?</>
              )}
            </h2>
            <p className="mt-6 text-base md:text-lg text-background/75 leading-relaxed max-w-2xl">
              {isRetailPartnerSupport
                ? "Tell us about your ICT company's retail project and the on-site support you need."
                : study.factual
                ? "Tell us about your site and Siyakha will be in touch to discuss your requirements."
                : "Book a free site assessment. We'll walk your premises, audit what you have and design the right infrastructure for your next chapter."}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              {study.factual ? (
                <Link
                  to="/#enquiry"
                  className="bg-background text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/90 transition-colors"
                >
                  Contact Siyakha
                </Link>
              ) : (
              <LeadMagnetDialog
                kind="Free Site Assessment"
                context={`Case study CTA: ${study.client}`}
                trigger={
                  <button className="bg-background text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/90 transition-colors">
                    Book Free Site Assessment
                  </button>
                }
              />
              )}
              <Link
                to="/managed-it"
                className="border border-background/40 text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/10 transition-colors"
              >
                Explore Managed IT
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CaseStudy;