import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ManagedITMSP = () => {
  useEffect(() => {
    const title = "Why Growing Businesses Choose an MSP | Siyakha";
    const description = "MSPs cut costs, boost security, and scale your IT. Learn why a Managed Service Provider is essential for growing businesses.";
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
    ensureMeta("property", "og:type", "article");
    ensureMeta("property", "og:url", `${window.location.origin}/blog/why-every-growing-business-should-consider-a-managed-it-service-provider-msp`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/blog/why-every-growing-business-should-consider-a-managed-it-service-provider-msp`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Why Every Growing Business Should Consider a Managed IT Service Provider (MSP)",
    description: "MSPs cut costs, boost security, and scale your IT. Learn why a Managed Service Provider is essential for growing businesses.",
    author: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    publisher: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    datePublished: "2024-11-03",
    dateModified: "2024-11-03",
    mainEntityOfPage: `${window.location.origin}/blog/why-every-growing-business-should-consider-a-managed-it-service-provider-msp`,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <article className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              Why Every Growing Business Should Consider a Managed IT Service Provider (MSP)
            </h1>
            <p className="text-muted-foreground mt-3">As your business grows, so do your tech needs — and managing them internally can become overwhelming, costly, and inefficient.</p>

            <section className="prose prose-invert mt-8 max-w-none">
              <h2 className="text-xl font-semibold text-primary">What is an MSP?</h2>
              <p>An MSP is a third‑party company that handles your day‑to‑day IT operations — from hardware and networking to cybersecurity and support — so your team can focus on business, not IT problems.</p>

              <h2 className="text-xl font-semibold text-primary mt-6">Benefits of Using an MSP</h2>
              <ul>
                <li><strong>Predictable, Cost‑Effective IT Spend:</strong> Monthly retainers with proactive maintenance — fewer surprise bills.</li>
                <li><strong>24/7 Monitoring and Support:</strong> Issues are detected and resolved before they impact your operations.</li>
                <li><strong>Access to Enterprise‑Grade Tools:</strong> Antivirus, backup, firewall, and VoIP — at a lower total cost.</li>
                <li><strong>Scalability:</strong> Quickly onboard staff or open new sites without stress.</li>
                <li><strong>Security & Compliance:</strong> Best‑practice security and compliance with data protection laws.</li>
              </ul>

              <h2 className="text-xl font-semibold text-primary mt-6">How Siyakha Technology Helps</h2>
              <p>We act as your dedicated IT partner — managing networks, support, cloud services, cybersecurity, and more. Whether you’re a school, NGO, or business, we tailor our services to your needs so you can focus on what matters most: running your business.</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default ManagedITMSP;
