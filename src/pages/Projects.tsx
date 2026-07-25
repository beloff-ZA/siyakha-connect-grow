import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSEO from "@/components/site/SiteSEO";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { CASE_STUDIES } from "@/content/caseStudies";

const CLIENT_TYPES = ["All", "Estates", "Commercial", "Schools", "Government"] as const;
const REGIONS = ["All", "South Africa", "GCC", "UK"] as const;

function inferClientType(industry: string): string {
  const i = industry.toLowerCase();
  if (i.includes("school") || i.includes("training") || i.includes("education")) return "Schools";
  if (i.includes("student") || i.includes("estate") || i.includes("residential")) return "Estates";
  if (i.includes("government") || i.includes("border")) return "Government";
  return "Commercial";
}

function inferRegion(location: string): string {
  const l = location.toLowerCase();
  if (l.includes("dubai") || l.includes("riyadh") || l.includes("doha") || l.includes("uae") || l.includes("qatar") || l.includes("saudi")) return "GCC";
  if (l.includes("london") || l.includes("uk")) return "UK";
  return "South Africa";
}

const Projects = () => {
  const [clientType, setClientType] = useState<string>("All");
  const [region, setRegion] = useState<string>("All");

  const filtered = useMemo(
    () =>
      CASE_STUDIES.filter((s) => {
        const ct = inferClientType(s.industry);
        const r = inferRegion(s.location);
        return (clientType === "All" || ct === clientType) && (region === "All" || r === region);
      }),
    [clientType, region],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteSEO
        title="Projects — Siyakha Interlink"
        description="Filterable case studies across estates, commercial sites, schools and government — from South Africa, the GCC and the UK."
        path="/projects"
      />
      <Header />
      <section className="bg-background border-b border-foreground/10">
        <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/60 hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
          <h1 className="font-display font-light text-4xl md:text-6xl tracking-[-0.02em] text-foreground leading-[1.02]">
            Projects.
          </h1>

          <div className="mt-10 flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/50 mb-2">Client type</p>
              <div className="flex flex-wrap gap-2">
                {CLIENT_TYPES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setClientType(c)}
                    className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] border ${clientType === c ? "bg-foreground text-background border-foreground" : "border-foreground/20 text-foreground/70 hover:text-foreground"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/50 mb-2">Region</p>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] border ${region === r ? "bg-foreground text-background border-foreground" : "border-foreground/20 text-foreground/70 hover:text-foreground"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto px-6 lg:px-10 py-16 md:py-20">
          {filtered.length === 0 ? (
            <p className="text-foreground/60 italic">No projects match that filter yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
              {filtered.map((s) => (
                <Link
                  key={s.slug}
                  to={`/case-studies/${s.slug}`}
                  className="group bg-background hover:bg-foreground/[0.03] transition-colors flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-foreground/5">
                    <img src={s.hero} alt={s.title} className="w-full h-full object-cover grayscale group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/50 mb-3">
                      {inferClientType(s.industry)} · {inferRegion(s.location)}
                    </p>
                    <div className="font-display text-lg text-foreground tracking-tight leading-snug mb-3">
                      {s.title}
                    </div>
                    <p className="text-[13px] text-foreground/70 leading-relaxed flex-1">{s.summary}</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 group-hover:text-foreground">
                      Read case study <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Projects;