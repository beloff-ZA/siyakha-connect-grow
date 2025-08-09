import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";

const HardwareUpgrade = () => {
  useEffect(() => {
    const title = "Upgrade Hardware Before It Slows You Down | Siyakha";
    const description = "Old laptops and servers slow teams and raise risk. Learn why upgrading hardware is an investment that pays off.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/blog/why-you-need-to-upgrade-your-hardware-before-it-slows-you-down`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/blog/why-you-need-to-upgrade-your-hardware-before-it-slows-you-down`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Why You Need to Upgrade Your Hardware Before It Slows You Down",
    description: "Old laptops and servers slow teams and raise risk. Learn why upgrading hardware is an investment that pays off.",
    author: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    publisher: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    datePublished: "2021-05-28",
    dateModified: "2021-05-28",
    mainEntityOfPage: `${window.location.origin}/blog/why-you-need-to-upgrade-your-hardware-before-it-slows-you-down`,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <article className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Why You Need to Upgrade Your Hardware Before It Slows You Down</h1>
            <p className="text-muted-foreground mt-3">Outdated laptops, old servers, and worn‑out switches might seem like small issues — until they cost you real time and money.</p>

            <section className="prose prose-invert mt-8 max-w-none">
              <h2 className="text-xl font-semibold text-primary">Here’s why upgrading is an investment</h2>
              <ul>
                <li><strong>Better Speed, Better Output:</strong> Newer devices include faster processors, more memory, and better compatibility.</li>
                <li><strong>Increased Staff Productivity:</strong> Slow computers frustrate teams and reduce output.</li>
                <li><strong>Improved Security:</strong> Old hardware cannot always run the latest security updates.</li>
                <li><strong>Lower Long‑Term Maintenance Costs:</strong> Less downtime and fewer repairs.</li>
                <li><strong>Future‑Proofing:</strong> Cloud and collaboration tools demand current hardware.</li>
              </ul>
              <p className="mt-6">Siyakha offers customized upgrade solutions — from laptops and servers to network switches and printers. Let us assess your infrastructure and recommend the best path forward.</p>
            </section>
            <div className="mt-8">
              <ShareButtons />
            </div>
          </div>
        </article>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default HardwareUpgrade;
