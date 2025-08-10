import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogPreview from "@/components/BlogPreview";
import heroImage from "@/assets/hero-bg.jpg";

const BlogIndex = () => {
  useEffect(() => {
    const title = "Siyakha Tech Blog: EdTech, Automation & AI";
    const description = "EdTech, automation, AI, smart home and business solutions—plus YouTube channels we follow.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/blog`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/blog`);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Network and cloud technology background" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">EdTech, Automation & AI — Siyakha Tech Blog</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">Insights on EdTech, automation, AI, smart home and business solutions. We'll also share YouTube channels we follow and practical guides.</p>
          </div>
        </section>
        <BlogPreview />
      </main>
      <Footer />
    </div>
  );
};

export default BlogIndex;
