import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { getCaseStudy } from "@/content/caseStudies";

const LATEST_SLUGS = ["tiger-brands-boardroom-technology", "sun-international-head-office", "capital-air-randburg"];

const LatestProjectFeature = () => {
  const studies = LATEST_SLUGS.flatMap((slug) => {
    const study = getCaseStudy(slug);
    return study ? [study] : [];
  });
  if (!studies.length) return null;
  return (
    <section aria-labelledby="latest-project-heading" className="bg-background border-t border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-14 md:py-20">
        <h2 id="latest-project-heading" className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-8">Latest projects</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {studies.map((study) => (
        <Link
          key={study.slug}
          to={`/case-studies/${study.slug}`}
          className="group flex flex-col min-w-0 bg-background border border-foreground/15"
        >
          <div className="aspect-[4/3] overflow-hidden bg-background">
            <img
              src={study.hero}
              alt={study.heroPhoto?.alt ?? "Exterior of the Capital Air building in Randburg"}
              width={study.heroPhoto?.width ?? 1152}
              height={study.heroPhoto?.height ?? 1536}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-background p-6 md:p-8 flex flex-col flex-1">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
              {[study.industry, study.location, study.year].filter(Boolean).join(" · ")}
            </p>
            <h3
              className="font-display font-light text-2xl md:text-3xl text-foreground leading-[1.1]"
            >
              {study.title}
            </h3>
            <p className="mt-4 text-[15px] text-foreground/75 leading-relaxed max-w-xl">{study.summary}</p>
            <span className="mt-auto pt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 group-hover:text-foreground">
              View project <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
        </Link>
        ))}
        </div>
      </div>
    </section>
  );
};

export default LatestProjectFeature;
