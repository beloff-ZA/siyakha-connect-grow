import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogPreview from "@/components/BlogPreview";

const BlogIndex = () => {
  useEffect(() => {
    const title = "Blog | Siyakha Technology Solutions";
    const description = "Insights and updates from Siyakha Technology Solutions on networking, security, cloud, and ICT best practices.";
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
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Blog</h1>
            <p className="text-muted-foreground mt-2">Latest articles and updates from our team.</p>
          </div>
        </section>
        <BlogPreview />
      </main>
      <Footer />
    </div>
  );
};

export default BlogIndex;
