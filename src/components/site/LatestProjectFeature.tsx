import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { getCaseStudy } from "@/content/caseStudies";

const LATEST_SLUG = "capital-air-randburg";

const LatestProjectFeature = () => {
  const study = getCaseStudy(LATEST_SLUG);
  if (!study) return null;
  return (
    <section aria-labelledby="latest-project-heading" className="bg-background border-t border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10 py-14 md:py-20">
        <Link
          to={`/case-studies/${study.slug}`}
          className="group grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-px bg-foreground/15 border border-foreground/15"
        >
          <div className="aspect-[4/3] md:aspect-auto md:min-h-[300px] overflow-hidden bg-background">
            <img
              src={study.hero}
              alt="Exterior of the Capital Air building in Randburg"
              width={1152}
              height={1536}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover grayscale group-hover:scale-[1.03] transition-transform duration-500"
            />
          </div>
          <div className="bg-background p-6 md:p-10 flex flex-col justify-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
              Latest project · {study.location} · {study.year}
            </p>
            <h2
              id="latest-project-heading"
              className="font-display font-light text-2xl md:text-4xl tracking-[-0.02em] text-foreground leading-[1.1]"
            >
              {study.title}
            </h2>
            <p className="mt-4 text-[15px] text-foreground/75 leading-relaxed max-w-xl">{study.summary}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 group-hover:text-foreground">
              View project <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default LatestProjectFeature;
