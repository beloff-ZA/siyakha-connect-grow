import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";

const HERO_IMAGE = "/lovable-uploads/7c314536-73bf-4ae1-b7e3-ccceee5d640e.png";

function setOg(property: string, content: string) {
  let meta = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function setNameMeta(name: string, content: string) {
  let meta = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

const CampusKeyProject = () => {
  const title = "CampusKey – Network Infrastructure Overhaul";
  const description =
    "Multi-campus upgrade: Cat6 cabling, fibre backbone, and 500+ APs across SA for high-speed, reliable student Wi‑Fi.";
  const canonical = `${window.location.origin}/projects/campuskey-network-overhaul`;

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Project",
    name: "CampusKey – National Network Infrastructure Overhaul",
    description:
      "Comprehensive network infrastructure upgrade across multiple CampusKey sites: Cat6 cabling, fibre backbone, 500+ APs, managed switching, and ongoing support.",
    image: `${window.location.origin}${HERO_IMAGE}`,
    url: canonical,
    location: [
      { "@type": "City", name: "Cape Town" },
      { "@type": "City", name: "Stellenbosch" },
      { "@type": "City", name: "Port Elizabeth" },
      { "@type": "City", name: "Pretoria" },
      { "@type": "City", name: "Bloemfontein (remote)" },
    ],
    keywords: [
      "CampusKey",
      "Network Infrastructure",
      "Fibre Backbone",
      "Cat6 Cabling",
      "Ubiquiti Access Points",
      "Student Accommodation WiFi",
    ],
  }), [canonical]);

  useEffect(() => {
    document.title = title;
    setNameMeta("description", description);

    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);

    setOg("og:title", title);
    setOg("og:description", description);
    setOg("og:type", "article");
    setOg("og:url", canonical);
    setOg("og:image", `${window.location.origin}${HERO_IMAGE}`);
  }, [title, description, canonical]);

  const locations = [
    "Cape Town",
    "Stellenbosch",
    "Port Elizabeth (PE)",
    "Pretoria",
    "Remote support for Bloemfontein",
  ];

  const scope = [
    "Installation of Cat6 structured cabling throughout all residences and common areas",
    "Fibre backbone deployment for high-speed data transmission between network zones",
    "Deployment of 500+ Ubiquiti access points ensuring fast, stable Wi‑Fi",
    "Installation and configuration of advanced network switches for performance and bandwidth management",
    "Structured cabling layouts for future scalability and simplified maintenance",
    "Ongoing remote and on-site support for long-term reliability",
  ];

  const results = [
    "Improved internet speed and coverage across all campuses",
    "Centralized network management",
    "Future-ready infrastructure with minimal downtime and maintenance requirements",
  ];

  return (
    <main className="bg-background">
      <article>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 lg:px-6 pt-16 pb-10">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" aria-current="page">CampusKey</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4">
                  CampusKey – National Network Infrastructure Overhaul
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                  We delivered a comprehensive, multi-campus network upgrade for CampusKey across South Africa—combining Cat6 cabling, a resilient fibre backbone,
                  and over 500 Ubiquiti access points for reliable, high-speed connectivity.
                </p>
                <div className="flex gap-3">
                  <Button asChild className="cta-primary">
                    <Link to="/contact">Request a consultation</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/" aria-label="Back to home">Back to home</Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <AspectRatio ratio={16/9} className="rounded-lg overflow-hidden shadow-md relative">
                  <img
                    src={HERO_IMAGE}
                    alt="CampusKey student accommodation – network infrastructure project hero"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" aria-hidden="true" />
                </AspectRatio>
              </div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="py-12 lg:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary">Project Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground space-y-4">
                    <p>
                      We modernized CampusKey’s network across multiple campuses with future-ready structured cabling, a high-capacity fibre backbone,
                      centrally managed switching, and pervasive Wi‑Fi coverage in residences and common areas.
                    </p>
                    <p>
                      The result is a scalable, high-speed infrastructure that supports streaming, online classes, remote work, and smart devices—reliably and securely.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary">Locations Covered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      {locations.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Scope & Deliverables */}
        <section className="py-12 lg:py-16 bg-secondary">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6">Scope of Work & Deliverables</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {scope.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Results */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {results.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="py-12 lg:py-16 bg-secondary/60">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <h3 className="text-2xl md:text-3xl font-semibold text-primary mb-4">Need an enterprise-grade campus network?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              From cabling to Wi‑Fi to centralized management, we deliver reliable connectivity at scale.
            </p>
            <Button className="cta-primary" asChild>
              <Link to="/contact">Request a consultation</Link>
            </Button>
          </div>
        </section>

        {/* JSON-LD */}
        <script type="application/ld+json" suppressHydrationWarning>
          {JSON.stringify(jsonLd)}
        </script>
      </article>
    </main>
  );
};

export default CampusKeyProject;
