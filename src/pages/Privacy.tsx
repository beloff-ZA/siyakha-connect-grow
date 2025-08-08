import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  useEffect(() => {
    const title = "Privacy Policy | Siyakha Technology";
    const description = "How Siyakha Technology collects, uses, and protects your information. Your privacy matters to us.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/privacy`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/privacy`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy",
    description: "Siyakha Technology Privacy Policy",
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Privacy Policy</h1>
            <div className="prose prose-invert mt-4 max-w-none text-muted-foreground">
              <p>Your privacy is important to us. This policy explains what information we collect, how we use it, and your rights.</p>
              <h2>Information We Collect</h2>
              <ul>
                <li>Contact details (name, email, phone)</li>
                <li>Business details you provide in our forms</li>
                <li>Usage data (analytics)</li>
              </ul>
              <h2>How We Use Information</h2>
              <ul>
                <li>To respond to enquiries and provide services</li>
                <li>To improve our website and offerings</li>
                <li>To meet legal obligations</li>
              </ul>
              <h2>Your Rights</h2>
              <p>You can request access, correction, or deletion of your data. Contact us at info@siyakhatechnology.co.za.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default Privacy;