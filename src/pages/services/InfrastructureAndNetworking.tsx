import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import officeProject from "@/assets/office-project.jpg";
import schoolProject from "@/assets/school-project.jpg";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const InfrastructureAndNetworking = () => {
  useEffect(() => {
    const title = "Infrastructure & Networking | Siyakha Technology";
    const description = "Infrastructure and networking for estates, malls, and commercial spaces — from fibre builds and structured cabling to student accommodation Wi‑Fi and future‑ready core networks.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/services/infrastructure-and-networking`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services/infrastructure-and-networking`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Infrastructure & Networking",
    serviceType: "Network infrastructure design and deployment",
    provider: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    areaServed: ["South Africa", "Angola", "Swaziland", "Bahrain", "California", "Europe", "Kazakhstan"],
  }), []);

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you work with schools and multi-site businesses?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. We design and deploy networks for schools, campuses and multi-branch organisations across South Africa and internationally." }
      },
      {
        "@type": "Question",
        name: "Can you upgrade our existing Wi‑Fi and cabling?",
        acceptedAnswer: { "@type": "Answer", text: "We audit, redesign and upgrade legacy Wi‑Fi and cabling to modern, secure standards with minimal downtime." }
      },
      {
        "@type": "Question",
        name: "Do you provide ongoing maintenance?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, we offer SLAs with proactive monitoring, regular updates and rapid onsite support." }
      }
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Enterprise network infrastructure cabling and Wi‑Fi" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Infrastructure & Networking</h1>
            <p className="text-muted-foreground mt-3 max-w-3xl">Powering reliable connectivity across campuses and enterprises — from cabling and Wi‑Fi to secure core networks and office moves.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Quote</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <p className="text-muted-foreground">
              At Siyakha Technology, we understand that fast, secure, and dependable connectivity is the backbone of every modern business, school, and organisation. Over the years, we’ve delivered structured cabling, Wi‑Fi deployment, and network upgrades for clients nationwide — from small branch offices to multi‑campus enterprises.
            </p>
            <p className="text-muted-foreground mt-4">
              Our team blends engineering precision with practical project experience, ensuring your infrastructure is built right the first time and ready to scale for the future.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-10 items-center max-w-6xl">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary">What We Offer</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li><strong>Structured Cabling —</strong> Cat6, Cat6a, and Fibre solutions for high‑performance, future‑proof networks</li>
                <li><strong>Network Design & Consulting —</strong> Tailored architecture for offices, campuses, and multi‑site businesses</li>
                <li><strong>Switches, Firewalls & Routers —</strong> Enterprise‑grade hardware from trusted brands like Fortinet, MikroTik, Cisco, and Netgear</li>
                <li><strong>Wi‑Fi Planning & Access Point Deployment —</strong> Optimised coverage and seamless roaming for staff, students, and guests</li>
                <li><strong>Ongoing Network Support & Upgrades —</strong> SLAs, proactive monitoring, and fast onsite assistance when you need it most</li>
              </ul>
              <p className="mt-6 text-muted-foreground">Ensure your connectivity is fast, secure, and built to scale.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <img src={officeProject} alt="Structured cabling and network rack in a corporate office" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={schoolProject} alt="Campus Wi‑Fi deployment and fibre backbone" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/7c314536-73bf-4ae1-b7e3-ccceee5d640e.png"} alt="Multi‑site student accommodation network upgrade" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/1840c802-41fe-4f29-ae89-891da2fe347c.png"} alt="National retail network rollout and Wi‑Fi" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/54631fb6-cfcc-47a9-a9f2-ab6cda0bdba2.png"} alt="Siyakha Technology server rack with high‑performance network speed test" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/79459ad6-5d83-4a33-a297-5f08aa5afa73.png"} alt="Wall‑mounted patch panel and managed switch neatly cabled" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/9ed725e2-216a-460c-828c-7562bdacd359.png"} alt="Organised rack with labeled patch panels and coiled Cat6 leads" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/ccc37e11-63bf-47bc-9bad-e58225987ed1.png"} alt="Fortinet 48‑port switch unboxed for enterprise network upgrade" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/559aceef-edbc-4c53-89ae-d87c79764faf.png"} alt="Fortinet secure network appliance ready for configuration" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/b3544e80-a122-4b88-bec8-e0ccfe6052db.png"} alt="Server rack with switches, SFP modules and fiber patch panel" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/e0e8c61d-c893-4e54-a4ff-85c2f3d7793b.png"} alt="Fiber optic termination and MikroTik Cloud Core Router" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/1bd456a5-cd99-42ff-9893-843a55d08814.png"} alt="Neatly wired rack with Netgear switch and patch panels" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/f9c1434a-ac22-41a1-8713-73e03a832b8d.png"} alt="Patch panel with labeled Cat6 cables in distribution rack" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/de7314d9-a55e-493e-8d71-b30badcab599.png"} alt="Organized rack with MikroTik switches and blue Cat6 jumpers" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/e34b216a-0325-45dd-996f-b6b727e542ee.png"} alt="Data room rack with structured cabling trunking and patch panels" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/c74a7f86-838a-46db-9d88-ac8b192d5941.png"} alt="Wall-mounted patch panels with neatly dressed blue Cat6 leads" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/5bd4b5cb-7c24-44d6-8df7-89a1f3a76c1f.png"} alt="Check Point security gateway firewall on network rack" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Fibre Builds for Estates, Malls & Commercial Developments</h2>
            <div className="grid lg:grid-cols-2 gap-8 mt-4 text-muted-foreground">
              <div className="prose prose-sm max-w-none">
                <p>Rolling out fibre for a new estate, mall or commercial space? We design and deliver end‑to‑end FTTx builds — from POP to risers to tenant hand‑offs — built to standards and ready for ISPs.</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Site audits, route design, and duct/tray planning for backbones and distribution</li>
                  <li>Riser and floor distribution with labelled patching, trays and terminations</li>
                  <li>FTTB/FTTH design, splicing, testing and light‑level verification</li>
                  <li>Compliance to SANS and landlord/HOA specifications with as‑built documentation</li>
                  <li>ISP coordination for WAN handover, CPE installation and go‑live</li>
                </ul>
              </div>
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-foreground">Student Accommodation Technology Solutions</h3>
                <p>High‑density, secure connectivity purpose‑built for residences and PBSA operators.</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Managed Wi‑Fi with captive portal and per‑room network isolation</li>
                  <li>Bandwidth management, fair‑use and content filtering where required</li>
                  <li>AP density planning, wired backhaul and fibre uplinks for stability</li>
                  <li>Integrated CCTV and access control for common areas</li>
                  <li>Resident onboarding and support playbooks for smooth operations</li>
                </ul>
                <div className="mt-6 flex gap-3">
                  <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Discuss a Build</Button></Link>
                  <Link to="/projects" className="inline-flex"><Button variant="outline">View Projects</Button></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Our Track Record</h2>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-2">
              <li>Structured cabling and rack builds for corporate offices</li>
              <li>Campus Wi‑Fi deployment with a high‑capacity fibre backbone</li>
              <li>Multi‑site student accommodation network upgrades</li>
              <li>National retail branch network rollouts and Wi‑Fi coverage</li>
              <li>Server rack installations with high‑performance switch configurations</li>
              <li>Enterprise security gateway deployments for threat‑proof connectivity</li>
            </ul>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Move, Build, Upgrade</h2>
            <div className="grid lg:grid-cols-2 gap-8 mt-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>Office Moves & New‑Build Fit‑Outs – Server relocations, patching, and network cutovers handled end‑to‑end.</li>
                <li>Network Rebuilds – Replace legacy switches, re‑cable, and reconfigure with minimal disruption.</li>
                <li>Contractor Partnerships – We assist construction and MEP contractors in delivering modern, code‑compliant networks.</li>
                <li>New Client Onboarding – Discovery, design, and deployment based on tried‑and‑tested playbooks.</li>
              </ul>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>Whether you are expanding to a new building or consolidating sites, our team plans and executes changes with clear runbooks, after‑hours windows, and rollback strategies to protect business operations.</p>
                <div className="mt-6 flex gap-3">
                  <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Plan My Move</Button></Link>
                  <Link to="/support-deals" className="inline-flex"><Button variant="outline">See Support Deals</Button></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Why Choose Siyakha Technology?</h2>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground space-y-2">
              <li>Nationwide Service — From Johannesburg to Cape Town to Durban, we deliver consistent quality everywhere.</li>
              <li>Vendor-Certified Engineers — Skilled in Fortinet, MikroTik, Cisco, Ubiquiti, and more.</li>
              <li>Minimal Downtime Approach — Strategic scheduling and precise execution keep your teams productive.</li>
              <li>Future-Ready Design — Infrastructure built to scale with your business and support emerging technologies.</li>
            </ul>
          </div>
        </section>

        <section className="py-8 md:py-12 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Infrastructure & Networking FAQs</h2>
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="q1">
                <AccordionTrigger>Do you work with schools and multi-site businesses?</AccordionTrigger>
                <AccordionContent>
                  Yes. We design and deploy networks for schools, campuses and multi-branch organisations across South Africa and internationally.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>Can you upgrade our existing Wi‑Fi and cabling?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. We audit, redesign and upgrade legacy Wi‑Fi and cabling to modern, secure standards — all with minimal downtime.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>Do you provide ongoing maintenance?</AccordionTrigger>
                <AccordionContent>
                  Yes. We offer Service Level Agreements (SLAs) with proactive monitoring, regular updates and rapid onsite support.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Let’s Build Your Next Network</h2>
            <p className="text-muted-foreground mt-2">Request a Quote today or Log a Call with our support team to discuss your project.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Quote</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
              <a href="tel:+27815012993" className="inline-flex"><Button variant="secondary">Call 081 501 2993</Button></a>
              <a href="mailto:info@siyakhatechnology.co.za" className="inline-flex"><Button variant="ghost">Email Us</Button></a>
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

export default InfrastructureAndNetworking;
