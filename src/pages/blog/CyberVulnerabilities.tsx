import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CyberVulnerabilities = () => {
  useEffect(() => {
    const title = "Understanding Cyber Vulnerabilities & Protection | Siyakha";
    const description = "Common cyber risks and practical protections: patches, MFA, phishing training, and more to reduce business risk.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/blog/understanding-cyber-vulnerabilities-and-how-to-protect-your-business`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/blog/understanding-cyber-vulnerabilities-and-how-to-protect-your-business`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Understanding Cyber Vulnerabilities — and How to Protect Your Business",
    description: "Common cyber risks and practical protections: patches, MFA, phishing training, and more to reduce business risk.",
    author: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    publisher: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    datePublished: "2025-01-19",
    dateModified: "2025-01-19",
    mainEntityOfPage: `${window.location.origin}/blog/understanding-cyber-vulnerabilities-and-how-to-protect-your-business`,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <article className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Understanding Cyber Vulnerabilities — and How to Protect Your Business</h1>
            <p className="text-muted-foreground mt-3">Cybercrime is growing — and businesses of all sizes are targets. The first step in protecting your organization is understanding your vulnerabilities.</p>

            <section className="prose prose-invert mt-8 max-w-none">
              <h2 className="text-xl font-semibold text-primary">What Is a Vulnerability?</h2>
              <p>A vulnerability is a weakness in your systems or processes that attackers can exploit — like outdated software, weak passwords, or open ports.</p>
              <h3 className="text-lg font-semibold text-primary mt-4">Common Types</h3>
              <ul>
                <li>Unpatched Software</li>
                <li>Weak User Credentials</li>
                <li>Open Wi‑Fi Networks</li>
                <li>Phishing Scams</li>
              </ul>

              <h2 className="text-xl font-semibold text-primary mt-6">How Siyakha Protects You</h2>
              <ul>
                <li>Deploying firewalls, antivirus, and email filters</li>
                <li>Routine vulnerability scans</li>
                <li>User education on phishing and password hygiene</li>
                <li>Patch and update management</li>
                <li>Multi‑factor authentication (MFA)</li>
              </ul>
              <p className="mt-6">You can’t eliminate cyber risk — but you can drastically reduce it. Siyakha’s security audits and endpoint protection plans keep your data, your people, and your business safe.</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default CyberVulnerabilities;
