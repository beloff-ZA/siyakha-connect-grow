import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import BlogViews from "@/components/BlogViews";

const NComputing = () => {
  useEffect(() => {
    const title = "NComputing: Affordable Classroom Computing | Siyakha";
    const description = "Equip more students for less. Learn how NComputing shares one PC across multiple learners — efficient, low‑cost, and easy to manage.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/blog/ncomputing-the-smart-affordable-solution-for-schools`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/blog/ncomputing-the-smart-affordable-solution-for-schools`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "NComputing: The Smart, Affordable Solution for Schools",
    description: "Equip more students for less. Learn how NComputing shares one PC across multiple learners — efficient, low‑cost, and easy to manage.",
    author: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    publisher: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    datePublished: "2020-08-06",
    dateModified: "2020-08-06",
    mainEntityOfPage: `${window.location.origin}/blog/ncomputing-the-smart-affordable-solution-for-schools`,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <article className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">NComputing: The Smart, Affordable Solution for Schools</h1>
            <div className="text-sm text-muted-foreground mt-2"><BlogViews increment /></div>
            <p className="text-muted-foreground mt-3">In today’s digital learning age, every student needs access to a computer — but not every school has the budget for dozens of laptops. Enter NComputing — a powerful, cost‑effective solution used by schools across South Africa.</p>

            <section className="prose prose-invert mt-8 max-w-none">
              <h2 className="text-xl font-semibold text-primary">What is NComputing?</h2>
              <p>NComputing allows multiple students to share a single computer (host), using low‑cost access terminals. It’s efficient, easy to maintain, and perfect for classrooms.</p>
              <h2 className="text-xl font-semibold text-primary mt-6">Benefits for Schools</h2>
              <ul>
                <li>Budget‑Friendly — Up to 75% cheaper than buying individual PCs.</li>
                <li>Energy Efficient — Lower electricity use and heat output.</li>
                <li>Low Maintenance — Fewer systems to update and manage.</li>
                <li>Space Saving — Small, lightweight terminals reduce clutter.</li>
                <li>Ideal for Computer Labs — Great for teaching and research.</li>
              </ul>

              <h2 className="text-xl font-semibold text-primary mt-6">How Siyakha Can Help</h2>
              <p>We’ll assess your classroom needs, provide hardware and setup, and offer full support. Many schools we’ve worked with have doubled access to technology — without doubling costs.</p>
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

export default NComputing;
