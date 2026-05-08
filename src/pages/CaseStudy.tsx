import { useParams, Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import LeadMagnetDialog from "@/components/leads/LeadMagnetDialog";
import { getCaseStudy } from "@/content/caseStudies";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const CaseStudy = () => {
  const { slug = "" } = useParams();
  const study = getCaseStudy(slug);
  if (!study) return <Navigate to="/" replace />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${study.client} — ${study.title}`,
    image: study.hero,
    datePublished: study.year,
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
            Case Study · {study.industry} · {study.location} · {study.year}
          </p>
          <h1 className="font-display font-light text-4xl md:text-6xl tracking-[-0.02em] text-foreground leading-[1.05] max-w-4xl">
            {study.client}
          </h1>
          <p className="mt-4 font-display text-xl md:text-2xl font-extralight italic text-foreground/85 max-w-3xl">
            {study.title}
          </p>
          <p className="mt-8 text-base md:text-lg text-foreground/75 leading-relaxed max-w-2xl">
            {study.summary}
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto px-6 lg:px-10 py-16">
          <div className="aspect-[16/9] overflow-hidden border border-foreground/15">
            <img
              src={study.hero}
              alt={`${study.client} — ${study.title}`}
              width={1920}
              height={1080}
              className="w-full h-full object-cover grayscale"
            />
          </div>
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
              On-Site Gallery
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/15 border border-foreground/15">
              {study.gallery.map((g) => (
                <figure key={g.src} className="bg-background">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={g.src}
                      alt={g.caption}
                      className="w-full h-full object-cover grayscale"
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-foreground/70">
                    {g.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
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
              <div className="flex flex-wrap gap-2">
                {study.services.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] uppercase tracking-[0.22em] text-foreground/75 border border-foreground/20 px-3 py-1.5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-foreground text-background">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-24">
          <div className="max-w-3xl">
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
              Want results like this for <span className="italic font-extralight">your site</span>?
            </h2>
            <p className="mt-6 text-base md:text-lg text-background/75 leading-relaxed max-w-2xl">
              Book a free site assessment. We'll walk your premises, audit what you have and design
              the right infrastructure for your next chapter.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <LeadMagnetDialog
                kind="Free Site Assessment"
                context={`Case study CTA: ${study.client}`}
                trigger={
                  <button className="bg-background text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/90 transition-colors">
                    Book Free Site Assessment
                  </button>
                }
              />
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