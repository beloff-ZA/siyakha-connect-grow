import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import schoolProject from "@/assets/school-project.jpg";

const CloudAndEdgeSolutions = () => {
  useEffect(() => {
    const title = "Cloud & Edge Solutions | Siyakha Technology";
    const description = "High-availability cloud, NComputing virtual desktops, and secure disaster recovery across SA. Local hosting in JHB, DBN & CPT.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/services/cloud-and-edge-solutions`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services/cloud-and-edge-solutions`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Cloud & Edge Solutions",
    serviceType: "Cloud collaboration, backup, and edge computing",
    provider: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    areaServed: ["South Africa", "Angola", "Swaziland", "Bahrain", "California", "Europe", "Kazakhstan"],
  }), []);

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can you integrate NComputing with our current network?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. We provide complete planning, installation, and integration with your existing environment." }
      },
      {
        "@type": "Question",
        name: "How are backups monitored?",
        acceptedAnswer: { "@type": "Answer", text: "Our systems include 24/7 monitoring, automated alerts, and regular health checks to ensure every backup is valid and ready for recovery." }
      },
      {
        "@type": "Question",
        name: "Is my data secure?",
        acceptedAnswer: { "@type": "Answer", text: "Absolutely. All data is encrypted before it leaves your site and stored in secure, access-controlled datacentres." }
      }
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Cloud collaboration and secure infrastructure" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Cloud & Edge Solutions</h1>
            <p className="text-muted-foreground mt-3 max-w-3xl">High-availability cloud, intelligent edge computing, and enterprise-grade disaster recovery — designed for speed, security, and resilience.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Quote</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-10 items-center max-w-6xl">
            <div>
              <h2 className="text-2xl font-semibold text-primary">Our Solutions</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li><span className="font-medium text-foreground">NComputing Virtual Desktops</span> – Reduce hardware costs and centralise management for offices, schools, and call centres.</li>
                <li><span className="font-medium text-foreground">Cloud Backup & Disaster Recovery</span> – Continuous, monitored backups with AES-256 encryption and app-aware snapshots.</li>
                <li><span className="font-medium text-foreground">High Availability Cloud Hosting</span> – Multi-homed redundancy with automated failover to minimise downtime.</li>
                <li><span className="font-medium text-foreground">Edge Computing</span> – Process data closer to the source for faster response and lower latency.</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <img src={schoolProject} alt="Cloud adoption in education with collaboration tools" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/329436ed-9b85-46bd-9a90-9921225137c1.png"} alt="Secure remote access and Zero Trust architecture" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/702d31a8-30a3-4dc4-880f-1366edaf8911.png"} alt="Cloud backup and disaster recovery" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/4ce3794c-caeb-4109-b893-cf137d3054d1.png"} alt="Edge computing enabling real‑time processing" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/908085b7-2411-4a24-8acc-a3515a6f1778.png"} alt="Microsoft rack servers powering private cloud infrastructure" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/5a56026a-1cff-4f03-85a4-7e78ec87c498.png"} alt="Microsoft storage nodes for high‑availability workloads" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/78863186-b345-495b-a0fb-54a33bee0268.png"} alt="HPE server rack cabinet prepared for datacenter deployment" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Why Businesses Choose Siyakha Cloud</h2>
            <div className="mt-4 grid md:grid-cols-2 gap-8 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground">High Availability</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Reduce downtime — hours become minutes with automated failover</li>
                  <li>Multi-homed redundancy — datacentres in JHB, DBN, and CPT with multiple ISPs</li>
                  <li>Flexible RTO — choose recovery objectives that match your needs</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Performance & Scalability</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>SSD storage with RAID for high IOPS and reliability</li>
                  <li>Premium bandwidth with direct peering to NAPAfrica, CINX, and Seacom</li>
                  <li>Full virtualization (KVM) for Windows and Linux workloads</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Security & Data Integrity</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Military-grade encryption — AES-256 client-side encryption for all backups</li>
                  <li>Application-aware backups for Exchange, SQL, and more</li>
                  <li>Bare-metal recovery to restore entire systems without reconfiguration</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Ease of Management</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Instant setup — new or rebuilt servers live in record time</li>
                  <li>Full access — Remote Desktop for Windows; custom kernels for Linux</li>
                  <li>Hassle-free migration — we handle moves from your current provider</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Disaster Recovery That Works</h2>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-2">
              <li>Continuous monitoring with proactive alerts</li>
              <li>Scheduled test recoveries to verify readiness</li>
              <li>Failover strategies designed for your environment</li>
              <li>Cloud-to-cloud replication for maximum resilience</li>
            </ul>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Close to Home</h2>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-2">
              <li>Johannesburg Data Centre</li>
              <li>Durban Data Centre</li>
              <li>Cape Town Data Centre</li>
            </ul>
          </div>
        </section>

        <section className="py-8 md:py-12 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Cloud & Edge FAQs</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground">Can you integrate NComputing with our current network?</h3>
                <p>Yes. We provide complete planning, installation, and integration with your existing environment.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">How are backups monitored?</h3>
                <p>Our systems include 24/7 monitoring, automated alerts, and regular health checks to ensure every backup is valid and ready for recovery.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Is my data secure?</h3>
                <p>Absolutely. All data is encrypted before it leaves your site and stored in secure, access-controlled datacentres.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Get Started with Siyakha Cloud</h2>
            <p className="text-muted-foreground mt-2">Whether you need a new cloud deployment, virtual desktops for hundreds of users, or a disaster recovery plan that works in minutes, we’ll design a solution tailored to your business.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Quote</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>📞 <a href="tel:+27877027411" className="underline underline-offset-4">087 702 7411</a> <span className="ml-2">/ <a href="tel:+27815012993" className="underline underline-offset-4">081 501 2993</a></span></p>
              <p>📧 <a href="mailto:info@siyakhatechnology.co.za" className="underline underline-offset-4">info@siyakhatechnology.co.za</a></p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
};

export default CloudAndEdgeSolutions;
