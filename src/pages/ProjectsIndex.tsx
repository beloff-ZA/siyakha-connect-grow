import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Projects from "@/components/Projects";
import heroImage from "@/assets/hero-bg.jpg";
const ProjectsIndex = () => {
  useEffect(() => {
    const title = "Projects | Siyakha Technology Solutions";
    const description = "Explore featured ICT projects by Siyakha Technology Solutions including networking, security, cloud migrations, and more.";
    document.title = title;

    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(key, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    ensureMeta("name", "description", description);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}/projects`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/projects`);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={"/src/assets/hero-bg.jpg"} alt="Showcase of successful ICT projects" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Our Projects</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">A selection of recent deployments and case studies.</p>
          </div>
        </section>
        <Projects />
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsIndex;
