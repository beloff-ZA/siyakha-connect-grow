import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { CaseStudy } from "@/content/caseStudies";

interface Props {
  study: CaseStudy;
}

const CaseStudyCard = ({ study }: Props) => (
  <Link
    to={`/case-studies/${study.slug}`}
    className="group block bg-background border border-foreground/15 hover:border-foreground/40 transition-colors"
  >
    <div className="aspect-[16/10] overflow-hidden bg-foreground/5">
      <img
        src={study.hero}
        alt={`${study.client} — ${study.title}`}
        loading="lazy"
        width={1920}
        height={1080}
        className="w-full h-full object-cover grayscale group-hover:scale-[1.02] transition-transform duration-700"
      />
    </div>
    <div className="p-6 md:p-8">
      <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/55 mb-3">
        {study.industry} · {study.location} · {study.year}
      </p>
      <h3 className="font-display text-xl md:text-2xl font-light text-foreground tracking-tight">
        {study.client}
      </h3>
      <p className="mt-2 text-sm text-foreground/70">{study.title}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground border-b border-foreground/30 pb-1 group-hover:border-foreground">
        View Case Study
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
      </span>
    </div>
  </Link>
);

export default CaseStudyCard;