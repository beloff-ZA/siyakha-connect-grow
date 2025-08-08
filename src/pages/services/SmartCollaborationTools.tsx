import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import schoolProject from "@/assets/school-project.jpg";

const SmartCollaborationTools = () => {
  useEffect(() => {
    const title = "Smart Collaboration Tools | Siyakha Technology";
    const description = "VoIP telephony, video conferencing, digital whiteboards, and platform integrations. Training and managed support for teams and classrooms.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/services/smart-collaboration-tools`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services/smart-collaboration-tools`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Smart Collaboration Tools",
    serviceType: "Unified communications and collaboration systems",
    provider: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    areaServed: ["South Africa", "Angola", "Swaziland", "Bahrain", "California", "Europe", "Kazakhstan"],
  }), []);

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you deploy VoIP and integrate with CRMs?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. We can integrate your telephony with popular CRM and ERP systems for better customer tracking and reporting." }
      },
      {
        "@type": "Question",
        name: "Can you train our staff?",
        acceptedAnswer: { "@type": "Answer", text: "Absolutely. We run live and remote training sessions and provide best-practice documentation to help your team hit the ground running." }
      },
      {
        "@type": "Question",
        name: "Do you provide managed support?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Our managed services include remote monitoring, 24/7 fault reporting, and priority response under SLA." }
      }
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Unified communications and digital collaboration tools" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Smart Collaboration Tools</h1>
            <p className="text-muted-foreground mt-3 max-w-3xl">Empowering communication and teamwork with unified voice, video, and interactive solutions for offices, classrooms, and remote teams.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Quote</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-10 items-center max-w-6xl">
            <div>
              <h2 className="text-xl font-semibold text-primary">Our Collaboration Services Include</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li>VoIP systems (on‑premise & cloud‑hosted)</li>
                <li>Video conferencing setup (Zoom, Teams, Google Meet)</li>
                <li>Digital whiteboards and smart screens</li>
                <li>Integration with CRM and ERP platforms</li>
                <li>End‑user support and training</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={schoolProject} alt="Interactive classroom with digital whiteboards and conferencing" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/18df369d-304c-4290-97b8-53ae2aad27fb.png"} alt="Unified communication platform and devices" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/4ce3794c-caeb-4109-b893-cf137d3054d1.png"} alt="VoIP handsets and call center tools" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/702d31a8-30a3-4dc4-880f-1366edaf8911.png"} alt="Teams and Zoom multi‑room meeting setup" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <h2 className="text-xl font-semibold text-primary">Our Collaboration Services</h2>
            <div className="mt-4 grid md:grid-cols-2 gap-8 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground">VoIP Telephony (On-Premise & Cloud-Hosted)</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Enterprise-grade call clarity, advanced routing, call queues, and reporting</li>
                  <li>Support for 3CX, Yealink, Poly, Cisco, and hosted PBX</li>
                  <li>CRM integration (Salesforce, HubSpot, Zoho, SAP)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Video Conferencing Setup</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Zoom Rooms, Microsoft Teams Rooms, and Google Meet integration</li>
                  <li>Multi-room conferencing with calendar scheduling and one-click join</li>
                  <li>Bandwidth optimisation for smooth video</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Digital Whiteboards & Smart Displays</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Touch-enabled collaboration screens for meetings and lessons</li>
                  <li>Save and share annotations instantly with remote participants</li>
                  <li>Ideal for classrooms, training centres, and boardrooms</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Unified Communication Platforms</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Centralised messaging, file sharing, and video in one platform</li>
                  <li>Cross-device access with built-in security</li>
                  <li>Role-based permissions and encryption</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground">End-User Support & Training</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Tailored training programs for staff and educators</li>
                  <li>Best-practice guides and video tutorials</li>
                  <li>Managed SLAs with proactive monitoring and L1–L3 support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Where We Deliver Value</h2>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-2">
              <li>Corporate Headquarters – Unified voice and video for hybrid workforces</li>
              <li>Educational Institutions – Smart classrooms with digital whiteboards</li>
              <li>Call Centres & Helpdesks – Cloud VoIP with live analytics and CRM integration</li>
              <li>Multi-Site Businesses – Consistent systems across branches and countries</li>
            </ul>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">The Benefits of Smart Collaboration</h2>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-2">
              <li>Boost productivity with fast, reliable connectivity</li>
              <li>Improve customer experience with professional communication</li>
              <li>Enhance learning outcomes with interactive tools</li>
              <li>Reduce costs via cloud VoIP and virtual meeting tools</li>
              <li>Future-proof your workplace as needs grow</li>
            </ul>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <h2 className="text-xl font-semibold text-primary">Service Areas</h2>
            <p className="text-muted-foreground mt-2">We implement and support collaboration solutions across these locations.</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Link to="/it-company-johannesburg" className="block rounded-lg border border-border p-5 bg-card hover:bg-accent transition-colors">
                <h3 className="font-medium text-foreground">Johannesburg</h3>
                <p className="text-sm text-muted-foreground mt-1">Local support, rapid response.</p>
              </Link>
              <Link to="/it-company-cape-town" className="block rounded-lg border border-border p-5 bg-card hover:bg-accent transition-colors">
                <h3 className="font-medium text-foreground">Cape Town</h3>
                <p className="text-sm text-muted-foreground mt-1">City-wide coverage and onsite help.</p>
              </Link>
              <Link to="/it-company-london" className="block rounded-lg border border-border p-5 bg-card hover:bg-accent transition-colors">
                <h3 className="font-medium text-foreground">London</h3>
                <p className="text-sm text-muted-foreground mt-1">Affordable packages for SMEs.</p>
              </Link>
              <Link to="/it-company-emea" className="block rounded-lg border border-border p-5 bg-card hover:bg-accent transition-colors">
                <h3 className="font-medium text-foreground">EMEA</h3>
                <p className="text-sm text-muted-foreground mt-1">Regional coverage across Europe, Middle East, Africa.</p>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Smart Collaboration FAQs</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground">Do you deploy VoIP and integrate with CRMs?</h3>
                <p>Yes. We can integrate your telephony with popular CRM and ERP systems for better customer tracking and reporting.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Can you train our staff?</h3>
                <p>Absolutely. We run live and remote training sessions and provide best-practice documentation to help your team hit the ground running.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Do you provide managed support?</h3>
                <p>Yes. Our managed services include remote monitoring, 24/7 fault reporting, and priority response under SLA.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Ready to Transform Communication?</h2>
            <p className="text-muted-foreground mt-2">Let us help you create a collaboration environment that works anywhere — in the boardroom, the classroom, or remotely.</p>
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

export default SmartCollaborationTools;
