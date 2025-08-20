import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";

const HERO_IMAGE = "/lovable-uploads/f345d1c0-6383-4a5c-9188-81c8ae221932.png";

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

const PelicanClubBahrainProject = () => {
  const title = "The Pelican Club Bahrain – Remote IT Support";
  const description =
    "International remote IT support: printer setup, troubleshooting, remote desktop assistance, and optimized workflows for The Pelican Club Bahrain.";
  const canonical = `${window.location.origin}/projects/pelican-club-bahrain`;

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "International Remote IT Support – The Pelican Club Bahrain",
    serviceType: "Remote IT Support",
    provider: {
      "@type": "Organization",
      name: "Siyakha Technology",
    },
    areaServed: {
      "@type": "Country",
      name: "Bahrain",
    },
    description:
      "Remote printer troubleshooting, installation & configuration, responsive remote desktop support, and printing workflow optimization.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "IT Support Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Remote printer troubleshooting" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Printer installation & drivers" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Remote desktop support" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Printing workflow optimization" } },
      ],
    },
    image: `${window.location.origin}${HERO_IMAGE}`,
    url: canonical,
  }), [canonical]);

  useEffect(() => {
    document.title = title;
    setNameMeta("description", description);

    // Canonical
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);

    // Open Graph
    setOg("og:title", title);
    setOg("og:description", description);
    setOg("og:type", "article");
    setOg("og:url", canonical);
    setOg("og:image", `${window.location.origin}${HERO_IMAGE}`);
  }, [title, description, canonical]);

  const roleItems = [
    {
      title: "Remote printer issue resolution",
      desc: "Diagnosed and resolved printer-related issues without on-site intervention, ensuring seamless daily operations.",
    },
    {
      title: "Installation & configuration",
      desc: "Installed and configured new printers with full driver setup and network integration into existing infrastructure.",
    },
    {
      title: "Responsive remote desktop support",
      desc: "Provided efficient remote desktop troubleshooting across hardware and network challenges.",
    },
    {
      title: "Optimized printing workflows",
      desc: "Ensured stable, user-friendly printing systems for administrative and operations teams.",
    },
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
                  <BreadcrumbLink href="#" aria-current="page">Pelican Club Bahrain</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4">
                  The Pelican Club Bahrain – International Remote IT Support
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                  We delivered reliable, international remote support to a premier hospitality venue—keeping their operations smooth with expert printer setup,
                  troubleshooting, and responsive remote assistance.
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
                    alt="Pelican Club Bahrain interior – remote IT support case study hero"
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
                      The Pelican Club in Bahrain is renowned for its refined atmosphere and exceptional guest experience. Our team provided end-to-end international
                      remote IT support to ensure their printing and desktop environments operated flawlessly without requiring on-site presence.
                    </p>
                    <p>
                      From quick diagnostics to full device onboarding and network integration, we supported their administrative and operations staff with
                      responsive, professional assistance—no matter the distance.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary">At a Glance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>International remote support</li>
                      <li>Hospitality operations environment</li>
                      <li>Network-integrated printing</li>
                      <li>Rapid response and resolution</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Our Role */}
        <section className="py-12 lg:py-16 bg-secondary">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6">Our Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roleItems.map((item, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">{item.desc}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Outcome */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Outcome</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  Our responsive, remote-first approach enabled The Pelican Club Bahrain to maintain operational continuity and service excellence. Printing
                  systems were onboarded, stabilized, and optimized for daily use by both administrative and operations staff.
                </p>
                <p>
                  This engagement demonstrates how Siyakha Technology delivers dependable international support, ensuring business-critical systems remain
                  available and efficient—wherever our clients are.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="py-12 lg:py-16 bg-secondary/60">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <h3 className="text-2xl md:text-3xl font-semibold text-primary mb-4">Need dependable remote IT support?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              We help organizations operate smoothly with fast, professional assistance—from printer setup to full remote desktop support.
            </p>
            <Button className="cta-primary" asChild>
              <Link to="/contact">Get a consultation</Link>
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

export default PelicanClubBahrainProject;
