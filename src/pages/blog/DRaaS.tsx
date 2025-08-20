import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogViews from "@/components/BlogViews";
import ShareButtons from "@/components/ShareButtons";

const DRaaS = () => {
  useEffect(() => {
    const title = "DRaaS: Disaster Recovery as a Service - Complete Guide 2025";
    const description = "Discover how DRaaS (Disaster Recovery as a Service) ensures business continuity with cloud-based backup solutions, minimal downtime, and cost-effective disaster recovery.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/blog/draas`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/blog/draas`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "DRaaS: Disaster Recovery as a Service - Complete Guide 2025",
    description: "Discover how DRaaS (Disaster Recovery as a Service) ensures business continuity with cloud-based backup solutions, minimal downtime, and cost-effective disaster recovery.",
    author: {
      "@type": "Organization",
      name: "Siyakha Technology"
    },
    publisher: {
      "@type": "Organization",
      name: "Siyakha Technology"
    },
    datePublished: "2025-01-20",
    dateModified: "2025-01-20",
    mainEntityOfPage: `${typeof window !== 'undefined' ? window.location.origin : ''}/blog/draas`
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-primary mb-4">🛡️ DRaaS: Disaster Recovery as a Service - Complete Guide 2025</h1>
          <BlogViews slug="draas" />
          
          <div className="text-muted-foreground mb-8">
            <p>January 20, 2025 • 8 min read • Business Continuity</p>
          </div>

          <p className="text-lg text-muted-foreground mb-8">
            In today's digital landscape, business continuity isn't just important—it's critical. Discover how DRaaS provides comprehensive disaster recovery solutions that keep your business running no matter what challenges arise.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">🛡️ What is DRaaS?</h2>
            <p className="mb-4">
              Disaster Recovery as a Service (DRaaS) is a cloud-based solution that allows businesses to back up their IT infrastructure and applications in a third-party cloud environment. In case of disasters (cyberattacks, power failures, natural disasters, or hardware failures), DRaaS enables quick recovery of systems and data with minimal downtime.
            </p>
            <p className="mb-4">
              It's essentially business continuity in the cloud — ensuring your company keeps running even when your on-premises systems fail.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">⚙️ How DRaaS Works</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Replication</h3>
                <p>Your servers, data, and applications are continuously replicated to a secure cloud environment.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Failover</h3>
                <p>If a disaster strikes, operations automatically "fail over" to the provider's cloud data center. Users continue working with little or no interruption.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Failback</h3>
                <p>Once the issue is resolved, workloads and data are migrated back to your primary infrastructure.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">🌍 Key Benefits of DRaaS</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Reduced Downtime</strong> – Quickly restore services to meet strict SLAs.</li>
              <li><strong>Lower Costs</strong> – No need for a secondary physical site; pay-as-you-go model.</li>
              <li><strong>Scalability</strong> – Scale protection as your infrastructure grows.</li>
              <li><strong>Accessibility</strong> – Cloud-based recovery means users can access critical systems from anywhere.</li>
              <li><strong>Compliance & Security</strong> – Many DRaaS providers meet compliance frameworks (HIPAA, GDPR, POPIA in South Africa).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">🔑 DRaaS vs. Traditional Disaster Recovery</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left">Feature</th>
                    <th className="border border-border p-3 text-left">Traditional DR</th>
                    <th className="border border-border p-3 text-left">DRaaS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 font-medium">Infrastructure</td>
                    <td className="border border-border p-3">Requires own secondary site</td>
                    <td className="border border-border p-3">Cloud-based (third-party hosted)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-medium">Cost</td>
                    <td className="border border-border p-3">High upfront CAPEX</td>
                    <td className="border border-border p-3">Pay-per-use, OPEX</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-medium">Scalability</td>
                    <td className="border border-border p-3">Limited by hardware</td>
                    <td className="border border-border p-3">Elastic cloud resources</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-medium">Deployment Speed</td>
                    <td className="border border-border p-3">Weeks/Months</td>
                    <td className="border border-border p-3">Hours/Days</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-medium">Maintenance</td>
                    <td className="border border-border p-3">In-house IT team</td>
                    <td className="border border-border p-3">Managed by provider</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">🏢 DRaaS Use Cases</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Ransomware Attacks</strong> – Rapid failover to unaffected cloud systems.</li>
              <li><strong>Power Outages or Natural Disasters</strong> – Ensures business continuity.</li>
              <li><strong>Hardware Failures</strong> – Cloud recovery prevents prolonged downtime.</li>
              <li><strong>Compliance Needs</strong> – Businesses needing reliable recovery plans for audits.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">🔍 Leading DRaaS Providers (2025)</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Microsoft Azure Site Recovery</li>
              <li>VMware Cloud Disaster Recovery</li>
              <li>Zerto</li>
              <li>Veeam Cloud DR</li>
              <li>Amazon Web Services (AWS Elastic Disaster Recovery)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">🚀 Why It Matters for Businesses Like Yours</h2>
            <p className="mb-4">
              For companies in IT services, education, retail, and finance (like Siyakha Technology's clients), downtime equals lost revenue and broken trust. DRaaS helps ensure:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Always-on client support</li>
              <li>Minimal disruption for students, customers, or end-users</li>
              <li>Stronger credibility as a tech solutions provider</li>
            </ul>
          </section>

          <div className="bg-muted p-6 rounded-lg mt-8">
            <h3 className="text-xl font-semibold text-primary mb-3">Ready to Protect Your Business?</h3>
            <p className="mb-4">
              Don't wait for disaster to strike. Siyakha Technology can help you implement a comprehensive DRaaS solution tailored to your business needs.
            </p>
            <p>
              Contact us today to learn how we can keep your business running, no matter what challenges arise.
            </p>
          </div>

          <ShareButtons 
            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/blog/draas`}
            title="DRaaS: Disaster Recovery as a Service - Complete Guide 2025"
          />
        </article>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
};

export default DRaaS;