import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import BlogViews from "@/components/BlogViews";

const ITMigration = () => {
  useEffect(() => {
    const title = "IT Migration Services in South Africa: Seamless Data & System Transfers for Insurance, Mining, and Construction";
    const description = "Siyakha Technology provides expert IT migration services across South Africa. From insurance companies to mines and construction groups, we deliver seamless, secure, and zero-downtime migrations.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/blog/it-migration-services-south-africa`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/blog/it-migration-services-south-africa`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "IT Migration Services in South Africa: Seamless Data & System Transfers for Insurance, Mining, and Construction",
    description: "Siyakha Technology provides expert IT migration services across South Africa. From insurance companies to mines and construction groups, we deliver seamless, secure, and zero-downtime migrations.",
    author: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    publisher: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    datePublished: "2022-10-15",
    dateModified: "2022-10-15",
    keywords: [
      "IT migration services South Africa",
      "Data migration for insurance companies",
      "Cloud migration for mining",
      "Construction IT system upgrades",
      "Zero downtime migration South Africa",
      "Secure system migration services",
      "Enterprise IT infrastructure migration",
      "Application migration South Africa"
    ],
    mainEntityOfPage: `${window.location.origin}/blog/it-migration-services-south-africa`,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <article className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Reliable IT Migration Services That Keep Your Business Moving Forward</h1>
            <div className="text-sm text-muted-foreground mt-2"><BlogViews increment /></div>
            <p className="text-muted-foreground mt-3">Migrating your IT systems is like changing the engine on a moving train — it has to be done without stopping the ride. Whether it’s moving to the cloud, upgrading infrastructure, or transferring critical applications to a new environment, a poorly executed migration can lead to costly downtime, data loss, and frustrated teams.</p>
            <p className="text-muted-foreground mt-3">At Siyakha Technology, we’ve successfully handled complex IT migrations for insurance companies, mining operations, and large construction groups — ensuring a smooth transition with zero data loss and minimal disruption.</p>

            <section className="prose prose-invert mt-8 max-w-none">
              <h2 className="text-xl font-semibold text-primary">What is an IT Migration?</h2>
              <p>IT migration is the process of moving data, applications, or entire IT systems from one environment to another — this could mean:</p>
              <ul>
                <li>Migrating from on‑premise servers to the cloud</li>
                <li>Moving between cloud service providers</li>
                <li>Upgrading outdated infrastructure to modern, scalable platforms</li>
                <li>Consolidating multiple systems into a unified environment</li>
              </ul>
              <p>Our migration process is planned, tested, and executed with precision to ensure security, compliance, and operational continuity.</p>

              <h2 className="text-xl font-semibold text-primary mt-6">Industries We’ve Helped with Seamless Migrations</h2>
              <h3 className="text-lg font-semibold text-foreground mt-4">Insurance Companies</h3>
              <p>For a major insurance group, we completed a data center migration involving thousands of client records, policy management systems, and CRM platforms. We ensured data integrity, maintained regulatory compliance, and avoided service interruptions — allowing their call centers and online platforms to continue operations without downtime.</p>

              <h3 className="text-lg font-semibold text-foreground mt-4">Mining Operations</h3>
              <p>Mines operate on tight schedules, where IT downtime can impact production. We’ve migrated process control systems, equipment monitoring software, and communications platforms to modern, resilient infrastructure — improving performance while maintaining uptime in remote and harsh environments.</p>

              <h3 className="text-lg font-semibold text-foreground mt-4">Construction Groups</h3>
              <p>Construction firms depend on project management tools, CAD software, and cloud‑based collaboration. We’ve successfully migrated systems to high‑availability cloud environments, enabling multiple site offices and contractors to access the same real‑time data — boosting productivity and reducing project delays.</p>

              <h2 className="text-xl font-semibold text-primary mt-6">Our Migration Approach</h2>
              <ul>
                <li><strong>Assessment & Planning</strong> – Understanding your systems, dependencies, and risks</li>
                <li><strong>Testing & Validation</strong> – Running migration simulations before the real cut‑over</li>
                <li><strong>Phased Execution</strong> – Minimizing downtime through staged migration</li>
                <li><strong>Security & Compliance</strong> – Ensuring data protection and adherence to industry regulations</li>
                <li><strong>Post‑Migration Support</strong> – Continuous monitoring to ensure stability after the move</li>
              </ul>

              <h2 className="text-xl font-semibold text-primary mt-6">Why Choose Siyakha Technology for Your IT Migration?</h2>
              <ul>
                <li>Industry‑specific expertise in insurance, mining, and construction</li>
                <li>Zero‑downtime strategies for critical operations</li>
                <li>Nationwide on‑site and remote capabilities</li>
                <li>Certified technical specialists with proven migration success</li>
              </ul>

              <h2 className="text-xl font-semibold text-primary mt-6">Real Results for Real Businesses</h2>
              <ul>
                <li><strong>Insurance Sector:</strong> Migrated 5TB of sensitive data with zero loss and full compliance</li>
                <li><strong>Mining Sector:</strong> Improved system performance by 40% post‑migration</li>
                <li><strong>Construction Sector:</strong> Reduced project collaboration delays by 60% after moving to a unified cloud platform</li>
              </ul>

              <h2 className="text-xl font-semibold text-primary mt-6">Ready for a Smooth Migration?</h2>
              <p>Whether you’re upgrading systems, consolidating platforms, or moving to the cloud, Siyakha Technology delivers fast, secure, and disruption‑free IT migrations.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Plan My Migration</Button></Link>
                <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
              </div>
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

export default ITMigration;
