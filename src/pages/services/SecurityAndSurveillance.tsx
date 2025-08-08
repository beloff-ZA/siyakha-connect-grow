import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SecurityAndSurveillance = () => {
  useEffect(() => {
    const title = "Security & Surveillance | Siyakha";
    const description = "CCTV, access control, and smart surveillance systems that protect your people and assets.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/services/security-and-surveillance`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services/security-and-surveillance`);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Security & Surveillance</h1>
            <p className="text-muted-foreground mt-3">Intelligent CCTV, access control, and monitoring solutions that are scalable and secure.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SecurityAndSurveillance;
