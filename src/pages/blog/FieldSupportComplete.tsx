import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FieldSupportComplete = () => {
  useEffect(() => {
    const title = "Complete Field Support: On‑Site, Remote & Dedicated Engineers";
    const description = "Desktop on‑site support, remote IT assistance, and dedicated L1–L3 engineers across South Africa. Fast, reliable field support and Smart Hands.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/blog/complete-field-support-solutions-on-site-remote-and-dedicated-engineers`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/blog/complete-field-support-solutions-on-site-remote-and-dedicated-engineers`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Complete Field Support Solutions – On‑Site, Remote, and Dedicated Engineers",
    description: "Desktop on‑site support, remote IT assistance, and dedicated L1–L3 engineers across South Africa. Fast, reliable field support and Smart Hands.",
    author: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    publisher: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    datePublished: "2022-06-09",
    dateModified: "2022-06-09",
    keywords: [
      "Desktop on-site IT support South Africa",
      "Dedicated IT engineers L1 L2 L3",
      "Remote IT support for companies",
      "Smart Hands services South Africa",
      "On-site IT field technicians",
      "Critical environment IT support"
    ],
    mainEntityOfPage: `${window.location.origin}/blog/complete-field-support-solutions-on-site-remote-and-dedicated-engineers`,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <article className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Complete Field Support Solutions – On‑Site, Remote, and Dedicated Engineers</h1>
            <p className="text-muted-foreground mt-3">
              In a world where technology powers every part of your business, IT issues can’t wait. Whether your staff need help with desktop
              problems, your infrastructure requires on‑site attention, or you want a dedicated engineer monitoring critical systems, Siyakha
              Technology is your trusted IT support partner.
            </p>
            <p className="text-muted-foreground mt-3">
              We offer desktop on‑site support, dedicated Level 1 to Level 3 engineers, and remote IT assistance for companies across South
              Africa. From quick fixes to high‑priority environment issues, our team ensures you stay operational — 24/7 if needed.
            </p>

            <section className="prose prose-invert mt-8 max-w-none">
              <h2 className="text-xl font-semibold text-primary">Our Field Support & Smart Hands Services</h2>

              <h3 className="text-lg font-semibold text-foreground mt-4">Desktop On‑Site Support</h3>
              <p>Our technicians visit your premises to troubleshoot and repair desktop PCs, laptops, printers, and peripherals. Whether it’s hardware failure, software issues, or connectivity problems, we get your workstations running again quickly.</p>

              <h3 className="text-lg font-semibold text-foreground mt-4">Dedicated L1–L3 Engineers</h3>
              <p>We provide Level 1 to Level 3 support tailored to your needs:</p>
              <ul>
                <li><strong>L1 (First‑Line Support):</strong> Quick fixes, password resets, and basic troubleshooting</li>
                <li><strong>L2 (Second‑Line Support):</strong> Deeper problem‑solving for complex software and hardware issues</li>
                <li><strong>L3 (Third‑Line Support):</strong> Senior engineers handling advanced infrastructure and system‑level issues</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4">Remote IT Support for Companies</h3>
              <p>With remote access tools, we resolve many problems without needing to be on‑site — reducing downtime and cutting costs. This includes software troubleshooting, patch management, network checks, and user assistance.</p>

              <h3 className="text-lg font-semibold text-foreground mt-4">Dedicated Engineers for Critical Environments</h3>
              <p>For businesses with mission‑critical systems, we assign dedicated engineers who know your environment inside out, monitor its health, and respond immediately to potential issues.</p>

              <h2 className="text-xl font-semibold text-primary mt-6">Industries We’ve Helped with Field Support</h2>

              <h3 className="text-lg font-semibold text-foreground mt-4">Franchises</h3>
              <p>Upgraded POS systems, repaired network failures, and deployed new workstations across multiple branches without disrupting daily trade.</p>

              <h3 className="text-lg font-semibold text-foreground mt-4">Software Companies</h3>
              <p>Provided on‑site hardware support for development teams, assisted with server migrations, and maintained uptime for client‑facing environments.</p>

              <h3 className="text-lg font-semibold text-foreground mt-4">Logistics & Warehousing</h3>
              <p>Kept barcode scanners, label printers, and network points operational, ensuring goods moved on schedule.</p>

              <h3 className="text-lg font-semibold text-foreground mt-4">Hospitality & Events</h3>
              <p>Supported high‑traffic venues by keeping booking systems, payment terminals, and guest Wi‑Fi online during peak events.</p>

              <h2 className="text-xl font-semibold text-primary mt-6">Why Businesses Choose Siyakha Technology for IT Support</h2>
              <ul>
                <li>Full‑spectrum support – Desktop, network, and server environments</li>
                <li>Flexible options – On‑site, remote, or dedicated engineer models</li>
                <li>Nationwide coverage – Technicians in multiple regions across South Africa</li>
                <li>Fast response times – Priority handling for critical issues</li>
                <li>Proven industry experience – Supporting retail, SaaS, hospitality, logistics, and more</li>
              </ul>

              <h2 className="text-xl font-semibold text-primary mt-6">The Siyakha Impact</h2>
              <ul>
                <li>Cut IT downtime by up to 70%</li>
                <li>Reduce maintenance costs by switching to hybrid remote/on‑site models</li>
                <li>Keep key systems operational 24/7 in high‑demand industries</li>
              </ul>

              <h2 className="text-xl font-semibold text-primary mt-6">Get Reliable IT Support Today</h2>
              <p>Whether you need desktop on‑site repairs, a dedicated L1–L3 engineer, or remote support for your company, Siyakha Technology delivers fast, reliable, and scalable IT services across South Africa.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request IT Support</Button></Link>
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

export default FieldSupportComplete;
