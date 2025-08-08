import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  useEffect(() => {
    const title = "Terms of Service | Siyakha Technology";
    const description = "Read the terms governing the use of Siyakha Technology’s services and website.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/terms`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/terms`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service",
    description: "Siyakha Technology Terms of Service",
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Terms of Service</h1>
            <div className="prose prose-invert mt-4 max-w-none text-muted-foreground">
              <p>By using our services and website, you agree to the following terms. Please read them carefully.</p>
              <h2>Use of Services</h2>
              <p>You agree to use our services in compliance with applicable laws and not to engage in abusive or harmful behavior.</p>
              <h2>Payments</h2>
              <p>Invoices are due as agreed. Late payments may incur fees.</p>
              <h2>Liability</h2>
              <p>We are not liable for indirect or consequential damages. Our liability is limited to amounts paid for services.</p>
              <h2>Changes</h2>
              <p>We may update these terms from time to time. Continued use constitutes acceptance.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default Terms;