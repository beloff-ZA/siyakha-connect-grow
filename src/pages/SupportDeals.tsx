import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SupportDeals = () => {
  useEffect(() => {
    const title = "Global Support Deals | Siyakha Technology";
    const description = "Sell-by-call and monthly support packages for international companies. Remote desktop support L1, L2, L3 from South Africa.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/support-deals`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/support-deals`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Global Remote Support Deals",
    serviceType: "Sell-by-call and monthly desktop support (L1–L3)",
    provider: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    areaServed: ["Global"],
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Global Support Deals</h1>
            <p className="text-muted-foreground mt-3">We provide remote desktop support (L1, L2, L3) to international companies and groups — flexible sell-by-call or monthly packages, delivered from South Africa.</p>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-primary">What We Offer</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li>Sell-by-call desktop support (pay per incident)</li>
                <li>Monthly support retainers (SLAs available)</li>
                <li>Remote L1, L2, L3 desktop and app support</li>
                <li>Overflow and after-hours coverage for global teams</li>
                <li>Tooling: Secure remote access, ticketing, and reporting</li>
              </ul>
              <div className="mt-6 flex gap-3">
                <Link to="/log-a-call" className="inline-flex"><Button className="cta-primary">Log a Call</Button></Link>
                <Link to="/contact#quote-form" className="inline-flex"><Button variant="outline">Request a Monthly Deal</Button></Link>
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default SupportDeals;