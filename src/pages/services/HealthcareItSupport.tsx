import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HealthcareItSupport = () => {
  useEffect(() => {
    const title = "IT Support for Hospitals & Doctors’ Practices in South Africa: Reliable, Secure, and Always On";
    const description = "Siyakha Technology delivers IT support for hospitals and medical practices—including desktop on-site services, dedicated L1–L3 engineers, and secure remote support for critical healthcare systems.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/services/healthcare-it-support`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services/healthcare-it-support`);
  }, []);

  const serviceJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Healthcare IT Support",
    serviceType: "IT support for hospitals and medical practices",
    provider: { "@type": "Organization", name: "Siyakha Technology" },
    areaServed: ["South Africa"],
    audience: { "@type": "MedicalAudience", name: "Healthcare Providers" }
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">IT Support That Keeps Healthcare Running Without Downtime</h1>
            <p className="text-muted-foreground mt-4">
              In healthcare, every second matters. A failed computer, network outage, or software glitch can delay patient care, impact diagnoses, and disrupt critical operations. That’s why hospitals and medical practices need IT support that’s fast, secure, and reliable.
            </p>
            <p className="text-muted-foreground mt-4">
              At Siyakha Technology, we provide desktop on-site support, dedicated L1–L3 engineers, and remote IT services tailored for healthcare environments—ensuring your systems stay online and compliant at all times.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request Healthcare IT Support</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Our IT Services for Healthcare</h2>
            <div className="mt-6 grid md:grid-cols-2 gap-8 text-muted-foreground">
              <article>
                <h3 className="text-lg font-semibold text-foreground">Desktop On-Site Support</h3>
                <p className="mt-2">We troubleshoot and repair PCs, medical workstations, printers, and connected medical devices directly at your location—reducing downtime for clinical and admin staff.</p>
              </article>
              <article>
                <h3 className="text-lg font-semibold text-foreground">Dedicated L1–L3 Engineers</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>L1 Support:</strong> Resolving basic user issues like logins, printing, and application errors</li>
                  <li><strong>L2 Support:</strong> Handling more complex system and software challenges</li>
                  <li><strong>L3 Support:</strong> Senior-level engineers managing advanced infrastructure, networking, and specialized medical IT systems</li>
                </ul>
              </article>
              <article>
                <h3 className="text-lg font-semibold text-foreground">Remote IT Support for Healthcare</h3>
                <p className="mt-2">We resolve many issues remotely—saving time and reducing patient care interruptions. Remote services include software troubleshooting, EHR/EMR support, security patching, and network monitoring.</p>
              </article>
              <article>
                <h3 className="text-lg font-semibold text-foreground">Critical Environment Support</h3>
                <p className="mt-2">We assign dedicated engineers to monitor and respond to issues in critical healthcare systems—ensuring that diagnostic equipment, patient record systems, and communications remain fully operational.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Supporting Hospitals & Medical Practices Across South Africa</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-6 text-muted-foreground">
              <article>
                <h3 className="text-lg font-semibold text-foreground">Hospitals</h3>
                <p className="mt-2">We’ve supported large hospitals with electronic health record (EHR) migrations, network security upgrades, and system monitoring to keep medical data secure and accessible.</p>
              </article>
              <article>
                <h3 className="text-lg font-semibold text-foreground">Specialist Practices</h3>
                <p className="mt-2">From radiology labs to dental offices, we’ve deployed secure Wi‑Fi, integrated specialized medical software, and provided HIPAA-aligned data backup solutions.</p>
              </article>
              <article>
                <h3 className="text-lg font-semibold text-foreground">Clinics & Day Surgery Centers</h3>
                <p className="mt-2">We’ve handled VoIP installations, cloud-based practice management software rollouts, and hardware replacements—often after hours to avoid disrupting patient care.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Why Healthcare Trusts Siyakha Technology</h2>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fast response times – On-site or remote, we act quickly to minimize disruption</li>
              <li>Industry-specific expertise – Knowledge of healthcare compliance and medical IT systems</li>
              <li>24/7 availability – Support for urgent, after-hours situations</li>
              <li>Security-focused – Protecting sensitive patient data and ensuring compliance</li>
              <li>Nationwide coverage – Technicians ready to deploy anywhere in South Africa</li>
            </ul>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Real Impact for Healthcare Providers</h2>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-2">
              <li>Reduced IT-related patient care delays by up to 65%</li>
              <li>Improved medical data access speeds by 40% after infrastructure upgrades</li>
              <li>Increased staff productivity through proactive monitoring and maintenance</li>
            </ul>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Keep Your Healthcare Systems Healthy</h2>
            <p className="text-muted-foreground mt-2">Whether you run a single doctor’s practice or manage a large hospital network, Siyakha Technology ensures your IT systems work when they matter most.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Contact Us</Button></Link>
              <Link to="/support-deals" className="inline-flex"><Button variant="outline">See Support Deals</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
    </div>
  );
};

export default HealthcareItSupport;
