import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Services from "@/components/Services";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

const ServicesIndex = () => {
  useEffect(() => {
    const title = "Services | Siyakha Technology Solutions";
    const description = "Explore all ICT services: infrastructure & networking, security & surveillance, cloud & edge solutions, and smart collaboration tools.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/services`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services`);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="All ICT services overview" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Our Services</h1>
            <p className="text-muted-foreground mt-3 max-w-3xl">Comprehensive ICT solutions: from cabling and Wi‑Fi to CCTV, cloud migrations and collaboration platforms.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Consultation</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
          </div>
        </section>

        {/* Services List */}
        <Services />

        {/* Johannesburg links */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-2xl font-semibold text-foreground">Popular in Johannesburg</h2>
            <p className="text-muted-foreground mt-2">Explore our dedicated local service pages for Johannesburg businesses.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/it-company-johannesburg"><Button variant="secondary">IT Company Johannesburg</Button></Link>
              <Link to="/managed-it-services-johannesburg"><Button variant="secondary">Managed IT Services</Button></Link>
              <Link to="/it-support-johannesburg"><Button variant="secondary">IT Support</Button></Link>
              <Link to="/cybersecurity-services-johannesburg"><Button variant="secondary">Cybersecurity</Button></Link>
              <Link to="/cloud-services-johannesburg"><Button variant="secondary">Cloud Services</Button></Link>
            </div>
          </div>
        </section>

        {/* Cross-links */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <p className="text-muted-foreground mb-6">Looking for international SLAs and overflow support?</p>
            <Link to="/support-deals" className="inline-flex"><Button variant="secondary">Explore Global Support Deals</Button></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesIndex;
