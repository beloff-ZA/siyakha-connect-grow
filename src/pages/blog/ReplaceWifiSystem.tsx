import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";

const ReplaceWifiSystem = () => {
  useEffect(() => {
    const title = "When to Replace Your Wi‑Fi System | Siyakha";
    const description = "Dead zones, slow speeds, disconnects? Learn the top signs it’s time to replace your Wi‑Fi with a modern, secure, business‑grade system.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/blog/how-to-know-when-its-time-to-replace-your-wi-fi-system`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/blog/how-to-know-when-its-time-to-replace-your-wi-fi-system`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Know When It’s Time to Replace Your Wi‑Fi System",
    description: "Dead zones, slow speeds, disconnects? Learn the top signs it’s time to replace your Wi‑Fi with a modern, secure, business‑grade system.",
    author: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    publisher: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    datePublished: "2017-09-18",
    dateModified: "2017-09-18",
    mainEntityOfPage: `${window.location.origin}/blog/how-to-know-when-its-time-to-replace-your-wi-fi-system`,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <article className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              How to Know When It’s Time to Replace Your Wi‑Fi System
            </h1>
            <p className="text-muted-foreground mt-3">Your internet might be working — but is it working well?</p>

            <section className="prose prose-invert mt-8 max-w-none">
              <p>If you're still relying on outdated routers, tangled cables, and inconsistent signals, it might be time for a Wi‑Fi system upgrade. Here’s how to tell:</p>
              <ul>
                <li><strong>Dead Zones Everywhere:</strong> Some offices or classrooms get no signal. Your APs are in the wrong places — or you need more of them.</li>
                <li><strong>Slow Speeds Despite Fast Internet:</strong> The problem may be outdated hardware. Old routers, switches, and APs choke modern bandwidth.</li>
                <li><strong>Devices Constantly Disconnect:</strong> Too many devices on networks not built for capacity. Wi‑Fi 6 can support dozens per room reliably.</li>
                <li><strong>Using Home‑Grade Gear for Business:</strong> Extenders and off‑the‑shelf routers won’t cut it. You need enterprise APs with controller software.</li>
                <li><strong>No Guest/Staff Separation or Controls:</strong> Shared networks are a security risk. Segment networks and manage access with proper policies.</li>
              </ul>
              <p className="mt-6">Siyakha designs and deploys secure, scalable Wi‑Fi for schools and businesses. We’ll assess your environment and recommend a future‑ready upgrade path.</p>
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

export default ReplaceWifiSystem;
