import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import officeProject from "@/assets/office-project.jpg";

const SecurityAndSurveillance = () => {
  useEffect(() => {
    const title = "CCTV Security & Surveillance | Siyakha Technology";
    const description = "We install CCTV, access control, alarms, and AI analytics nationwide. Certified Hikvision and Dahua partner. Free security assessment.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/services/security-and-surveillance`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services/security-and-surveillance`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Security & Surveillance",
    serviceType: "Electronic security systems and monitoring",
    provider: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    areaServed: ["South Africa", "Angola", "Swaziland", "Bahrain", "California", "Europe", "Kazakhstan"],
  }), []);

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you integrate with existing CCTV systems?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. We can upgrade analog to IP, integrate with your existing NVRs, and unify multi-brand environments into a single monitoring platform." }
      },
      {
        "@type": "Question",
        name: "Can we monitor cameras remotely?",
        acceptedAnswer: { "@type": "Answer", text: "Absolutely. We configure secure remote access with role-based permissions, so staff only see the feeds they need." }
      },
      {
        "@type": "Question",
        name: "Do you offer maintenance SLAs?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Our SLAs include preventative maintenance, regular health checks, priority call-outs, and rapid hardware replacement if needed." }
      }
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Enterprise CCTV and access control monitoring" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">CCTV Security & Surveillance</h1>
            <p className="text-muted-foreground mt-3 max-w-3xl">Safeguard your premises with smart, integrated security solutions — from CCTV and access control to alarms and AI-powered analytics.</p>
            <p className="text-muted-foreground mt-3 max-w-3xl">At Siyakha Technology, we design and deploy reliable, high-performance surveillance systems that protect your people, property, and assets 24/7. Whether it’s a single-site retail store or a multi-building campus, our security solutions combine industry-leading technology, skilled installation, and smart monitoring to give you complete peace of mind.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Quote</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-10 items-center max-w-6xl">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary">What We Offer</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li><span className="font-medium text-foreground">CCTV Installation & Integration</span> — IP and analog systems, tailored to your environment</li>
                <li><span className="font-medium text-foreground">Remote Access Monitoring</span> — View live feeds securely from anywhere, on any device</li>
                <li><span className="font-medium text-foreground">Smart Alerts & AI Analytics</span> — Motion detection, perimeter breaches, facial recognition, and people counting</li>
                <li><span className="font-medium text-foreground">Access Control Solutions</span> — Biometric, RFID card, and mobile credential systems</li>
                <li><span className="font-medium text-foreground">Alarm System Integration</span> — Seamlessly connect alarms, CCTV, and access control into one security platform</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={"/lovable-uploads/de3c5edc-ea87-4242-bbb0-8782b25a22ec.png"} alt="Campus CCTV overhaul with fibre backbone" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={officeProject} alt="Access control and intercom network in office complex" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/1840c802-41fe-4f29-ae89-891da2fe347c.png"} alt="Secure retail surveillance and network segmentation" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/329436ed-9b85-46bd-9a90-9921225137c1.png"} alt="AI‑enabled monitoring and smart alerts" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/fd161cb0-9b62-4f8f-a559-c382b6a38986.png"} alt="Security operations center with video wall monitoring multiple cameras" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/f6656558-5e83-4d94-bedb-d5b758a12048.png"} alt="Dahua outdoor bullet CCTV camera installed on perimeter" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/b1175ccd-d6f1-41ea-a02b-19b1103318a7.png"} alt="Siyakha CCTV service van on school campus" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/12ae638a-a66f-4aa3-b0db-0453c63806ce.png"} alt="Hikvision site surveillance rendered overview by Siyakha" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/5c53be57-de20-455a-aa49-6ac211db9e73.png"} alt="Hikvision pole camera monitoring pool area render" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/366f9679-7dae-428e-b777-145a950070f9.png"} alt="Hikvision H.265+ network camera inventory boxes ready for installation" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/aa8cab58-dcd5-45b7-a7bd-05cdff749da5.png"} alt="Hikvision Authorized Installer certificate for Siyakha Tech Solutions" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Our Track Record</h2>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-2">
              <li><span className="font-medium text-foreground">Campus CCTV Overhauls</span> – Fibre backbone connectivity for large-scale, high-definition monitoring</li>
              <li><span className="font-medium text-foreground">Retail Store Security</span> – Secure network segmentation for CCTV, POS, and Wi‑Fi</li>
              <li><span className="font-medium text-foreground">AI-Powered Monitoring</span> – Smart alerts for motion, loitering, and restricted-area access</li>
              <li><span className="font-medium text-foreground">Corporate Access Control</span> – Integrated intercoms, gates, and biometric scanners</li>
              <li><span className="font-medium text-foreground">Security Operations Centres</span> – Multi-screen video walls for real-time incident management</li>
            </ul>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Why Choose Siyakha Technology for Security</h2>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-2">
              <li><span className="font-medium text-foreground">Certified Installers</span> — Hikvision Authorized Installer & certified Dahua partner</li>
              <li><span className="font-medium text-foreground">End-to-End Service</span> — From design and supply to installation, training, and support</li>
              <li><span className="font-medium text-foreground">Future-Ready Solutions</span> — AI analytics, remote access, and cloud storage options</li>
              <li><span className="font-medium text-foreground">Minimal Downtime Installations</span> — Work scheduled around your business hours to reduce disruption</li>
              <li><span className="font-medium text-foreground">Nationwide Coverage</span> — Projects completed in Gauteng, Western Cape, KwaZulu-Natal, and beyond</li>
            </ul>
          </div>
        </section>

        <section className="py-8 md:py-12 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Security & Surveillance FAQs</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground">Do you integrate with existing CCTV systems?</h3>
                <p>Yes. We can upgrade analog to IP, integrate with your existing NVRs, and unify multi-brand environments into a single monitoring platform.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Can we monitor cameras remotely?</h3>
                <p>Absolutely. We configure secure remote access with role-based permissions, so staff only see the feeds they need.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Do you offer maintenance SLAs?</h3>
                <p>Yes. Our SLAs include preventative maintenance, regular health checks, priority call-outs, and rapid hardware replacement if needed.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Protect What Matters Most</h2>
            <p className="text-muted-foreground mt-2">Request a Quote today or Log a Call with our security specialists to discuss your site’s needs.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Quote</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>📞 <a href="tel:+27815012993" className="underline underline-offset-4">081 501 2993</a></p>
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

export default SecurityAndSurveillance;
