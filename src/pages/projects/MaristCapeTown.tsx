import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";

const IMG_1 = "/lovable-uploads/329436ed-9b85-46bd-9a90-9921225137c1.png";
const IMG_2 = "/lovable-uploads/702d31a8-30a3-4dc4-880f-1366edaf8911.png";
const IMG_3 = "/lovable-uploads/4ce3794c-caeb-4109-b893-cf137d3054d1.png";
const IMG_4 = "/lovable-uploads/de3c5edc-ea87-4242-bbb0-8782b25a22ec.png";

const MaristCapeTownProject = () => {
  useEffect(() => {
    document.title = "St Joseph's Marist College – Campus CCTV Overhaul (Cape Town) | Siyakha";
    const desc = "Deployment of a 55‑camera, fibre‑backed CCTV solution covering the entire campus at St Joseph's Marist College in Cape Town.";
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    const canonicalHref = window.location.origin + "/projects/st-josephs-marist-cape-town-cctv";
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;

    const setOg = (property: string, content: string) => {
      let el = document.querySelector(`meta[property='${property}']`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setOg("og:title", document.title);
    setOg("og:description", desc);
    setOg("og:type", "article");
    setOg("og:image", IMG_1);
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: "St Joseph's Marist College – Campus CCTV Overhaul (Cape Town)",
    description:
      "55 IP cameras on a fibre backbone providing full‑campus coverage with centralized management and remote monitoring.",
    url: typeof window !== "undefined" ? window.location.href : "",
    image: [IMG_1, IMG_2, IMG_3, IMG_4],
    locationCreated: { "@type": "Place", name: "Cape Town, Western Cape, South Africa" },
    about: ["CCTV", "Fibre", "Campus Security", "Remote Monitoring"],
    author: { "@type": "Organization", name: "Siyakha Technology" }
  };

  const challenges = [
    "Aging, fragmented CCTV estate with limited coverage and control",
    "Blind spots across facilities and outdoor areas",
    "No centralized video management or reliable remote access",
    "Legacy cabling not suited for high‑resolution IP cameras"
  ];

  const solutions = [
    {
      title: "55‑Camera IP System",
      description: "Deployed 55 high‑definition IP cameras matched to indoor and outdoor environments."
    },
    {
      title: "Fibre Backbone",
      description: "Campus‑wide fibre network to ensure bandwidth, reliability, and low latency."
    },
    {
      title: "Centralized VMS",
      description: "Unified video management with role‑based access and remote monitoring."
    },
    {
      title: "Coverage Optimisation",
      description: "Strategic placement to remove blind spots across fields, pool area, and perimeter."
    }
  ];

  const gallery = [IMG_1, IMG_2, IMG_3, IMG_4];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <img src={IMG_1} alt="St Joseph's Marist College campus" className="absolute inset-0 w-full h-full object-cover" decoding="async" />
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="relative z-10 container mx-auto px-4 lg:px-6 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" aria-current="page">St Joseph's Marist College (Cape Town)</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">St Joseph's Marist College – Campus CCTV Overhaul</h1>
          <div className="flex flex-wrap items-center gap-3 text-white/90">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">
              <MapPin className="w-4 h-4 mr-1" /> Cape Town, Western Cape
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">Education</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">55 Cameras · Fibre Backbone</span>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-muted-foreground max-w-3xl">
            We deployed a 55‑camera CCTV solution built on a resilient campus fibre network, delivering full coverage and centralized control across the entire site.
          </div>
          <div className="flex gap-3">
            <Button className="cta-primary">Request a Consultation</Button>
            <Button variant="outline" className="cta-secondary" onClick={() => (window.location.href = "/projects")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">The Challenge</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((item, i) => (
                <Card key={i} className="border border-border">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-accent" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Our Solution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {solutions.map((s, i) => (
                <Card key={i} className="service-card">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-1">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">On‑Site Deployment Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {gallery.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-border">
                <img src={src} alt={`CCTV deployment photo ${i + 1}`} className="w-full h-80 object-cover" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">Looking to modernize campus security?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">We design fibre‑ready, centrally managed CCTV tailored to your site's layout and risk profile.</p>
          <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary px-8 py-4">Book My Free Consultation</Button></Link>
        </div>
      </section>
    </main>
  );
};

export default MaristCapeTownProject;
