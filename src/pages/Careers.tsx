import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Careers = () => {
  useEffect(() => {
    const title = "Careers | Siyakha Technology";
    const description = "Join Siyakha Technology. Explore roles in networking, security, cloud, and support. Send your CV to our talent team.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/careers`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/careers`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Careers",
    description: "Careers at Siyakha Technology",
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Careers at Siyakha</h1>
            <p className="text-muted-foreground mt-3">We’re always on the lookout for talented engineers and support specialists (L1–L3). If you’re passionate about ICT and client success, we’d love to hear from you.</p>
            <div className="mt-6 space-y-2 text-muted-foreground">
              <p>Send your CV and a short motivation to: careers@siyakhatechnology.co.za</p>
              <p>Roles we commonly hire for: Network Engineers, Security Technicians, Cloud Specialists, Desktop Support (L1/L2/L3), and Project Coordinators.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default Careers;